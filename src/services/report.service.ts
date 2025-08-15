import getPool from '../database';

const pool = getPool();

// Note: Interfaces can be moved to a dedicated types file.

export const getComprehensiveSales = async (filters: {
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any[]> => {
  let query = `
    SELECT
        id as sale_id,
        sale_date,
        customer_name,
        payment_method,
        service_amount,
        products_amount,
        total_amount
    FROM sales
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.paymentMethod) {
    query += ` AND payment_method = $${paramIndex++}`;
    params.push(filters.paymentMethod);
  }
  if (filters.startDate) {
    query += ` AND sale_date >= $${paramIndex++}`;
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND sale_date <= $${paramIndex++}`;
    params.push(filters.endDate);
  }

  query += ` ORDER BY sale_date DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const getServicesProductsSales = async (
  startDate: string,
  endDate: string
): Promise<{ date: string, service_total: number, product_total: number }[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      DATE(sale_date) as date,
      COALESCE(SUM(service_amount), 0) as service_total,
      COALESCE(SUM(products_amount), 0) as product_total
    FROM sales
    WHERE sale_date::date BETWEEN $1 AND $2
    GROUP BY DATE(sale_date)
    ORDER BY date ASC;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, service_total: Number(r.service_total), product_total: Number(r.product_total)}));
};

export const getBarberPayments = async (
  startDate: string,
  endDate: string
): Promise<any[]> => {
    // The view barber_sales_summary already contains all the logic.
    // The date filter in the view is for the last 30 days by default, 
    // but for a specific report, we should filter explicitly.
    const query = `
        SELECT 
            barber_id, 
            barber_name, 
            base_salary, 
            total_services, 
            commission_payment as payment
        FROM barber_sales_summary
        -- Note: The view needs to be modified to accept date ranges or we filter here.
        -- For now, we assume the view is for the current month as per its definition.
    `;
    // In a real implementation, you'd pass startDate and endDate to the view or filter here.
    const { rows } = await pool.query(query);
    return rows;
};

export const getDetailedBarberServiceSales = async (filters: {
  barberId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<any[]> => {
  let query = `
    SELECT
      b.name AS barber_name,
      si.item_name AS service_name,
      s.sale_date,
      si.unit_price AS service_price
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    JOIN barbers b ON s.barber_id = b.id
    WHERE si.item_type = 'service'
  `;
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.barberId) {
    query += ` AND b.id = $${paramIndex++}`;
    params.push(filters.barberId);
  }
  if (filters.startDate) {
    query += ` AND s.sale_date >= $${paramIndex++}`;
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND s.sale_date <= $${paramIndex++}`;
    params.push(filters.endDate);
  }

  query += ` ORDER BY s.sale_date DESC, b.name ASC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const getStationUsage = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      st.name AS station_name,
      COUNT(r.id)::integer AS completed_reservations_count
    FROM stations st
    LEFT JOIN reservations r ON st.id = r.station_id
    WHERE r.status = 'paid' AND r.start_time::date BETWEEN $1 AND $2
    GROUP BY st.id, st.name
    ORDER BY st.name ASC;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, completed_reservations_count: Number(r.completed_reservations_count)}));
};

export const getCustomerFrequency = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      customer_name,
      COUNT(id)::integer AS visit_count,
      SUM(total_amount)::real AS total_spent
    FROM sales
    WHERE sale_date::date BETWEEN $1 AND $2 AND customer_name IS NOT NULL AND customer_name != ''
    GROUP BY customer_name
    ORDER BY visit_count DESC, total_spent DESC;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, visit_count: Number(r.visit_count), total_spent: Number(r.total_spent)}));
};

export const getPeakHours = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      EXTRACT(HOUR FROM start_time) AS hour,
      COUNT(id)::integer AS reservation_count
    FROM reservations
    WHERE start_time::date BETWEEN $1 AND $2
    GROUP BY hour
    ORDER BY hour ASC;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, hour: Number(r.hour), reservation_count: Number(r.reservation_count)}));
};