import getPool from '../database';

const pool = getPool();

export const getAllPayments = async (): Promise<any[]> => {
  const result = await pool.query('SELECT * FROM barber_commissions ORDER BY period_start DESC');
  return result.rows;
};

export const updatePayment = async (id: number, payment: { status: string }): Promise<any | null> => {
  const { status } = payment;
  const result = await pool.query(
    'UPDATE barber_commissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] || null;
};
