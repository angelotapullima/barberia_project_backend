import setupDatabase from '../database';
import { Database } from 'sqlite';

interface Setting {
  setting_key: string;
  setting_value: string;
}

class SettingService {
  private db!: Database;

  constructor() {
    setupDatabase().then((db) => {
      this.db = db;
    });
  }

  public async getSetting(key: string): Promise<string | undefined> {
    const setting = await this.db.get(
      'SELECT setting_value FROM settings WHERE setting_key = ?',
      key,
    );
    return setting ? setting.setting_value : undefined;
  }

  public async setSetting(key: string, value: string): Promise<boolean> {
    const result = await this.db.run(
      'INSERT OR REPLACE INTO settings (setting_key, setting_value) VALUES (?, ?)',
      [key, value],
    );
    return (result.changes ?? 0) > 0;
  }

  public async getAllSettings(): Promise<Setting[]> {
    const settings = await this.db.all(
      'SELECT setting_key, setting_value FROM settings',
    );
    return settings;
  }
}

export const settingService = new SettingService();
