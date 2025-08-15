import getPool from '../database';
import { Product } from '../models/product.model';

const pool = getPool();

export const getInventorySummary = async (): Promise<{
  totalProducts: number;
  lowStockCount: number;
  totalInventoryValue: number;
}> => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE is_active = true) AS total_products,
      COUNT(*) FILTER (WHERE is_active = true AND stock_quantity <= min_stock_level) AS low_stock_count,
      COALESCE(SUM(CASE WHEN is_active = true THEN stock_quantity * price ELSE 0 END), 0) AS total_inventory_value
    FROM products;
  `);

  const row = result.rows[0];

  return {
    totalProducts: Number(row.total_products),
    lowStockCount: Number(row.low_stock_count),
    totalInventoryValue: Number(row.total_inventory_value),
  };
};

export const getInventoryMovements = async (productId?: number): Promise<any[]> => {
  let query = 'SELECT * FROM inventory_movements';
  const params: any[] = [];
  if (productId) {
    query += ' WHERE product_id = $1';
    params.push(productId);
  }
  query += ' ORDER BY created_at DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

export const addInventoryMovement = async (productId: number, type: 'in' | 'out', quantity: number, referenceType?: string, referenceId?: number, notes?: string): Promise<any> => {
  const result = await pool.query(
    'INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, reference_id, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [productId, type, quantity, referenceType, referenceId, notes]
  );
  return result.rows[0];
};