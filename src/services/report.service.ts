import setupDatabase from '../database';
import { Database } from 'sqlite';

interface CalendarEvent {
  title: string;
  start: string;
  allDay: boolean;
}

interface BarberStat {
  barber_id: number;
  barber_name: string;
  base_salary: number;
  total_generated: number;
  payment: number;
}

interface ReportData {
  events: CalendarEvent[];
  stats: BarberStat[];
}

export class ReportService {
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

  async generateReport(year: number, month: number): Promise<ReportData> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    // 1. Get calendar events (total sales per day)
    const calendarEvents = await this.db.all(
      `
            SELECT 
                strftime('%Y-%m-%d', sale_date) as date,
                SUM(total_amount) as total
            FROM sales
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY date
        `,
      startDate,
      endDate,
    );

    const events: CalendarEvent[] = calendarEvents.map((e: any) => ({
      title: `S/ ${e.total.toFixed(2)}`,
      start: e.date,
      allDay: true,
    }));

    // 2. Get barber payment stats
    const barbers = await this.db.all<
      { id: number; name: string; base_salary: number }[]
    >('SELECT id, name, base_salary FROM barbers');
    const salesByBarber = await this.db.all<
      { barber_id: number; total_generated: number }[]
    >(
      `
            SELECT barber_id, SUM(total_amount) as total_generated
            FROM sales
            WHERE sale_date BETWEEN ? AND ?
            GROUP BY barber_id
        `,
      startDate,
      endDate,
    );

    const stats: BarberStat[] = barbers.map((barber) => {
      const saleInfo = salesByBarber.find((s) => s.barber_id === barber.id);
      const total_generated = saleInfo ? saleInfo.total_generated : 0;

      const BASE_SALARY = 1250;
      const COMMISSION_THRESHOLD = 2500;
      let payment = BASE_SALARY;

      if (total_generated > COMMISSION_THRESHOLD) {
        payment = total_generated * 0.5;
      }

      return {
        barber_id: barber.id,
        barber_name: barber.name,
        base_salary: BASE_SALARY, // Show the base salary used for calculation
        total_generated: total_generated,
        payment: payment,
      };
    });

    return { events, stats };
  }

  async getComprehensiveSales(filters: {
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let query = `
      SELECT
          s.id AS sale_id,
          s.sale_date,
          s.total_amount,
          s.customer_name,
          s.payment_method,
          GROUP_CONCAT(si.item_name || ' (' || si.price_at_sale || ')', ', ') AS items_sold
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.paymentMethod) {
      query += ` AND s.payment_method = ?`;
      params.push(filters.paymentMethod);
    }
    if (filters.startDate) {
      query += ` AND s.sale_date >= ?`;
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ` AND s.sale_date <= ?`;
      params.push(filters.endDate);
    }

    query += ` GROUP BY s.id ORDER BY s.sale_date DESC`;

    return await this.db.all(query, params);
  }

  public async getServicesProductsSales(
    startDate: string,
    endDate: string
  ): Promise<{ type: string; total_sales_by_type: number }[]> {
    const query = `
      SELECT
        si.item_type as type,
        SUM(si.price_at_sale) as total_sales_by_type
      FROM sale_items si
      JOIN services s ON si.service_id = s.id
      JOIN sales sa ON si.sale_id = sa.id
      WHERE sa.sale_date BETWEEN ? AND ?
      GROUP BY si.item_type
      ORDER BY type;
    `;
    const params = [startDate, endDate];
    return this.db.all(query, params);
  }

  public async getBarberPayments(
    startDate: string,
    endDate: string
  ): Promise<{ barber_id: number; barber_name: string; total_service_sales: number; payment: number }[]> {
    const query = `
      SELECT
        b.id AS barber_id,
        b.name AS barber_name,
        COALESCE(SUM(si.price_at_sale), 0) AS total_service_sales
      FROM barbers b
      LEFT JOIN reservations r ON b.id = r.barber_id
      LEFT JOIN sales s ON r.id = s.reservation_id AND s.sale_date BETWEEN ? AND ?
      LEFT JOIN sale_items si ON s.id = si.sale_id AND si.item_type = 'service'
      GROUP BY
        b.id, b.name
      ORDER BY
        total_service_sales DESC;
    `;
    const params = [startDate, endDate]; // Parameters for s.sale_date BETWEEN ? AND ?
    const results = await this.db.all(query, params);

    return results.map(row => {
      const total_service_sales = row.total_service_sales; // COALESCE already handles 0
      let payment = 0;
      if (total_service_sales > 2500) {
        payment = total_service_sales / 2;
      } else {
        payment = 1250;
      }
      return {
        barber_id: row.barber_id,
        barber_name: row.barber_name,
        total_service_sales: total_service_sales,
        payment: payment,
      };
    });
  }

  public async getDetailedBarberServiceSales(filters: {
    barberId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any[]> {
    let query = `
      SELECT
        b.name AS barber_name,
        svc.name AS service_name,
        sa.sale_date,
        si.price_at_sale AS service_price
      FROM sales sa
      JOIN sale_items si ON sa.id = si.sale_id
      JOIN services svc ON si.service_id = svc.id
      LEFT JOIN reservations r ON sa.reservation_id = r.id
      LEFT JOIN barbers b ON r.barber_id = b.id
      WHERE si.item_type = 'service'
    `;
    const params: (string | number)[] = [];

    if (filters.barberId) {
      query += ` AND b.id = ?`;
      params.push(filters.barberId);
    }
    if (filters.startDate && filters.endDate) {
      query += ` AND sa.sale_date BETWEEN ? AND ?`;
      params.push(filters.startDate, filters.endDate);
    } else if (filters.startDate) {
      query += ` AND sa.sale_date >= ?`;
      params.push(filters.startDate);
    } else if (filters.endDate) {
      query += ` AND sa.sale_date <= ?`;
      params.push(filters.endDate);
    }

    query += ` ORDER BY sa.sale_date DESC, b.name ASC`;

    return this.db.all(query, params);
  }

  public async getStationUsage(startDate: string, endDate: string): Promise<any[]> {
    const query = `
      SELECT
        st.name AS station_name,
        COUNT(s.id) AS total_sales,
        SUM(s.total_amount) AS total_revenue
      FROM stations st
      LEFT JOIN reservations r ON st.id = r.station_id
      LEFT JOIN sales s ON r.id = s.reservation_id AND date(s.sale_date) BETWEEN ? AND ?
      GROUP BY st.id, st.name
      ORDER BY st.name ASC;
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  public async getCustomerFrequency(startDate: string, endDate: string): Promise<any[]> {
    const query = `
      SELECT
        customer_name,
        COUNT(id) AS visit_count,
        SUM(total_amount) AS total_spent
      FROM sales
      WHERE sale_date BETWEEN ? AND ? AND customer_name IS NOT NULL AND customer_name != ''
      GROUP BY customer_name
      ORDER BY visit_count DESC, total_spent DESC;
    `;
    return this.db.all(query, [startDate, endDate]);
  }

  public async getPeakHours(startDate: string, endDate: string): Promise<any[]> {
    const query = `
      SELECT
        strftime('%H', start_time) AS hour,
        COUNT(id) AS reservation_count
      FROM reservations
      WHERE start_time BETWEEN ? AND ?
      GROUP BY hour
      ORDER BY hour ASC;
    `;
    return this.db.all(query, [`${startDate} 00:00:00`, `${endDate} 23:59:59`]);
  }
}

export const reportService = new ReportService();
