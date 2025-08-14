import setupDatabase from '../database';
import { Database } from 'sqlite';

interface Barber {
  id?: number;
  name: string;
  email?: string; // Added email
  station_id?: number;
  base_salary?: number;
  station_name?: string;
}

export class BarberService {
  private db!: Database;

  constructor(db?: Database) {
    if (db) {
      this.db = db;
    } else {
      setupDatabase().then((db: Database) => {
        this.db = db;
      });
    }
  }

  async getAllBarbers(): Promise<Barber[]> {
    const barbers = await this.db.all('SELECT b.* FROM barbers b');
    return barbers;
  }

  async createBarber(barber: Barber): Promise<Barber> {
    const { name, email, station_id, base_salary } = barber;
    const result = await this.db.run(
      'INSERT INTO barbers (name, email, station_id, base_salary) VALUES (?, ?, ?, ?)',
      [name, email || null, station_id || null, base_salary || 1300],
    );
    return {
      id: result.lastID,
      name,
      email,
      station_id,
      base_salary: base_salary || 1300,
    };
  }

  async updateBarber(id: number, barber: Barber): Promise<Barber | null> {
    const { name, email, station_id, base_salary } = barber;
    const result = await this.db.run(
      'UPDATE barbers SET name = ?, email = ?, station_id = ?, base_salary = ? WHERE id = ?',
      [name, email, station_id, base_salary, id],
    );
    if (result.changes === 0) {
      return null;
    }
    return { id, name, email, station_id, base_salary };
  }

  async deleteBarber(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM barbers WHERE id = ?', id);
    return result.changes !== undefined && result.changes > 0;
  }
}

export const barberService = new BarberService();
