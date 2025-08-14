import setupDatabase from '../database';
import { Database } from 'sqlite';

interface Station {
  id?: number;
  name: string;
}

export class StationService {
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

  async getAllStations(): Promise<Station[]> {
    const stations = await this.db.all('SELECT * FROM stations ORDER BY name');
    return stations;
  }

  async createStation(station: Station): Promise<Station | { error: string }> {
    const { name } = station;

    const stationCount = await this.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM stations',
    );
    if (stationCount && stationCount.count >= 10) {
      return { error: 'No se pueden crear más de 10 estaciones.' };
    }

    try {
      const result = await this.db.run(
        'INSERT INTO stations (name) VALUES (?)',
        name,
      );
      return { id: result.lastID, name };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return { error: 'El nombre de la estación ya existe.' };
      }
      throw error; // Re-throw other errors
    }
  }

  async updateStation(
    id: number,
    station: Station,
  ): Promise<Station | null | { error: string }> {
    const { name } = station;
    try {
      const result = await this.db.run(
        'UPDATE stations SET name = ? WHERE id = ?',
        [name, id],
      );
      if (result.changes === 0) {
        return null; // Station not found
      }
      return { id, name };
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        return { error: 'El nombre de la estación ya existe.' };
      }
      throw error; // Re-throw other errors
    }
  }

  async deleteStation(id: number): Promise<boolean | { error: string }> {
    // Check if any barber is assigned to this station
    const barber = await this.db.get(
      'SELECT id FROM barbers WHERE station_id = ?',
      id,
    );
    if (barber) {
      return {
        error:
          'No se puede eliminar la estación porque está asignada a un barbero.',
      };
    }

    const result = await this.db.run('DELETE FROM stations WHERE id = ?', id);
    return result.changes !== undefined && result.changes > 0;
  }
}

export const stationService = new StationService();
