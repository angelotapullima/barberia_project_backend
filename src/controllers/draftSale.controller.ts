import { Request, Response } from 'express';
import {
  saveDraftSale,
  fetchDraftSale,
  deleteDraftSale,
} from '../services/draftSale.service';

export const saveDraftSaleController = async (req: Request, res: Response): Promise<void> => {
  const { reservation_id, sale_items } = req.body;

  if (!reservation_id || !sale_items || !Array.isArray(sale_items)) {
    res.status(400).json({ message: 'Faltan campos requeridos o son inválidos.' });
    return;
  }

  try {
    const savedDraft = await saveDraftSale(req.body);
    res.status(200).json(savedDraft);
  } catch (error) {
    console.error('Error saving draft sale:', error);
    res.status(500).json({ message: 'No se pudo guardar el borrador.' });
  }
};

export const getDraftSaleController = async (req: Request, res: Response): Promise<void> => {
  const { reservationId } = req.params;

  try {
    const draft = await fetchDraftSale(Number(reservationId));
    if (draft) {
      res.json(draft);
    } else {
      res.status(404).json({ message: 'No se encontró un borrador para esta reservación.' });
    }
  } catch (error) {
    console.error('Error fetching draft sale:', error);
    res.status(500).json({ message: 'No se pudo obtener el borrador.' });
  }
};

export const deleteDraftSaleController = async (req: Request, res: Response): Promise<void> => {
  const { reservationId } = req.params;

  try {
    await deleteDraftSale(Number(reservationId));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting draft sale:', error);
    res.status(500).json({ message: 'No se pudo eliminar el borrador.' });
  }
};