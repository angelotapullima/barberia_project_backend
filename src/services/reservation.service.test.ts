import {
  createReservation,
  addProductToReservation,
  removeProductFromReservation,
  completeReservationAndCreateSale,
  getCalendarViewData,
  cancelReservation,
  updateReservationDetails,
} from './reservation.service';
import getPool from '../database';
import { Reservation } from '../models/reservation.model';

jest.mock('../database', () => {
  const mockPoolQuery = jest.fn();
  const mockClientQuery = jest.fn();
  const mockClientRelease = jest.fn();
  const mockClient = {
    query: mockClientQuery,
    release: mockClientRelease,
  };
  const mockPoolConnect = jest.fn(() => Promise.resolve(mockClient));
  return {
    __esModule: true,
    default: jest.fn(() => ({
      query: mockPoolQuery,
      connect: mockPoolConnect,
    })),
    _getMockPoolQuery: () => mockPoolQuery,
    _getMockPoolConnect: () => mockPoolConnect,
    _getMockClientQuery: () => mockClientQuery,
    _getMockClientRelease: () => mockClientRelease,
  };
});

const { _getMockPoolQuery, _getMockPoolConnect, _getMockClientQuery, _getMockClientRelease } = require('../database');

describe('ReservationService', () => {
  let mockPoolQuery: jest.Mock;
  let mockPoolConnect: jest.Mock;
  let mockClientQuery: jest.Mock;
  let mockClientRelease: jest.Mock;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockPoolQuery = _getMockPoolQuery();
    mockPoolConnect = _getMockPoolConnect();
    mockClientQuery = _getMockClientQuery();
    mockClientRelease = _getMockClientRelease();

    mockPoolQuery.mockClear();
    mockPoolConnect.mockClear();
    mockClientQuery.mockClear();
    mockClientRelease.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createReservation', () => {
    it('should create a new reservation', async () => {
      const newReservation: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'service_price' | 'end_time'> = {
        barber_id: 1,
        station_id: 1,
        service_id: 1,
        client_name: 'Test Client',
        start_time: new Date(),
        status: 'pending',
      };
      const service = { price: 50, duration_minutes: 30 };
      const createdReservation = { ...newReservation, id: 1, service_price: 50, end_time: new Date() };

      mockPoolQuery.mockResolvedValueOnce({ rows: [service] });
      mockPoolQuery.mockResolvedValueOnce({ rows: [createdReservation] });

      const result = await createReservation(newReservation);

      expect(result).toEqual(createdReservation);
    });
  });

  describe('addProductToReservation', () => {
    it('should add a product to a reservation', async () => {
      const product = { price: 20 };
      const reservationProduct = { id: 1, reservation_id: 1, product_id: 1, quantity: 1, price_at_reservation: 20 };

      mockPoolQuery.mockResolvedValueOnce({ rows: [product] });
      mockPoolQuery.mockResolvedValueOnce({ rows: [reservationProduct] });

      const result = await addProductToReservation(1, 1, 1);

      expect(result).toEqual(reservationProduct);
    });
  });

  describe('removeProductFromReservation', () => {
    it('should remove a product from a reservation', async () => {
      mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

      await removeProductFromReservation(1);

      expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM reservation_products WHERE id = $1', [1]);
    });
  });

  describe('completeReservationAndCreateSale', () => {
    it('should complete a reservation and create a sale', async () => {
      const reservation = { id: 1, status: 'completed', service_price: 50, barber_id: 1, client_name: 'Test Client', service_id: 1 };
      const products = [{ price_at_reservation: 20, quantity: 1, product_id: 1 }];
      const sale = { id: 1 };
      const serviceInfo = { name: 'Test Service' };

      mockClientQuery.mockImplementation((query: string, params: any[]) => {
        if (query.includes('SELECT * FROM reservations WHERE id = $1 FOR UPDATE')) {
          return Promise.resolve({ rows: [reservation], rowCount: 1 });
        } else if (query.includes('SELECT * FROM reservation_products WHERE reservation_id = $1')) {
          return Promise.resolve({ rows: products });
        } else if (query.includes('INSERT INTO sales')) {
          return Promise.resolve({ rows: [sale] });
        } else if (query.includes('SELECT name FROM services WHERE id = $1')) {
          return Promise.resolve({ rows: [serviceInfo] });
        } else if (query.includes('INSERT INTO sale_items')) {
          return Promise.resolve({ rows: [] });
        } else if (query.includes('SELECT id, name FROM products WHERE id = ANY($1::int[])')) {
          return Promise.resolve({ rows: [{id: 1, name: 'Test Product'}] });
        } else if (query.includes("UPDATE reservations SET status = 'paid'")) {
          return Promise.resolve({ rowCount: 1 });
        }
        return Promise.resolve({ rows: [] });
      });

      await completeReservationAndCreateSale(1, 'cash');

      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockClientRelease).toHaveBeenCalled();
    });
  });

  describe('getCalendarViewData', () => {
    it('should get calendar view data', async () => {
      const reservations = [{ id: 1 }];
      const barbers = [{ id: 1, name: 'Test Barber' }];
      const services = [{ id: 1, name: 'Test Service' }];

      mockPoolQuery.mockResolvedValueOnce({ rows: reservations });
      mockPoolQuery.mockResolvedValueOnce({ rows: barbers });
      mockPoolQuery.mockResolvedValueOnce({ rows: services });

      const result = await getCalendarViewData('2025-01-01', '2025-01-31');

      expect(result).toEqual({ reservations, barbers, services });
    });
  });

  describe('cancelReservation', () => {
    it('should cancel a reservation', async () => {
      const reservation = { id: 1 };
      mockPoolQuery.mockResolvedValueOnce({ rows: [reservation], rowCount: 1 });

      const result = await cancelReservation(1);

      expect(result).toEqual(reservation);
    });
  });

  describe('updateReservationDetails', () => {
    it('should update reservation details', async () => {
      const reservation = { id: 1, service_id: 1, start_time: new Date(), service_price: 50, end_time: new Date() };
      const service = { price: 60, duration_minutes: 45 };
      const updatedReservation = { ...reservation, service_price: 60 };

      mockClientQuery.mockImplementation((query: string, params: any[]) => {
        if (query.includes('SELECT * FROM reservations WHERE id = $1 FOR UPDATE')) {
          return Promise.resolve({ rows: [reservation], rowCount: 1 });
        } else if (query.includes('SELECT price, duration_minutes FROM services WHERE id = $1')) {
          return Promise.resolve({ rows: [service] });
        } else if (query.includes('UPDATE reservations SET')) {
          return Promise.resolve({ rows: [updatedReservation] });
        }
        return Promise.resolve({ rows: [] });
      });

      const result = await updateReservationDetails(1, { service_id: 2 });

      expect(result).toEqual(updatedReservation);
    });
  });
});