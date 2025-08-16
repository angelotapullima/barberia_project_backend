import getPool from '../database';
import dayjs from 'dayjs';
import { getSetting } from './setting.service';

const pool = getPool();

export const calculateMonthlyCommissions = async (year: number, month: number): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
    const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').toDate();

    const [barbersResult] = await Promise.all([
      client.query('SELECT id, name, base_salary FROM barbers WHERE is_active = true'),
    ]);

    const barbers = barbersResult.rows;

    for (const barber of barbers) {
      // Calculate total services for the month
      const servicesTotalResult = await client.query(
        'SELECT COALESCE(SUM(service_amount), 0) AS total FROM sales WHERE barber_id = $1 AND sale_date >= $2 AND sale_date <= $3',
        [barber.id, periodStart, periodEnd]
      );
      const servicesTotal = parseFloat(servicesTotalResult.rows[0].total);

      // Commission amount is simply the total services for now, as per user's request
      const commissionAmount = servicesTotal;

      // Calculate total advances for the month
      const advancesTotalResult = await client.query(
        'SELECT COALESCE(SUM(amount), 0) AS total FROM barber_advances WHERE barber_id = $1 AND date >= $2 AND date <= $3',
        [barber.id, periodStart, periodEnd]
      );
      const advancesTotal = parseFloat(advancesTotalResult.rows[0].total);

      const totalPayment = commissionAmount - advancesTotal;

      // Insert or update barber_commissions
      await client.query(
        `INSERT INTO barber_commissions (
          barber_id, period_start, period_end, base_salary,
          services_total, commission_amount, total_payment, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (barber_id, period_start, period_end) DO UPDATE SET
          base_salary = EXCLUDED.base_salary,
          services_total = EXCLUDED.services_total,
          commission_amount = EXCLUDED.commission_amount,
          total_payment = EXCLUDED.total_payment,
          status = EXCLUDED.status, -- Keep status as pending unless explicitly paid
          created_at = NOW() -- Update created_at on conflict
        `,
        [barber.id, periodStart, periodEnd, barber.base_salary, servicesTotal, commissionAmount, totalPayment, 'pending']
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error calculating monthly commissions:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const finalizeBarberPayment = async (commissionId: number): Promise<any> => {
  const result = await pool.query(
    'UPDATE barber_commissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    ['paid', commissionId]
  );
  return result.rows[0] || null;
};

export const getBarberAdvancesForMonth = async (barberId: number, year: number, month: number): Promise<any[]> => {
  const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
  const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').toDate();

  const result = await pool.query(
    `SELECT
      id,
      amount,
      date,
      notes
    FROM
      barber_advances
    WHERE
      barber_id = $1 AND date >= $2 AND date <= $3
    ORDER BY
      date ASC`,
    [barberId, periodStart, periodEnd]
  );
  return result.rows;
};

export const getBarberServicesForMonth = async (barberId: number, year: number, month: number): Promise<any[]> => {
  const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
  const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').toDate();

  const result = await pool.query(
    `SELECT
      s.id as sale_id,
      s.sale_date,
      s.service_amount,
      serv.name as service_name,
      serv.duration_minutes
    FROM
      sales s
    JOIN
      reservations r ON s.reservation_id = r.id
    JOIN
      services serv ON r.service_id = serv.id
    WHERE
      s.barber_id = $1 AND s.sale_date >= $2 AND s.sale_date <= $3
    ORDER BY
      s.sale_date ASC`,
    [barberId, periodStart, periodEnd]
  );
  return result.rows;
};

export const getMonthlyBarberCommissions = async (year: number, month: number): Promise<any[]> => {
  const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
  const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').toDate();

  const result = await pool.query(
    `SELECT
      bc.*,
      b.name as barber_name
    FROM
      barber_commissions bc
    JOIN
      barbers b ON bc.barber_id = b.id
    WHERE
      bc.period_start = $1 AND bc.period_end = $2
    ORDER BY
      b.name ASC`,
    [periodStart, periodEnd]
  );
  return result.rows;
};

export const getBarberCommissions = async (): Promise<any[]> => {
  const result = await pool.query('SELECT * FROM barber_commissions ORDER BY period_end DESC, barber_id ASC');
  return result.rows;
};