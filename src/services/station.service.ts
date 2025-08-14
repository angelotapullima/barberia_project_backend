import setup from '../database';

const pool = setup();

export interface Station { // Added export keyword
  id?: number;
  name: string;
  description?: string;
}

export const getAllStations = async (): Promise<Station[]> => {
  const result = await pool.query('SELECT * FROM stations ORDER BY name');
  return result.rows;
};

export const createStation = async (station: Station): Promise<Station | { error: string }> => {
  const { name, description } = station;

  const stationCountResult = await pool.query('SELECT COUNT(*) as count FROM stations');
  const stationCount = stationCountResult.rows[0];

  if (stationCount && stationCount.count >= 10) {
    return { error: 'No se pueden crear más de 10 estaciones.' };
  }

  try {
    const result = await pool.query(
      'INSERT INTO stations (name, description) VALUES ($1, $2) RETURNING id',
      [name, description],
    );
    return { id: result.rows[0].id, ...station };
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
  station: Station,
): Promise<Station | null | { error: string }> => {
  const { name, description } = station;
  try {
    const result = await pool.query(
      'UPDATE stations SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [name, description, id],
    );
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

export const deleteStation = async (id: number): Promise<{ message: string } | { error: string }> => {
  // Check if any barber is assigned to this station
  const barberResult = await pool.query(
    'SELECT id FROM barbers WHERE station_id = $1',
    [id],
  );
  if (barberResult.rows.length > 0) {
    return {
      error:
        'No se puede eliminar la estación porque está asignada a un barbero.',
    };
  }

  const result = await pool.query('DELETE FROM stations WHERE id = $1', [id]);
  
  if (result.rowCount === 0) {
      return { error: 'Station not found' };
  }
  
  return { message: 'Station deleted successfully' };
};
