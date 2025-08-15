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

      mockClientQuery.mockResolvedValueOnce({ rows: [reservation], rowCount: 1 }); // SELECT reservation
      mockClientQuery.mockResolvedValueOnce({ rows: products }); // SELECT products
      mockClientQuery.mockResolvedValueOnce({ rows: [sale] }); // INSERT sale
      mockClientQuery.mockResolvedValueOnce({ rows: [serviceInfo] }); // SELECT service info
      mockClientQuery.mockResolvedValueOnce({ rows: [] }); // INSERT sale_items (service)
      mockClientQuery.mockResolvedValueOnce({ rows: [{id: 1, name: 'Test Product'}] }); // SELECT product info
      mockClientQuery.mockResolvedValueOnce({ rows: [] }); // INSERT sale_items (product)
      mockClientQuery.mockResolvedValueOnce({ rowCount: 1 }); // UPDATE reservation

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

      mockClientQuery.mockResolvedValueOnce({ rows: [reservation], rowCount: 1 }); // SELECT reservation
      mockClientQuery.mockResolvedValueOnce({ rows: [service] }); // SELECT service
      mockClientQuery.mockResolvedValueOnce({ rows: [updatedReservation] }); // UPDATE reservation

      const result = await updateReservationDetails(1, { service_id: 2 });

      expect(result).toEqual(updatedReservation);
    });
  });
});