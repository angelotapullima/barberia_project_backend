import { Request, Response } from 'express';
import { draftSaleService } from '../services/draftSale.service';

class DraftSaleController {
  async saveDraftSale(req: Request, res: Response): Promise<void> {
    const { reservation_id, client_name, barber_id, sale_items } = req.body;

    if (!reservation_id || !sale_items || !Array.isArray(sale_items)) {
      res
        .status(400)
        .json({ error: 'Missing or invalid required fields for draft sale.' });
      return;
    }

    try {
      const savedDraft = await draftSaleService.saveDraftSale({
        reservation_id,
        client_name,
        barber_id,
        sale_items,
      });
      res.status(200).json(savedDraft);
    } catch (error) {
      console.error('Error saving draft sale:', error);
      res.status(500).json({ error: 'Failed to save draft sale.' });
    }
  }

  async getDraftSale(req: Request, res: Response): Promise<void> {
    const { reservationId } = req.params;

    if (!reservationId) {
      res.status(400).json({ error: 'Missing reservationId parameter.' });
      return;
    }

    try {
      const draft = await draftSaleService.fetchDraftSale(
        Number(reservationId),
      );
      if (draft) {
        res.json(draft);
      } else {
        res
          .status(404)
          .json({ message: 'Draft sale not found for this reservation.' });
      }
    } catch (error) {
      console.error('Error fetching draft sale:', error);
      res.status(500).json({ error: 'Failed to fetch draft sale.' });
    }
  }

  async deleteDraftSale(req: Request, res: Response): Promise<void> {
    const { reservationId } = req.params;

    if (!reservationId) {
      res.status(400).json({ error: 'Missing reservationId parameter.' });
      return;
    }

    try {
      await draftSaleService.deleteDraftSale(Number(reservationId));
      res.status(204).send(); // No Content
    } catch (error) {
      console.error('Error deleting draft sale:', error);
      res.status(500).json({ error: 'Failed to delete draft sale.' });
    }
  }
}

export const draftSaleController = new DraftSaleController();
