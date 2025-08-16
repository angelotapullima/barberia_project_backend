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
    const query = `
        SELECT 
            b.id as barber_id, 
            b.name as barber_name, 
            b.base_salary, 
            COALESCE(SUM(s.service_amount), 0) as total_services,
            CASE
                WHEN COALESCE(SUM(s.service_amount), 0) > (b.base_salary * 2)
                THEN COALESCE(SUM(s.service_amount), 0) / 2
                ELSE b.base_salary
            END as payment
        FROM barbers b
        LEFT JOIN sales s ON b.id = s.barber_id AND s.sale_date BETWEEN $1 AND $2
        GROUP BY b.id, b.name, b.base_salary;
    `;
    const { rows } = await pool.query(query, [startDate, endDate]);
    return rows;
};

export const generateBarberPayments = async (startDate: string, endDate: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const barbersResult = await client.query('SELECT id, base_salary FROM barbers WHERE is_active = true');
    const barbers = barbersResult.rows;

    for (const barber of barbers) {
      const serviceAmountResult = await client.query(
        'SELECT COALESCE(SUM(service_amount), 0) as total FROM sales WHERE barber_id = $1 AND sale_date BETWEEN $2 AND $3',
        [barber.id, startDate, endDate]
      );
      const serviceAmount = parseFloat(serviceAmountResult.rows[0].total);

      const commission = serviceAmount > (barber.base_salary * 2) ? serviceAmount / 2 : barber.base_salary;

      const advancesResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) as total FROM barber_advances WHERE barber_id = $1 AND date BETWEEN $2 AND $3 AND commission_id IS NULL',
        [barber.id, startDate, endDate]
      );
      const advancesAmount = parseFloat(advancesResult.rows[0].total);

      const totalPayment = commission - advancesAmount;

      const commissionResult = await client.query(
        'INSERT INTO barber_commissions (barber_id, period_start, period_end, base_salary, services_total, commission_amount, total_payment) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
        [barber.id, startDate, endDate, barber.base_salary, serviceAmount, commission, totalPayment]
      );
      const commissionId = commissionResult.rows[0].id;

      await client.query(
        'UPDATE barber_advances SET commission_id = $1 WHERE barber_id = $2 AND date BETWEEN $3 AND $4 AND commission_id IS NULL',
        [commissionId, barber.id, startDate, endDate]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
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