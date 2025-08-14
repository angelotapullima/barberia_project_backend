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
export const getAllSales = async (): Promise<Sale[]> => {
  const { rows: sales } = await pool.query(`
    SELECT 
        s.id, s.sale_date, s.total_amount, s.customer_name, s.payment_method, s.reservation_id
    FROM sales s
    ORDER BY s.sale_date DESC
  `);

  for (const sale of sales) {
    sale.sale_items = await getSaleItems(sale.id!);
  }
  return sales;
};

export const getSaleById = async (id: number): Promise<Sale | null> => {
    const { rows } = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    const sale = rows[0];
    if (sale) {
        sale.sale_items = await getSaleItems(id);
    }
    return sale || null;
}

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

    for (const item of sale_items) {
      await client.query(
        'INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          saleId,
          item.service_id,
          item.item_type,
          item.item_name,
          item.price,
          item.price_at_sale,
          item.quantity,
        ],
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