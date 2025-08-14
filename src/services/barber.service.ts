import setup from '../database';

const pool = setup();

export const getAllBarbers = async () => {
  const result = await pool.query('SELECT * FROM barbers ORDER BY id ASC');
  return result.rows;
};

export const getBarberById = async (id: number) => {
  const result = await pool.query('SELECT * FROM barbers WHERE id = $1', [id]);
  return result.rows[0];
};

export const createBarber = async (barber: any) => {
  const { name, email, phone, specialty, photo_url, station_id, base_salary } = barber;
  const result = await pool.query(
    'INSERT INTO barbers (name, email, phone, specialty, photo_url, station_id, base_salary) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    [name, email, phone, specialty, photo_url, station_id, base_salary]
  );
  return { id: result.rows[0].id, ...barber };
};

export const updateBarber = async (id: number, barber: any) => {
  const { name, email, phone, specialty, photo_url, station_id, base_salary } = barber;
  await pool.query(
    'UPDATE barbers SET name = $1, email = $2, phone = $3, specialty = $4, photo_url = $5, station_id = $6, base_salary = $7, updated_at = NOW() WHERE id = $8',
    [name, email, phone, specialty, photo_url, station_id, base_salary, id]
  );
  return { id, ...barber };
};

export const deleteBarber = async (id: number) => {
  await pool.query('DELETE FROM barbers WHERE id = $1', [id]);
  return { message: 'Barber deleted successfully' };
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