import getPool from '../database';
import { Station } from '../models/station.model';

const pool = getPool();

export const getAllStations = async (): Promise<Station[]> => {
  const result = await pool.query('SELECT * FROM stations WHERE is_active = true ORDER BY name');
  return result.rows;
};

export const getStationById = async (id: number): Promise<Station | null> => {
  const result = await pool.query('SELECT * FROM stations WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createStation = async (station: Omit<Station, 'id' | 'created_at' | 'updated_at'>): Promise<Station | { error: string }> => {
  const { name, description, is_active } = station;

  const stationCountResult = await pool.query('SELECT COUNT(*) as count FROM stations');
  const stationCount = stationCountResult.rows[0];

  if (stationCount && stationCount.count >= 10) {
    return { error: 'No se pueden crear más de 10 estaciones.' };
  }

  try {
    const result = await pool.query(
      'INSERT INTO stations (name, description, is_active) VALUES ($1, $2, $3) RETURNING *',
      [name, description, is_active ?? true],
    );
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return { error: 'El nombre de la estación ya existe.' };
    }
    console.error('Error creating station:', error);
    throw new Error('Error al crear la estación.');
  }
};

export const updateStation = async (
  id: number,
  station: Partial<Omit<Station, 'id' | 'created_at' | 'updated_at'>>,
): Promise<Station | null | { error: string }> => {
  const fields = Object.keys(station).map((key, index) => `"${key}" = $${index + 1}`)
    .join(', ');
  const values = Object.values(station);

  if (fields.length === 0) {
    return getStationById(id);
  }

  const query = `UPDATE stations SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`;
  try {
    const result = await pool.query(query, [...values, id]);
    if (result.rowCount === 0) {
      return null; // Station not found
    }
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      return { error: 'El nombre de la estación ya existe.' };
    }
    console.error(`Error updating station ${id}:`, error);
    throw new Error('Error al actualizar la estación.');
  }
};

// Soft delete by setting is_active to false
export const deleteStation = async (id: number): Promise<Station | null | { error: string }> => {
  // Check if any barber is assigned to this station
  const barberResult = await pool.query(
    'SELECT id FROM barbers WHERE station_id = $1 AND is_active = true',
    [id],
  );
  if (barberResult.rows.length > 0) {
    return { error: 'No se puede eliminar la estación porque está asignada a un barbero activo.' };
  }

  const result = await pool.query(
    'UPDATE stations SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id],
  );
  
  if (result.rowCount === 0) {
    return null; // Station not found
  }
  
  return result.rows[0];
};
