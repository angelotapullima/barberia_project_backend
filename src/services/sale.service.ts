import setupDatabase from '../database';
import { Database } from 'sqlite';
import { draftSaleService } from './draftSale.service'; // New import

interface SaleItem {
  id?: number;
  sale_id?: number;
  item_id: number;
  price: number;
  price_at_sale: number;
  item_name?: string; // Change from 'name' to 'item_name'
  type?: string;
  quantity: number;
}

interface Sale {
  id?: number;
  sale_date: string;
  total_amount: number;
  customer_name?: string;
  payment_method?: string;
  reservation_id?: number;
  sale_items: SaleItem[];
}

export class SaleService {
  private db!: Database;

  constructor(db?: Database) {
    if (db) {
      this.db = db;
    } else {
      setupDatabase().then((db: Database) => {
        this.db = db;
      });
    }
  }

  private async getSaleItems(saleId: number): Promise<SaleItem[]> {
    return this.db.all(
      'SELECT id, service_id, item_type, item_name, price, price_at_sale, quantity FROM sale_items WHERE sale_id = ?',
      saleId,
    );
  }

  async getAllSales(): Promise<Sale[]> {
    const sales = await this.db.all(`
      SELECT 
          s.id, s.sale_date, s.total_amount, s.customer_name, s.payment_method, s.reservation_id
      FROM sales s
      ORDER BY s.sale_date DESC
    `);

    for (const sale of sales) {
      sale.services = await this.getSaleItems(sale.id!);
    }
    return sales;
  }

  async getFilteredSales(
    filterType: string,
    filterValue: string | number,
  ): Promise<Sale[]> {
    let query = `
      SELECT 
          s.id, s.sale_date, s.total_amount, s.customer_name, s.payment_method, s.reservation_id
      FROM sales s
    `;
    const params: (string | number)[] = [];

    switch (filterType) {
      case 'day':
        query += ` WHERE DATE(s.sale_date) = DATE(?)`;
        params.push(filterValue as string);
        break;
      case 'week':
        query += ` WHERE STRFTIME('%Y-%W', s.sale_date) = STRFTIME('%Y-%W', ?)`;
        params.push(filterValue as string);
        break;
      case 'month':
        query += ` WHERE STRFTIME('%Y-%m', s.sale_date) = STRFTIME('%Y-%m', ?)`;
        params.push(filterValue as string);
        break;
      default:
        // No filter, return all sales (handled by getAllSales if no filter is applied)
        break;
    }

    query += ` ORDER BY s.sale_date DESC`;

    const sales = await this.db.all(query, ...params);
    for (const sale of sales) {
      sale.services = await this.getSaleItems(sale.id!);
    }
    return sales;
  }

  async createSale(sale: Sale): Promise<Sale> {
    const {
      sale_date,
      sale_items,
      total_amount,
      customer_name,
      payment_method,
      reservation_id,
    } = sale;

    // Check if any service is being sold without a reservation_id
    const hasServiceItems = sale_items.some(item => item.type === 'service');
    if (hasServiceItems && !reservation_id) {
      throw new Error('Sales containing services must be linked to a reservation.');
    }

    await this.db.run('BEGIN TRANSACTION');

    try {
      const saleResult = await this.db.run(
        'INSERT INTO sales (sale_date, total_amount, customer_name, payment_method, reservation_id) VALUES (?, ?, ?, ?, ?)',
        [
          sale_date,
          total_amount,
          customer_name || 'Cliente Varios',
          payment_method,
          reservation_id || null,
        ],
      );
      const saleId = saleResult.lastID!;

      const stmt = await this.db.prepare(
        'INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      );
      for (const item of sale_items) {
        const serviceId = item.type === 'service' ? item.id : null;
        await stmt.run(
          saleId,
          serviceId,
          item.type,
          item.item_name,
          item.price_at_sale,
          item.price_at_sale,
          item.quantity,
        );
      }
      await stmt.finalize();

      if (reservation_id) {
        await this.db.run('UPDATE reservations SET status = ? WHERE id = ?', [
          'completed',
          reservation_id,
        ]);
        await draftSaleService.deleteDraftSale(reservation_id);
      }

      await this.db.run('COMMIT');

      return { id: saleId, ...sale };
    } catch (error) {
      await this.db.run('ROLLBACK');
      console.error('Error creating sale:', error);
      throw new Error('Failed to record sale.');
    }
  }

  async getSaleByReservationId(
    reservationId: number,
  ): Promise<Sale | undefined> {
    const sale = await this.db.get(
      `
      SELECT 
          s.id, s.sale_date, s.total_amount, s.customer_name, s.payment_method, s.reservation_id
      FROM sales s
      WHERE s.reservation_id = ?
    `,
      reservationId,
    );

    if (sale) {
      sale.sale_items = await this.getSaleItems(sale.id!); // Assuming getSaleItems fetches sale_items
    }
    return sale;
  }

  async getSalesSummaryByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<{ date: string; total: number }[]> {
    const query = `
      SELECT
          strftime('%Y-%m-%d', sale_date) as date,
          SUM(total_amount) as total
      FROM sales
      WHERE sale_date BETWEEN ? AND ?
      GROUP BY date
      ORDER BY date ASC
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  async getDailySalesByType(
    startDate: string,
    endDate: string,
  ): Promise<{ date: string; type: string; total: number }[]> {
    const query = `
      SELECT
          strftime('%Y-%m-%d', sa.sale_date) as date,
          si.item_type as type,
          SUM(si.price_at_sale) as total
      FROM sales sa
      JOIN sale_items si ON sa.id = si.sale_id
      WHERE sa.sale_date BETWEEN ? AND ?
      GROUP BY date, type
      ORDER BY date ASC, type ASC
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  

  async getSalesSummaryByService(
    startDate: string,
    endDate: string,
  ): Promise<{ service_name: string; total_sales: number }[]> {
    const query = `
      SELECT
          s.name as service_name,
          SUM(si.price_at_sale) as total_sales
      FROM sales sa
      JOIN sale_items si ON sa.id = si.sale_id
      JOIN services s ON si.service_id = s.id
      WHERE sa.sale_date BETWEEN ? AND ?
      GROUP BY s.name
      ORDER BY total_sales DESC
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  async getSalesSummaryByPaymentMethod(
    startDate: string,
    endDate: string,
  ): Promise<{ payment_method: string; total_sales: number }[]> {
    const query = `
      SELECT
          payment_method,
          SUM(total_amount) as total_sales
      FROM sales
      WHERE sale_date BETWEEN ? AND ?
      GROUP BY payment_method
      ORDER BY total_sales DESC
    `;
    return this.db.all(query, [startDate, endDate]);
  }
}

export const saleService = new SaleService();
