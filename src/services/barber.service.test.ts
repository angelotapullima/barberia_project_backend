import * as barberService from './barber.service';

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

describe('BarberService', () => {
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

  it('debería obtener todos los barberos', async () => {
    const mockBarbersData = [
      { id: 1, name: 'Carlos Ruiz', email: 'carlos.ruiz@example.com', phone: '555-5678', specialty: 'Cortes clásicos', station_id: 1, base_salary: 1500 },
      { id: 2, name: 'Luis Fernandez', email: 'luis.fernandez@example.com', phone: '555-8765', specialty: 'Estilos modernos', station_id: 2, base_salary: 1400 },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockBarbersData });

    const barbers = await barberService.getAllBarbers();

    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM barbers WHERE is_active = true ORDER BY name ASC');
    expect(Array.isArray(barbers)).toBe(true);
    expect(barbers.length).toBe(2);
    expect(barbers[0].name).toBe('Carlos Ruiz');
  });

  it('debería crear un nuevo barbero', async () => {
    const newBarber = {
      name: 'Nuevo Barbero',
      email: 'nuevo.barbero@example.com',
      station_id: 1,
      base_salary: 1500,
      is_active: true,
    };
    const createdBarber = { ...newBarber, id: 4 };

    // Mock for createBarber (INSERT)
    mockPoolQuery.mockResolvedValueOnce({
      rows: [createdBarber], // Simulate the ID returned after insertion
    });

    const result = await barberService.createBarber(newBarber);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO barbers (name, email, phone, specialty, photo_url, station_id, base_salary, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [newBarber.name, newBarber.email, undefined, undefined, undefined, newBarber.station_id, newBarber.base_salary, newBarber.is_active]
    );
    expect(result).toEqual(createdBarber);
  });

  it('debería actualizar un barbero existente', async () => {
    const barberId = 1;
    const updateData = {
      name: 'Juan Actualizado',
      email: 'juan.actualizado@example.com',
      station_id: 1,
      base_salary: 1400,
      is_active: true,
    };
    const updatedBarber = { ...updateData, id: barberId };

    // Mock for updateBarber (UPDATE)
    mockPoolQuery.mockResolvedValueOnce({ rows: [updatedBarber] }); // Simulate 1 row affected

    const result = await barberService.updateBarber(barberId, updateData);

    expect(result).toEqual(updatedBarber);
  });

  it('debería eliminar un barbero', async () => {
    const barberIdToDelete = 1;
    const deletedBarber = { id: barberIdToDelete, is_active: false };

    // Mock for deleteBarber (DELETE)
    mockPoolQuery.mockResolvedValueOnce({ rows: [deletedBarber] }); // Simulate 1 row affected

    const result = await barberService.deleteBarber(barberIdToDelete);

    expect(result).toEqual(deletedBarber);
  });

  it('no debería actualizar un barbero que no existe', async () => {
    const nonExistentBarberId = 999;
    const updateData = {
      name: 'No Existe',
      email: 'no.existe@example.com',
      station_id: 1,
      base_salary: 1000,
      is_active: true,
    };

    // Mock for updateBarber (UPDATE) when no row is affected
    mockPoolQuery.mockResolvedValueOnce({ rows: [] }); // Simulate 0 rows affected

    const result = await barberService.updateBarber(nonExistentBarberId, updateData);

    expect(result).toBeNull();
  });

  it('no debería eliminar un barbero que no existe', async () => {
    const nonExistentBarberId = 999;

    // Mock for deleteBarber (DELETE) when no row is affected
    mockPoolQuery.mockResolvedValueOnce({ rows: [] }); // Simulate 0 rows affected

    const result = await barberService.deleteBarber(nonExistentBarberId);

    expect(result).toBeNull();
  });

  it('debería obtener la disponibilidad del barbero', async () => {
    const barberId = 1;
    const date = '2025-08-14';
    const mockAvailability = [
      { start_time: '2025-08-14T10:00:00Z', end_time: '2025-08-14T11:00:00Z' },
      { start_time: '2025-08-14T14:00:00Z', end_time: '2025-08-14T15:00:00Z' },
    ];
    mockPoolQuery.mockResolvedValueOnce({ rows: mockAvailability });

    const availability = await barberService.getBarberAvailability(barberId, date);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      '\n    SELECT start_time, end_time\n    FROM reservations\n    WHERE barber_id = $1 AND DATE(start_time) = $2\n  ',
      [barberId, date]
    );
    expect(availability).toEqual(mockAvailability);
  });
});
