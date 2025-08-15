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

    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT * FROM barbers ORDER BY id ASC');
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
    };
    const createdBarberId = 4;

    // Mock for createBarber (INSERT)
    mockPoolQuery.mockResolvedValueOnce({
      rows: [{ id: createdBarberId }], // Simulate the ID returned after insertion
    });

    const createdBarber = await barberService.createBarber(newBarber);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO barbers (name, email, phone, specialty, photo_url, station_id, base_salary) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [newBarber.name, newBarber.email, undefined, undefined, undefined, newBarber.station_id, newBarber.base_salary]
    );
    expect(createdBarber).toHaveProperty('id', createdBarberId);
    expect(createdBarber.name).toBe('Nuevo Barbero');
  });

  it('debería actualizar un barbero existente', async () => {
    const barberId = 1;
    const updateData = {
      name: 'Juan Actualizado',
      email: 'juan.actualizado@example.com',
      station_id: 1,
      base_salary: 1400,
    };

    // Mock for updateBarber (UPDATE)
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 }); // Simulate 1 row affected

    const updatedBarber = await barberService.updateBarber(barberId, updateData);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'UPDATE barbers SET name = $1, email = $2, phone = $3, specialty = $4, photo_url = $5, station_id = $6, base_salary = $7, updated_at = NOW() WHERE id = $8',
      [updateData.name, updateData.email, undefined, undefined, undefined, updateData.station_id, updateData.base_salary, barberId]
    );
    expect(updatedBarber).not.toBeNull();
    expect(updatedBarber?.name).toBe('Juan Actualizado');
  });

  it('debería eliminar un barbero', async () => {
    const barberIdToDelete = 1;

    // Mock for deleteBarber (DELETE)
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 }); // Simulate 1 row affected

    const result = await barberService.deleteBarber(barberIdToDelete);

    expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM barbers WHERE id = $1', [barberIdToDelete]);
    expect(result).toEqual({ message: 'Barber deleted successfully' });
  });

  it('no debería actualizar un barbero que no existe', async () => {
    const nonExistentBarberId = 999;
    const updateData = {
      name: 'No Existe',
      email: 'no.existe@example.com',
      station_id: 1,
      base_salary: 1000,
    };

    // Mock for updateBarber (UPDATE) when no row is affected
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 0 }); // Simulate 0 rows affected

    const updatedBarber = await barberService.updateBarber(nonExistentBarberId, updateData);

    expect(mockPoolQuery).toHaveBeenCalledWith(
      'UPDATE barbers SET name = $1, email = $2, phone = $3, specialty = $4, photo_url = $5, station_id = $6, base_salary = $7, updated_at = NOW() WHERE id = $8',
      [updateData.name, updateData.email, undefined, undefined, undefined, updateData.station_id, updateData.base_salary, nonExistentBarberId]
    );
    expect(updatedBarber).toBeNull();
  });

  it('no debería eliminar un barbero que no existe', async () => {
    const nonExistentBarberId = 999;

    // Mock for deleteBarber (DELETE) when no row is affected
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 0 }); // Simulate 0 rows affected

    const result = await barberService.deleteBarber(nonExistentBarberId);

    expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM barbers WHERE id = $1', [nonExistentBarberId]);
    expect(result).toEqual({ message: 'Barber not found' });
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