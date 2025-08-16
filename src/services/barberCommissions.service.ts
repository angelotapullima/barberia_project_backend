import getPool from '../database';
import dayjs from 'dayjs';

const pool = getPool();

/**
 * Calculates the potential monthly commission details for all barbers on-the-fly.
 * It checks if a payment has already been made and returns the status accordingly.
 */
export const getMonthlyBarberCommissions = async (year: number, month: number): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
    const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');

    // 1. Get all active barbers
    const barbersResult = await client.query('SELECT id, name, base_salary FROM barbers WHERE is_active = true');
    const barbers = barbersResult.rows;

    const reportData = [];

    for (const barber of barbers) {
      // 2. Check if a commission has already been paid for this period
      const existingCommissionRes = await client.query(
        'SELECT * FROM barber_commissions WHERE barber_id = $1 AND period_start = $2 AND period_end = $3',
        [barber.id, periodStart, periodEnd]
      );

      if (existingCommissionRes.rows.length > 0) {
        // If payment exists, use its data and mark status as paid
        const paidCommission = existingCommissionRes.rows[0];
        reportData.push({
          barber_id: barber.id,
          barber_name: barber.name,
          period_start: paidCommission.period_start,
          period_end: paidCommission.period_end,
          base_salary: parseFloat(paidCommission.base_salary),
          services_total: parseFloat(paidCommission.services_total),
          total_payment: parseFloat(paidCommission.total_payment),
          status: paidCommission.status, // 'paid'
        });
      } else {
        // If no payment exists, calculate potential payment
        const servicesTotalResult = await client.query(
          'SELECT COALESCE(SUM(service_amount), 0) AS total FROM sales WHERE barber_id = $1 AND sale_date >= $2 AND sale_date <= $3',
          [barber.id, periodStart, periodEnd]
        );
        const servicesTotal = parseFloat(servicesTotalResult.rows[0].total);

        const commissionAmount = servicesTotal >= (barber.base_salary * 2)
          ? servicesTotal / 2
          : barber.base_salary;

        const advancesTotalResult = await client.query(
          'SELECT COALESCE(SUM(amount), 0) AS total FROM barber_advances WHERE barber_id = $1 AND date >= $2 AND date <= $3',
          [barber.id, periodStart, periodEnd]
        );
        const advancesTotal = parseFloat(advancesTotalResult.rows[0].total);

        const totalPayment = commissionAmount - advancesTotal;

        reportData.push({
          barber_id: barber.id,
          barber_name: barber.name,
          period_start: periodStart,
          period_end: periodEnd,
          base_salary: barber.base_salary,
          services_total: servicesTotal,
          total_payment: totalPayment,
          status: 'pending',
        });
      }
    }
    return reportData.sort((a, b) => a.barber_name.localeCompare(b.barber_name));
  } catch (error) {
    console.error('Error getting monthly barber commissions:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Creates and finalizes a barber's payment for a specific period.
 * This performs the calculation and inserts a new record into barber_commissions.
 */
export const createAndFinalizePayment = async (barberId: number, year: number, month: number): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').format('YYYY-MM-DD');
    const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').format('YYYY-MM-DD');

    // Security Validation: Prevent payment before the period ends.
    if (dayjs().isBefore(dayjs(periodEnd).endOf('day'))) {
      throw new Error('Payment cannot be finalized before the commission period has ended.');
    }

    // Check if payment already exists
    const existingCommissionRes = await client.query(
      'SELECT id FROM barber_commissions WHERE barber_id = $1 AND period_start = $2 AND period_end = $3',
      [barberId, periodStart, periodEnd]
    );

    if (existingCommissionRes.rows.length > 0) {
      throw new Error('A payment for this barber and period has already been registered.');
    }

    // Get barber info
    const barberResult = await client.query('SELECT base_salary FROM barbers WHERE id = $1', [barberId]);
    if (barberResult.rows.length === 0) throw new Error('Barber not found');
    const barber = barberResult.rows[0];

    // Perform final calculation
    const servicesTotalResult = await client.query(
      'SELECT COALESCE(SUM(service_amount), 0) AS total FROM sales WHERE barber_id = $1 AND sale_date >= $2 AND sale_date <= $3',
      [barberId, periodStart, periodEnd]
    );
    const servicesTotal = parseFloat(servicesTotalResult.rows[0].total);

    const commissionAmount = servicesTotal >= (barber.base_salary * 2)
      ? servicesTotal / 2
      : barber.base_salary;

    const advancesTotalResult = await client.query(
      'SELECT COALESCE(SUM(amount), 0) AS total FROM barber_advances WHERE barber_id = $1 AND date >= $2 AND date <= $3',
      [barberId, periodStart, periodEnd]
    );
    const advancesTotal = parseFloat(advancesTotalResult.rows[0].total);
    const totalPayment = commissionAmount - advancesTotal;

    // Create the commission record with 'paid' status
    const result = await client.query(
      `INSERT INTO barber_commissions (
        barber_id, period_start, period_end, base_salary,
        services_total, commission_amount, total_payment, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [barberId, periodStart, periodEnd, barber.base_salary, servicesTotal, commissionAmount, totalPayment, 'paid']
    );

    await client.query('COMMIT');
    return result.rows[0] || null;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating and finalizing payment:', error);
    throw error;
  } finally {
    client.release();
  }
};


/**
 * Gets all advances for a barber for a specific month.
 */
export const getBarberAdvancesForMonth = async (barberId: number, year: number, month: number): Promise<any[]> => {
  const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
  const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').toDate();

  const result = await pool.query(
    `SELECT id, amount, date, notes FROM barber_advances
     WHERE barber_id = $1 AND date >= $2 AND date <= $3
     ORDER BY date ASC`,
    [barberId, periodStart, periodEnd]
  );
  return result.rows;
};

/**
 * Gets the detailed list of paid services for a barber for a specific month from sales records.
 */
export const getBarberServicesForMonth = async (barberId: number, year: number, month: number): Promise<any[]> => {
  const periodStart = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month').toDate();
  const periodEnd = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month').toDate();

  const result = await pool.query(
    `SELECT
      s.id as sale_id,
      s.sale_date,
      si.total_price as service_amount,
      si.item_name as service_name
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    WHERE s.barber_id = $1
      AND si.item_type = 'service'
      AND s.sale_date >= $2
      AND s.sale_date <= $3
    ORDER BY s.sale_date ASC`,
    [barberId, periodStart, periodEnd]
  );
  return result.rows;
};