import getPool from '../database';
import { Barber } from '../models/barber.model';

const pool = getPool();

export const getAllBarbers = async (): Promise<Barber[]> => {
  const result = await pool.query('SELECT * FROM barbers WHERE is_active = true ORDER BY name ASC');
  return result.rows;
};

export const getBarberById = async (id: number): Promise<Barber | null> => {
  const result = await pool.query('SELECT * FROM barbers WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createBarber = async (barber: Omit<Barber, 'id' | 'created_at' | 'updated_at'>): Promise<Barber> => {
  const { name, email, phone, specialty, photo_url, station_id, base_salary, is_active } = barber;
  const result = await pool.query(
    'INSERT INTO barbers (name, email, phone, specialty, photo_url, station_id, base_salary, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [name, email, phone, specialty, photo_url, station_id, base_salary, is_active ?? true]
  );
  return result.rows[0];
};

export const updateBarber = async (id: number, barber: Partial<Omit<Barber, 'id' | 'created_at' | 'updated_at'>>): Promise<Barber | null> => {
  const fields = Object.keys(barber).map((key, index) => `"${key}" = $${index + 1}`)
    .join(', ');
  const values = Object.values(barber);

  if (fields.length === 0) {
    return getBarberById(id);
  }

  const query = `UPDATE barbers SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`;
  const result = await pool.query(query, [...values, id]);

  return result.rows[0] || null;
};

// Soft delete by setting is_active to false
export const deleteBarber = async (id: number): Promise<Barber | null> => {
  const result = await pool.query(
    'UPDATE barbers SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};

export const getBarberAvailability = async (barberId: number, date: string) => {
  const query = `
    SELECT start_time, end_time
    FROM reservations
    WHERE barber_id = $1 AND DATE(start_time) = $2
  `;
  const result = await pool.query(query, [barberId, date]);
  return result.rows;
};