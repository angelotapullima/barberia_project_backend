import setup from '../database';

const pool = setup();

export interface Service {
  id?: number;
  name: string;
  description?: string | null;
  price: number;
  duration_minutes: number;
  type?: string;
  stock_quantity?: number;
  min_stock_level?: number;
}

export const getAllServices = async (): Promise<Service[]> => {
  const result = await pool.query('SELECT * FROM services ORDER BY type, name');
  return result.rows;
};

export const createService = async (service: Service): Promise<Service> => {
  const {
    name,
    description,
    price,
    duration_minutes,
    type = 'service',
    stock_quantity = 0,
    min_stock_level = 0,
  } = service;
  const result = await pool.query(
    'INSERT INTO services (name, description, price, duration_minutes, type, stock_quantity, min_stock_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [name, description, price, duration_minutes, type, stock_quantity, min_stock_level],
  );
  return result.rows[0];
};

export const updateService = async (id: number, service: Service): Promise<Service | null> => {
  const {
    name,
    description,
    price,
    duration_minutes,
    type = 'service',
    stock_quantity = 0,
    min_stock_level = 0,
  } = service;
  const result = await pool.query(
    'UPDATE services SET name = $1, description = $2, price = $3, duration_minutes = $4, type = $5, stock_quantity = $6, min_stock_level = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
    [
      name,
      description,
      price,
      duration_minutes,
      type,
      stock_quantity,
      min_stock_level,
      id,
    ],
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
};

export const deleteService = async (id: number): Promise<{ message: string } | { error: string }> => {
  const saleItemResult = await pool.query(
    'SELECT id FROM sale_items WHERE service_id = $1',
    [id],
  );
  if (saleItemResult.rows.length > 0) {
    return {
      error:
        'No se puede eliminar el servicio porque está asociado a una venta.',
    };
  }

  const result = await pool.query('DELETE FROM services WHERE id = $1', [id]);
  
  if (result.rowCount === 0) {
      return { error: 'Service not found' };
  }

  return { message: 'Service deleted successfully' };
};

export const getProducts = async (): Promise<Service[]> => {
  const result = await pool.query(
    "SELECT * FROM services WHERE type = 'product' ORDER BY name"
  );
  return result.rows;
};

export const updateProductStock = async (
  id: number,
  quantity: number,
): Promise<Service | null> => {
  const result = await pool.query(
    "UPDATE services SET stock_quantity = $1, updated_at = NOW() WHERE id = $2 AND type = 'product' RETURNING *",
    [quantity, id],
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
};

export const getLowStockProducts = async (): Promise<Service[]> => {
  const result = await pool.query(
    "SELECT * FROM services WHERE type = 'product' AND stock_quantity <= min_stock_level ORDER BY name"
  );
  return result.rows;
};

export const getInventoryReportSummary = async (): Promise<{
  totalProducts: number;
  lowStockCount: number;
  totalInventoryValue: number;
}> => {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE type = 'product') AS total_products,
      COUNT(*) FILTER (WHERE type = 'product' AND stock_quantity <= min_stock_level) AS low_stock_count,
      COALESCE(SUM(CASE WHEN type = 'product' THEN stock_quantity * price ELSE 0 END), 0) AS total_inventory_value
    FROM services;
  `);

  const row = result.rows[0];

  return {
    totalProducts: Number(row.total_products),
    lowStockCount: Number(row.low_stock_count),
    totalInventoryValue: Number(row.total_inventory_value),
  };
};