import setup from '../database';
import bcrypt from 'bcrypt';

const pool = setup();

// --- INTERFACE ---
interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Password hash, optional in return values
  role: string;
}

// --- PUBLIC API ---

export const findByEmail = async (email: string): Promise<User | undefined> => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email],
  );
  return rows[0];
};

export const findById = async (id: number): Promise<Omit<User, 'password'> | undefined> => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id],
  );
  return rows[0];
};

export const updatePassword = async (
  id: number,
  newPasswordHash: string,
): Promise<boolean> => {
  const { rowCount } = await pool.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, id],
  );
  return (rowCount ?? 0) > 0;
};

export const getAllUsers = async (): Promise<Omit<User, 'password'>[]> => {
  const { rows } = await pool.query('SELECT id, name, email, role FROM users ORDER BY name');
  return rows;
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<Omit<User, 'password'> | {error: string}> => {
  const { name, email, password, role } = userData;
  if (!password) {
      return { error: 'Password is required' };
  }
  const password_hash = await bcrypt.hash(password, 10);
  
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, password_hash, role],
    );
    return rows[0];
  } catch (error: any) {
      if (error.code === '23505') { // Unique violation for email
          return { error: 'El correo electrónico ya está en uso.' };
      }
      throw error;
  }
};

export const updateUser = async (
  id: number,
  userData: Partial<Omit<User, 'id' | 'password'>>,
): Promise<Omit<User, 'password'> | null> => {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined) {
          fields.push(`${key} = $${paramIndex++}`);
          params.push(value);
      }
  }

  if (fields.length === 0) {
    return findById(id).then(user => user || null);
  }

  params.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING id, name, email, role`;
  
  try {
    const { rows } = await pool.query(sql, params);
    return rows[0] || null;
  } catch (error: any) {
      if (error.code === '23505') {
          throw new Error('El correo electrónico ya está en uso.');
      }
      throw error;
  }
};

export const deleteUser = async (id: number): Promise<boolean> => {
  const { rowCount } = await pool.query('DELETE FROM users WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
};