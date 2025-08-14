import { getAllStations, createStation, updateStation, deleteStation, Station } from './station.service';

// Mock the database module to control its behavior in tests
jest.mock('../database', () => {
  const mockPoolQuery = jest.fn(); // Declare and initialize mockPoolQuery here
  return {
    __esModule: true,
    default: jest.fn(() => ({
      query: mockPoolQuery,
    })),
    setupTestDB: jest.fn(() => ({
      query: mockPoolQuery,
    })),
    // Expose mockPoolQuery for direct access in tests
    _getMockPoolQuery: () => mockPoolQuery,
  };
});

// Get the mockPoolQuery from the mocked database module
const { _getMockPoolQuery } = require('../database');


describe('StationService', () => {
  let mockPoolQuery: jest.Mock; // Declare it here to use in beforeEach and tests

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockPoolQuery = _getMockPoolQuery(); // Get the fresh mock for each test
    mockPoolQuery.mockClear(); // Clear mocks before each test
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería obtener todas las estaciones', async () => {
    const mockStationsData = [
      { id: 1, name: 'Estación Central' },
      { id: 2, name: 'Estación Norte' },
      { id: 3, name: 'Estación Sur' },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockStationsData });

    const stations = await getAllStations();

    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM stations ORDER BY name');
    expect(Array.isArray(stations)).toBe(true);
    expect(stations.length).toBe(3);
    expect(stations[0].name).toBe('Estación Central');
  });

  it('debería crear una nueva estación', async () => {
    const newStation = { name: 'Nueva Estación' };
    const createdStationId = 4;

    // Mock for COUNT(*)
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ count: '3' }] }); // Current count

    // Mock for INSERT
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: createdStationId }] });

    const createdStation = await createStation(newStation);

    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM stations');
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO stations (name, description) VALUES ($1, $2) RETURNING id',
      [newStation.name, undefined],
    );
    expect(createdStation).toHaveProperty('id', createdStationId);
    expect((createdStation as { name: string }).name).toBe('Nueva Estación');

    // No need to call getAllStations here, as we are testing createStation in isolation
  });

  it('debería actualizar una estación existente', async () => {
    const stationId = 1;
    const updateData = { name: 'Central Actualizada' };
    const updatedStationData = { id: stationId, ...updateData };

    mockPoolQuery.mockResolvedValueOnce({ rows: [updatedStationData], rowCount: 1 });

    const updatedStation = await updateStation(stationId, updateData);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'UPDATE stations SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [updateData.name, undefined, stationId],
    );
    expect(updatedStation).not.toBeNull();
    expect((updatedStation as { name: string })?.name).toBe('Central Actualizada');
  });

  it('debería eliminar una estación', async () => {
    const stationIdToDelete = 3;

    // Mock for checking barbers assigned (no barbers assigned)
    mockPoolQuery.mockResolvedValueOnce({ rows: [] });

    // Mock for DELETE
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await deleteStation(stationIdToDelete);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT id FROM barbers WHERE station_id = $1', [stationIdToDelete]);
    expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM stations WHERE id = $1', [stationIdToDelete]);
    expect(result).toEqual({ message: 'Station deleted successfully' });
  });

  it('no debería crear más de 10 estaciones', async () => {
    // Mock for COUNT(*) to simulate 10 stations already existing
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ count: '10' }] });

    const result = await createStation({ name: 'Estación 11' });
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM stations');
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'No se pueden crear más de 10 estaciones.',
    );
  });

  it('no debería crear una estación con nombre duplicado', async () => {
    const newStation = { name: 'Estación Central' };

    // Mock for COUNT(*)
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ count: '3' }] }); // Current count

    // Mock for INSERT - simulate unique violation error
    mockPoolQuery.mockRejectedValueOnce({ code: '23505' });

    const result = await createStation(newStation);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM stations');
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO stations (name, description) VALUES ($1, $2) RETURNING id',
      [newStation.name, undefined],
    );
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'El nombre de la estación ya existe.',
    );
  });

  it('no debería actualizar una estación con nombre duplicado', async () => {
    const stationId = 2;
    const updateData = { name: 'Estación Central' };

    // Mock for UPDATE - simulate unique violation error
    mockPoolQuery.mockRejectedValueOnce({ code: '23505' });

    const result = await updateStation(stationId, updateData);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'UPDATE stations SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [updateData.name, undefined, stationId],
    );
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'El nombre de la estación ya existe.',
    );
  });

  it('no debería eliminar una estación si tiene barberos asignados', async () => {
    const stationIdToDelete = 1;

    // Mock for checking barbers assigned (barbers assigned)
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 101 }] }); // Simulate a barber assigned

    const result = await deleteStation(stationIdToDelete);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT id FROM barbers WHERE station_id = $1', [stationIdToDelete]);
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'No se puede eliminar la estación porque está asignada a un barbero.',
    );
  });

  it('no debería actualizar una estación que no existe', async () => {
    const stationId = 999;
    const updateData = { name: 'No Existe' };

    mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Simulate no rows updated

    const updatedStation = await updateStation(stationId, updateData);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'UPDATE stations SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [updateData.name, undefined, stationId],
    );
    expect(updatedStation).toBeNull();
  });

  it('no debería eliminar una estación que no existe', async () => {
    const stationIdToDelete = 999;

    // Mock for checking barbers assigned (no barbers assigned)
    mockPoolQuery.mockResolvedValueOnce({ rows: [] });

    // Mock for DELETE - simulate no rows deleted
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await deleteStation(stationIdToDelete);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT id FROM barbers WHERE station_id = $1', [stationIdToDelete]);
    expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM stations WHERE id = $1', [stationIdToDelete]);
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe('Station not found');
  });
});