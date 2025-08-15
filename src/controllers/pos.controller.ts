import { Request, Response } from 'express';
import * as posService from '../services/pos.service';

export const getPosMasterData = async (req: Request, res: Response): Promise<void> => {
  try {
    const masterData = await posService.getPosMasterData();
    res.status(200).json(masterData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching POS master data', error });
  }
};
