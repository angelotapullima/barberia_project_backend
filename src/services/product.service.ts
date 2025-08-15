import getPool from '../database';
import { Product } from '../models/product.model';

const pool = getPool();

export const getAllProducts = async (): Promise<Product[]> => {
  const result = await pool.query('SELECT * FROM products WHERE is_active = true ORDER BY name ASC');
  return result.rows;
};

export const getProductById = async (id: number): Promise<Product | null> => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const { name, description, price, stock_quantity, min_stock_level, category, is_active } = product;
  const result = await pool.query(
    'INSERT INTO products (name, description, price, stock_quantity, min_stock_level, category, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, description, price, stock_quantity, min_stock_level, category, is_active ?? true]
  );
  return result.rows[0];
};

export const updateProduct = async (id: number, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<Product | null> => {
  const fields = Object.keys(product).map((key, index) => `"${key}" = $${index + 1}`)
    .join(', ');
  const values = Object.values(product);

  if (fields.length === 0) {
    return getProductById(id);
  }

  const query = `UPDATE products SET ${fields}, updated_at = NOW() WHERE id = $${values.length + 1} RETURNING *`;
  const result = await pool.query(query, [...values, id]);

  return result.rows[0] || null;
};

// Soft delete by setting is_active to false
export const deleteProduct = async (id: number): Promise<Product | null> => {
  const result = await pool.query(
    'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return result.rows[0] || null;
};