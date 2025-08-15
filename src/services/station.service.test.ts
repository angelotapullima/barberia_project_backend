
import {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
} from './station.service';
import getPool from '../database';
import { Station } from '../models/station.model';

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

describe('StationService', () => {
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

  describe('getAllStations', () => {
    it('should get all stations', async () => {
      const stations = [{ id: 1, name: 'Test Station' }];
      mockPoolQuery.mockResolvedValueOnce({ rows: stations });

      const result = await getAllStations();

      expect(result).toEqual(stations);
    });
  });

  describe('getStationById', () => {
    it('should get a station by id', async () => {
      const station = { id: 1, name: 'Test Station' };
      mockPoolQuery.mockResolvedValueOnce({ rows: [station] });

      const result = await getStationById(1);

      expect(result).toEqual(station);
    });
  });

  describe('createStation', () => {
    it('should create a new station', async () => {
      const newStation: Omit<Station, 'id' | 'created_at' | 'updated_at'> = {
        name: 'New Station',
        is_active: true,
      };
      const createdStation = { ...newStation, id: 1 };
      mockPoolQuery.mockResolvedValueOnce({ rows: [{ count: 0 }] });
      mockPoolQuery.mockResolvedValueOnce({ rows: [createdStation] });

      const result = await createStation(newStation);

      expect(result).toEqual(createdStation);
    });
  });

  describe('updateStation', () => {
    it('should update a station', async () => {
      const updatedStation = { id: 1, name: 'Updated Station' };
      mockPoolQuery.mockResolvedValueOnce({ rows: [updatedStation] });

      const result = await updateStation(1, { name: 'Updated Station' });

      expect(result).toEqual(updatedStation);
    });
  });

  describe('deleteStation', () => {
    it('should soft delete a station', async () => {
      const deletedStation = { id: 1, is_active: false };
      mockPoolQuery.mockResolvedValueOnce({ rows: [] });
      mockPoolQuery.mockResolvedValueOnce({ rows: [deletedStation] });

      const result = await deleteStation(1);

      expect(result).toEqual(deletedStation);
    });
  });
});
