import getPool from '../database';

const pool = getPool();

export const getBarberCommissions = async (): Promise<any[]> => {
  const result = await pool.query('SELECT * FROM barber_commissions ORDER BY period_end DESC, barber_id ASC');
  return result.rows;
};