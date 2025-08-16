import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service';

export const getAllPaymentsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error });
  }
};

export const updatePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const updatedPayment = await paymentService.updatePayment(id, req.body);
    if (updatedPayment) {
      res.status(200).json(updatedPayment);
    } else {
      res.status(404).json({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating payment', error });
  }
};
