import setup from '../database';
import { deleteDraftSale } from './draftSale.service';
import { Pool, PoolClient } from 'pg';

const pool = setup();

// --- INTERFACES ---
export interface SaleItem {
  id?: number;
  sale_id?: number;
  item_id: number; // This is the service or product id
  service_id?: number | null; // Explicitly for services
  item_type?: string;
  item_name?: string;
  price: number;
  price_at_sale: number;
  quantity: number;
}

export interface Sale {
  id?: number;
  sale_date: string;
  total_amount: number;
  customer_name?: string;
  payment_method?: string;
  reservation_id?: number | null;
  sale_items: SaleItem[];
}

// --- PRIVATE FUNCTIONS ---
const getSaleItems = async (saleId: number, client: Pool | PoolClient = pool): Promise<SaleItem[]> => {
  const { rows } = await client.query(
    'SELECT id, service_id, item_type, item_name, price, price_at_sale, quantity FROM sale_items WHERE sale_id = $1',
    [saleId],
  );
  return rows;
};

// --- PUBLIC API ---
export const getAllSales = async (page: number, limit: number): Promise<{ sales: Sale[]; total: number }> => {
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(`
    SELECT
        s.id AS sale_id,
        s.sale_date,
        s.total_amount,
        s.customer_name,
        s.payment_method,
        s.reservation_id,
        si.id AS item_id,
        si.service_id AS sale_item_product_service_id,
        si.service_id,
        si.item_type,
        si.item_name,
        si.price,
        si.price_at_sale,
        si.quantity
    FROM sales s
    LEFT JOIN sale_items si ON s.id = si.sale_id
    ORDER BY s.sale_date DESC, si.id ASC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  const salesMap = new Map<number, Sale>();

  for (const row of rows) {
    if (!salesMap.has(row.sale_id)) {
      salesMap.set(row.sale_id, {
        id: row.sale_id,
        sale_date: row.sale_date,
        total_amount: Number(row.total_amount),
        customer_name: row.customer_name,
        payment_method: row.payment_method,
        reservation_id: row.reservation_id,
        sale_items: [],
      });
    }

    if (row.item_id) { // Only add sale item if it exists (for sales without items)
      const sale = salesMap.get(row.sale_id)!;
      sale.sale_items.push({
        id: row.item_id,
        item_id: row.sale_item_product_service_id,
        service_id: row.service_id,
        item_type: row.item_type,
        item_name: row.item_name,
        price: Number(row.price),
        price_at_sale: Number(row.price_at_sale),
        quantity: Number(row.quantity),
      });
    }
  }

  const totalResult = await pool.query('SELECT COUNT(*) FROM sales');
  const total = Number(totalResult.rows[0].count);

  return { sales: Array.from(salesMap.values()), total };
};

export const getSaleById = async (id: number): Promise<Sale | null> => {
    const { rows } = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    const sale = rows[0];
    if (sale) {
        sale.sale_items = await getSaleItems(id);
    }
    return sale || null;
}

export const getSalesSummaryByDateRange = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      DATE(sale_date) as date,
      SUM(total_amount) as total
    FROM sales
    WHERE sale_date::date BETWEEN $1 AND $2
    GROUP BY DATE(sale_date)
    ORDER BY date ASC;
    `,
    [startDate, endDate]
  );
  return rows.map(row => ({ ...row, total: Number(row.total) }));
};

export const getSalesSummaryByService = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      si.item_name as service_name,
      SUM(si.price_at_sale * si.quantity) as total_sales
    FROM sale_items si
    JOIN sales s ON si.sale_id = s.id
    WHERE si.item_type = 'service' AND s.sale_date::date BETWEEN $1 AND $2
    GROUP BY si.item_name
    ORDER BY total_sales DESC;
    `,
    [startDate, endDate]
  );
  return rows.map(row => ({ ...row, total_sales: Number(row.total_sales) }));
};

export const createSale = async (sale: Omit<Sale, 'id'>, existingClient?: PoolClient): Promise<Sale> => {
  const {
    sale_date,
    sale_items,
    total_amount,
    customer_name,
    payment_method,
    reservation_id,
  } = sale;

  const hasServiceItems = sale_items.some((item) => item.item_type === 'service');
  if (hasServiceItems && !reservation_id) {
    throw new Error('Las ventas que contienen servicios deben estar vinculadas a una reserva.');
  }

  const client = existingClient || await pool.connect();

  try {
    if (!existingClient) {
      await client.query('BEGIN');
    }

    const saleResult = await client.query(
      'INSERT INTO sales (sale_date, total_amount, customer_name, payment_method, reservation_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [
        sale_date,
        total_amount,
        customer_name || 'Cliente Varios',
        payment_method,
        reservation_id || null,
      ],
    );
    const saleId = saleResult.rows[0].id;

    if (sale_items.length > 0) {
      const itemValues = sale_items.map((item, index) => {
        const offset = index * 7; // 7 columns per item
        return `(${offset + 1}, ${offset + 2}, ${offset + 3}, ${offset + 4}, ${offset + 5}, ${offset + 6}, ${offset + 7})`;
      }).join(', ');

      const itemParams = sale_items.flatMap(item => [
        saleId,
        item.service_id,
        item.item_type,
        item.item_name,
        item.price,
        item.price_at_sale,
        item.quantity,
      ]);

      await client.query(
        `INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES ${itemValues}`,
        itemParams,
      );
    }

    if (reservation_id) {
      await deleteDraftSale(reservation_id, client);
    }

    if (!existingClient) {
      await client.query('COMMIT');
    }

    return { id: saleId, ...sale };
  } catch (error) {
    if (!existingClient) {
      await client.query('ROLLBACK');
    }
    console.error('Error creating sale:', error);
    throw new Error('No se pudo registrar la venta.');
  } finally {
    if (!existingClient) {
      client.release();
    }
  }
};

export const getSaleByReservationId = async (
  reservationId: number,
): Promise<Sale | undefined> => {
  const { rows } = await pool.query(
    `
    SELECT 
        s.id, s.sale_date, s.total_amount, s.customer_name, s.payment_method, s.reservation_id
    FROM sales s
    WHERE s.reservation_id = $1
  `,
    [reservationId],
  );

  const sale = rows[0];
  if (sale) {
    sale.sale_items = await getSaleItems(sale.id!); 
  }
  return sale;
};