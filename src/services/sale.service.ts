import getPool from '../database';
import { Sale, SaleItem } from '../models/sale.model';

const pool = getPool();

// --- PRIVATE FUNCTIONS ---
const getSaleItemsForSale = async (saleId: number): Promise<SaleItem[]> => {
  const result = await pool.query('SELECT * FROM sale_items WHERE sale_id = $1 ORDER BY item_type', [saleId]);
  return result.rows;
};

// --- PUBLIC API ---

export const getAllSales = async (page: number, limit: number): Promise<{ sales: Sale[]; total: number }> => {
  const offset = (page - 1) * limit;

  const salesResult = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC LIMIT $1 OFFSET $2', [limit, offset]);
  const sales = salesResult.rows;

  // This can be optimized further by doing a single query for all items if performance is an issue
  for (const sale of sales) {
    sale.items = await getSaleItemsForSale(sale.id);
  }

  const totalResult = await pool.query('SELECT COUNT(*) FROM sales');
  const total = parseInt(totalResult.rows[0].count, 10);

  return { sales, total };
};

export const getSaleById = async (id: number): Promise<Sale | null> => {
    const result = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    const sale = result.rows[0];
    if (sale) {
        sale.items = await getSaleItemsForSale(id);
    }
    return sale || null;
}

export const getSaleByReservationId = async (reservationId: number): Promise<Sale | null> => {
  const result = await pool.query('SELECT * FROM sales WHERE reservation_id = $1', [reservationId]);
  const sale = result.rows[0];
  if (sale) {
    sale.items = await getSaleItemsForSale(sale.id);
  }
  return sale || null;
};

export const cancelSale = async (saleId: number): Promise<{ message: string } | { error: string }> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get sale and associated reservation
    const saleResult = await client.query('SELECT reservation_id FROM sales WHERE id = $1 FOR UPDATE', [saleId]);
    if (saleResult.rows.length === 0) {
      throw new Error('Sale not found.');
    }
    const { reservation_id } = saleResult.rows[0];

    // 2. Delete sale items and the sale itself
    await client.query('DELETE FROM sale_items WHERE sale_id = $1', [saleId]);
    const deleteSaleResult = await client.query('DELETE FROM sales WHERE id = $1', [saleId]);

    if (deleteSaleResult.rowCount === 0) {
      throw new Error('Could not delete the sale.');
    }

    // 3. Revert reservation status if it was linked
    if (reservation_id) {
      await client.query("UPDATE reservations SET status = 'completed' WHERE id = $1", [reservation_id]);
    }

    await client.query('COMMIT');
    return { message: 'Sale cancelled successfully.' };
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error cancelling sale:', error);
    return { error: error.message || 'Failed to cancel sale.' };
  } finally {
    client.release();
  }
};

// NOTE: createSale is removed. The logic is now handled transactionally in reservation.service.ts
// The report functions like getSalesSummaryByDateRange will be refactored later in the Reports task.