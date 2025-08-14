import setupDatabase from '../database';
import { Database } from 'sqlite';

// Interfaz para tipar el objeto de usuario
interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // La contraseña es opcional en los objetos que devolvemos
  role: string;
}

class UserService {
  private db!: Database;

  constructor() {
    setupDatabase().then((db) => {
      this.db = db;
    });
  }

  // Encuentra un usuario por su email. Crucial para el login.
  public async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.db.get(
      'SELECT * FROM users WHERE email = ?',
      email,
    );
    return user;
  }

  // Encuentra un usuario por su ID. Útil para obtener el perfil.
  public async findById(id: number): Promise<User | undefined> {
    // Excluimos la contraseña por seguridad
    const user = await this.db.get(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      id,
    );
    return user;
  }

  // Actualiza la contraseña de un usuario
  public async updatePassword(
    id: number,
    newPasswordHash: string,
  ): Promise<boolean> {
    const result = await this.db.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [newPasswordHash, id],
    );
    return (result.changes ?? 0) > 0;
  }

  // Obtiene todos los usuarios (excluyendo contraseñas)
  public async getAllUsers(): Promise<User[]> {
    const users = await this.db.all('SELECT id, name, email, role FROM users');
    return users;
  }

  // Crea un nuevo usuario
  public async createUser(userData: {
    name: string;
    email: string;
    password_hash: string;
    role: string;
  }): Promise<User> {
    const { name, email, password_hash, role } = userData;
    const result = await this.db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role],
    );
    if (typeof result.lastID !== 'number') {
      throw new Error('Failed to retrieve last inserted user ID.');
    }
    return { id: result.lastID, name, email, role };
  }

  // Actualiza los detalles de un usuario
  public async updateUser(
    id: number,
    userData: { name?: string; email?: string; role?: string },
  ): Promise<boolean> {
    const fields = [];
    const params = [];

    if (userData.name !== undefined) {
      fields.push('name = ?');
      params.push(userData.name);
    }
    if (userData.email !== undefined) {
      fields.push('email = ?');
      params.push(userData.email);
    }
    if (userData.role !== undefined) {
      fields.push('role = ?');
      params.push(userData.role);
    }

    if (fields.length === 0) {
      return false; // No hay nada que actualizar
    }

    params.push(id);
    const result = await this.db.run(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params,
    );
    return (result.changes ?? 0) > 0;
  }

  // Elimina un usuario
  public async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM users WHERE id = ?', id);
    return (result.changes ?? 0) > 0;
  }
}

export const userService = new UserService();
