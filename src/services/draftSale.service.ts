import setupDatabase from '../database';
import { Database } from 'sqlite';

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
  sale_items: DraftSaleItem[]; // Items associated with this draft sale
}

export class DraftSaleService {
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

  async saveDraftSale(draftSale: DraftSale): Promise<DraftSale> {
    const { reservation_id, client_name, barber_id, sale_items } = draftSale;

    // Calculate total_amount from sale_items
    const total_amount = sale_items.reduce(
      (sum, item) => sum + item.price_at_draft * item.quantity,
      0,
    );

    let draftSaleId: number;
    const existingDraft = await this.db.get(
      'SELECT id FROM draft_sales WHERE reservation_id = ?',
      reservation_id,
    );

    if (existingDraft) {
      // Update existing draft sale
      await this.db.run(
        'UPDATE draft_sales SET client_name = ?, barber_id = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [client_name, barber_id, total_amount, existingDraft.id],
      );
      draftSaleId = existingDraft.id;
      // Delete old items and insert new ones
      await this.db.run(
        'DELETE FROM draft_sale_items WHERE draft_sale_id = ?',
        draftSaleId,
      );
    } else {
      // Insert new draft sale
      const result = await this.db.run(
        'INSERT INTO draft_sales (reservation_id, client_name, barber_id, total_amount) VALUES (?, ?, ?, ?)',
        [reservation_id, client_name, barber_id, total_amount],
      );
      draftSaleId = result.lastID!;
    }

    // Insert draft sale items
    const stmt = await this.db.prepare(
      'INSERT INTO draft_sale_items (draft_sale_id, item_id, item_type, quantity, price_at_draft) VALUES (?, ?, ?, ?, ?)',
    );
    for (const item of sale_items) {
      await stmt.run(
        draftSaleId,
        item.item_id,
        item.item_type,
        item.quantity,
        item.price_at_draft,
      );
    }
    await stmt.finalize();

    return { id: draftSaleId, ...draftSale, total_amount };
  }

  async fetchDraftSale(reservationId: number): Promise<DraftSale | undefined> {
    const draft = await this.db.get(
      'SELECT * FROM draft_sales WHERE reservation_id = ?',
      reservationId,
    );
    if (draft) {
      const items = await this.db.all(
        'SELECT item_id, item_type, quantity, price_at_draft FROM draft_sale_items WHERE draft_sale_id = ?',
        draft.id,
      );
      return { ...draft, sale_items: items };
    }
    return undefined;
  }

  async deleteDraftSale(reservationId: number): Promise<void> {
    await this.db.run(
      'DELETE FROM draft_sales WHERE reservation_id = ?',
      reservationId,
    );
    // ON DELETE CASCADE in schema handles draft_sale_items deletion
  }
}

export const draftSaleService = new DraftSaleService();
