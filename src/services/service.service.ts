import setupDatabase from '../database';
import { Database } from 'sqlite';

interface Service {
  id?: number;
  name: string;
  price: number;
  duration_minutes: number; // Added
  type?: string;
  stock_quantity?: number;
  min_stock_level?: number;
}

export class ServiceService {
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

  async getAllServices(): Promise<Service[]> {
    const services = await this.db.all('SELECT * FROM services ORDER BY name');
    return services;
  }

  async createService(service: Service): Promise<Service> {
    const {
      name,
      price,
      duration_minutes,
      type = 'service',
      stock_quantity = 0,
      min_stock_level = 0,
    } = service;
    const result = await this.db.run(
      'INSERT INTO services (name, price, duration_minutes, type, stock_quantity, min_stock_level) VALUES (?, ?, ?, ?, ?, ?)',
      [name, price, duration_minutes, type, stock_quantity, min_stock_level],
    );
    return {
      id: result.lastID,
      name,
      price,
      duration_minutes,
      type,
      stock_quantity,
      min_stock_level,
    };
  }

  async updateService(id: number, service: Service): Promise<Service | null> {
    const {
      name,
      price,
      duration_minutes,
      type = 'service',
      stock_quantity = 0,
      min_stock_level = 0,
    } = service;
    const result = await this.db.run(
      'UPDATE services SET name = ?, price = ?, duration_minutes = ?, type = ?, stock_quantity = ?, min_stock_level = ? WHERE id = ?',
      [
        name,
        price,
        duration_minutes,
        type,
        stock_quantity,
        min_stock_level,
        id,
      ],
    );
    if (result.changes === 0) {
      return null;
    }
    return {
      id,
      name,
      price,
      duration_minutes,
      type,
      stock_quantity,
      min_stock_level,
    };
  }

  async deleteService(id: number): Promise<boolean | { error: string }> {
    const saleItem = await this.db.get(
      'SELECT id FROM sale_items WHERE service_id = ?',
      id,
    );
    if (saleItem) {
      return {
        error:
          'No se puede eliminar el servicio porque está asociado a una venta.',
      };
    }

    const result = await this.db.run('DELETE FROM services WHERE id = ?', id);
    return result.changes !== undefined && result.changes > 0;
  }

  async getProducts(): Promise<Service[]> {
    const products = await this.db.all(
      'SELECT * FROM services WHERE type = ? ORDER BY name',
      ['product'],
    );
    return products;
  }

  async updateProductStock(
    id: number,
    quantity: number,
  ): Promise<Service | null> {
    const result = await this.db.run(
      'UPDATE services SET stock_quantity = ? WHERE id = ? AND type = ?',
      [quantity, id, 'product'],
    );
    if (result.changes === 0) {
      return null;
    }
    const updatedService = await this.db.get(
      'SELECT * FROM services WHERE id = ?',
      id,
    );
    return updatedService || null;
  }

  async getLowStockProducts(): Promise<Service[]> {
    const lowStockProducts = await this.db.all(
      'SELECT * FROM services WHERE type = ? AND stock_quantity <= min_stock_level ORDER BY name',
      ['product'],
    );
    return lowStockProducts;
  }

  async getInventoryReportSummary(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    totalInventoryValue: number;
  }> {
    const totalProductsResult = await this.db.get(
      'SELECT COUNT(*) as count FROM services WHERE type = ?',
      ['product'],
    );
    const totalProducts = totalProductsResult ? totalProductsResult.count : 0;

    const lowStockCountResult = await this.db.get(
      'SELECT COUNT(*) as count FROM services WHERE type = ? AND stock_quantity <= min_stock_level',
      ['product'],
    );
    const lowStockCount = lowStockCountResult ? lowStockCountResult.count : 0;

    const totalInventoryValueResult = await this.db.get(
      'SELECT SUM(stock_quantity * price) as value FROM services WHERE type = ?',
      ['product'],
    );
    const totalInventoryValue = totalInventoryValueResult
      ? totalInventoryValueResult.value
      : 0;

    return { totalProducts, lowStockCount, totalInventoryValue };
  }
}

export const serviceService = new ServiceService();
