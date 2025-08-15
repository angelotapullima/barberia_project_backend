import getPool from '../database';
import { Service } from '../models/service.model';
import { Product } from '../models/product.model';

const pool = getPool();

interface PosMasterData {
  services: Partial<Service>[];
  products: Partial<Product>[];
}

export const getPosMasterData = async (): Promise<PosMasterData> => {
  const servicesQuery = pool.query('SELECT id, name, price, duration_minutes FROM services WHERE is_active = true ORDER BY name ASC');
  const productsQuery = pool.query('SELECT id, name, price, stock_quantity FROM products WHERE is_active = true ORDER BY name ASC');

  const [servicesResult, productsResult] = await Promise.all([
    servicesQuery,
    productsQuery,
  ]);

  return {
    services: servicesResult.rows,
    products: productsResult.rows,
  };
};