import getPool from '../database';
import { Service } from '../models/service.model';

const pool = getPool();

export const getAllServices = async (): Promise<Service[]> => {
  const result = await pool.query('SELECT * FROM services WHERE is_active = true ORDER BY name ASC');
  return result.rows;
};

export const getServiceById = async (id: number): Promise<Service | null> => {
  const result = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
  const { name, description, price, duration_minutes, is_active } = service;
  const result = await pool.query(
    'INSERT INTO services (name, description, price, duration_minutes, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [name, description, price, duration_minutes, is_active ?? true]
  );
  return result.rows[0];
};

export const updateService = async (id: number, service: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>): Promise<Service | null> => {
  const fields = Object.keys(service).map((key, index) => `"${key}" = $${index + 1}`)
    .join(', ');
  const values = Object.values(service);

  if (fields.length === 0) {
    return getServiceById(id);
  }

  const query = `UPDATE services SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`;
  const result = await pool.query(query, [...values, id]);

  return result.rows[0] || null;
};

// Soft delete by setting is_active to false
export const deleteService = async (id: number): Promise<Service | null> => {
  const result = await pool.query(
    'UPDATE services SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};