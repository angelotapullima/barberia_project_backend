import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from './service.service';
import getPool from '../database';
import { Service } from '../models/service.model';

jest.mock('../database', () => {
  const mockPoolQuery = jest.fn();
  return {
    __esModule: true,
    default: jest.fn(() => ({
      query: mockPoolQuery,
    })),
    _getMockPoolQuery: () => mockPoolQuery,
  };
});

const { _getMockPoolQuery } = require('../database');

describe('ServiceService', () => {
  let mockPoolQuery: jest.Mock;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockPoolQuery = _getMockPoolQuery();
    mockPoolQuery.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAllServices', () => {
    it('should get all services', async () => {
      const services = [{ id: 1, name: 'Test Service' }];
      mockPoolQuery.mockResolvedValueOnce({ rows: services });

      const result = await getAllServices();

      expect(result).toEqual(services);
    });
  });

  describe('getServiceById', () => {
    it('should get a service by id', async () => {
      const service = { id: 1, name: 'Test Service' };
      mockPoolQuery.mockResolvedValueOnce({ rows: [service] });

      const result = await getServiceById(1);

      expect(result).toEqual(service);
    });
  });

  describe('createService', () => {
    it('should create a new service', async () => {
      const newService: Omit<Service, 'id' | 'created_at' | 'updated_at'> = {
        name: 'New Service',
        price: 100,
        duration_minutes: 60,
        is_active: true,
      };
      const createdService = { ...newService, id: 1 };
      mockPoolQuery.mockResolvedValueOnce({ rows: [createdService] });

      const result = await createService(newService);

      expect(result).toEqual(createdService);
    });
  });

  describe('updateService', () => {
    it('should update a service', async () => {
      const updatedService = { id: 1, name: 'Updated Service' };
      mockPoolQuery.mockResolvedValueOnce({ rows: [updatedService] });

      const result = await updateService(1, { name: 'Updated Service' });

      expect(result).toEqual(updatedService);
    });
  });

  describe('deleteService', () => {
    it('should soft delete a service', async () => {
      const deletedService = { id: 1, is_active: false };
      mockPoolQuery.mockResolvedValueOnce({ rows: [deletedService] });

      const result = await deleteService(1);

      expect(result).toEqual(deletedService);
    });
  });
});