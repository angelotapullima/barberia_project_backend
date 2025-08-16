import {
  getAllSales,
  getSaleById,
  getSaleByReservationId,
  cancelSale,
} from './sale.service';
import getPool from '../database';
import { Sale } from '../models/sale.model';

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

describe('SaleService', () => {
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

  describe('getAllSales', () => {
    it('should get all sales', async () => {
      const sales = [{ id: 1, items: [] }];
      const total = 1;

      mockPoolQuery.mockResolvedValueOnce({ rows: sales });
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });
      mockPoolQuery.mockResolvedValueOnce({ rows: [{ count: total }] });

      const result = await getAllSales(1, 10);

      expect(result).toEqual({ sales, total });
    });
  });

  describe('getSaleById', () => {
    it('should get a sale by id', async () => {
      const sale = { id: 1, items: [] };

      mockPoolQuery.mockResolvedValueOnce({ rows: [sale] });
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });

      const result = await getSaleById(1);

      expect(result).toEqual(sale);
    });
  });

  describe('getSaleByReservationId', () => {
    it('should get a sale by reservation id', async () => {
      const sale = { id: 1, reservation_id: 1, items: [] };

      mockPoolQuery.mockResolvedValueOnce({ rows: [sale] });
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });

      const result = await getSaleByReservationId(1);

      expect(result).toEqual(sale);
    });
  });

  describe('cancelSale', () => {
    it('should cancel a sale', async () => {
      const sale = { reservation_id: 1 };

      mockClientQuery.mockImplementation((query: string, params: any[]) => {
        if (query.includes('SELECT reservation_id FROM sales')) {
          return Promise.resolve({ rows: [sale], rowCount: 1 });
        } else if (query.includes('DELETE FROM sale_items')) {
          return Promise.resolve({ rowCount: 1 });
        } else if (query.includes('DELETE FROM sales')) {
          return Promise.resolve({ rowCount: 1 });
        } else if (query.includes('UPDATE reservations')) {
          return Promise.resolve({ rowCount: 1 });
        }
        return Promise.resolve({ rows: [] }); // Default for other queries
      });

      const result = await cancelSale(1);

      expect(result).toEqual({ message: 'Sale cancelled successfully.' });
      expect(mockClientQuery).toHaveBeenCalledWith('BEGIN');
      expect(mockClientQuery).toHaveBeenCalledWith('COMMIT');
      expect(mockClientRelease).toHaveBeenCalled();
    });
  });
});