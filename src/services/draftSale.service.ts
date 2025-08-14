import setup from '../database';
import { Pool, PoolClient } from 'pg';

const pool = setup();

// --- INTERFACES ---
interface DraftSaleItem {
  item_id: number;
  item_type: 'service' | 'product';
  quantity: number;
  price_at_draft: number;
}

interface DraftSale {
  id?: number;
  reservation_id: number;
  client_name?: string;
  barber_id?: number;
  total_amount?: number;
  created_at?: string;
  updated_at?: string;
  sale_items: DraftSaleItem[];
}

// --- PUBLIC API ---
export const saveDraftSale = async (draftSale: DraftSale): Promise<DraftSale> => {
  const { reservation_id, client_name, barber_id, sale_items } = draftSale;

  const total_amount = sale_items.reduce(
    (sum, item) => sum + item.price_at_draft * item.quantity,
    0,
  );

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: existingDraftRows } = await client.query(
      'SELECT id FROM draft_sales WHERE reservation_id = $1 FOR UPDATE',
      [reservation_id],
    );
    const existingDraft = existingDraftRows[0];

    let draftSaleId: number;

    if (existingDraft) {
      await client.query(
        'UPDATE draft_sales SET client_name = $1, barber_id = $2, total_amount = $3, updated_at = NOW() WHERE id = $4',
        [client_name, barber_id, total_amount, existingDraft.id],
      );
      draftSaleId = existingDraft.id;
      await client.query(
        'DELETE FROM draft_sale_items WHERE draft_sale_id = $1',
        [draftSaleId],
      );
    } else {
      const result = await client.query(
        'INSERT INTO draft_sales (reservation_id, client_name, barber_id, total_amount) VALUES ($1, $2, $3, $4) RETURNING id',
        [reservation_id, client_name, barber_id, total_amount],
      );
      draftSaleId = result.rows[0].id;
    }

    for (const item of sale_items) {
      await client.query(
        'INSERT INTO draft_sale_items (draft_sale_id, item_id, item_type, quantity, price_at_draft) VALUES ($1, $2, $3, $4, $5)',
        [
          draftSaleId,
          item.item_id,
          item.item_type,
          item.quantity,
          item.price_at_draft,
        ],
      );
    }

    await client.query('COMMIT');

    return { id: draftSaleId, ...draftSale, total_amount };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving draft sale:', error);
    throw new Error('Failed to save draft sale.');
  } finally {
    client.release();
  }
};

export const fetchDraftSale = async (reservationId: number): Promise<DraftSale | undefined> => {
  const { rows: draftRows } = await pool.query(
    'SELECT * FROM draft_sales WHERE reservation_id = $1',
    [reservationId],
  );
  const draft = draftRows[0];

  if (draft) {
    const { rows: items } = await pool.query(
      'SELECT item_id, item_type, quantity, price_at_draft FROM draft_sale_items WHERE draft_sale_id = $1',
      [draft.id],
    );
    return { ...draft, sale_items: items };
  }
  return undefined;
};

export const deleteDraftSale = async (reservationId: number, client: Pool | PoolClient = pool): Promise<void> => {
  // This function can run inside a transaction from sale.service, so it uses the provided client.
  await client.query(
    'DELETE FROM draft_sales WHERE reservation_id = $1',
    [reservationId],
  );
  // ON DELETE CASCADE in schema handles draft_sale_items deletion
};