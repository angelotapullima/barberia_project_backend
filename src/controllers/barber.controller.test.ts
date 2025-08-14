import { Request, Response } from 'express';
import { barberController } from './barber.controller'; // Importar la instancia
import { barberService } from '../services/barber.service'; // Importar la instancia

// Mock del servicio de barbero
jest.mock('../services/barber.service', () => ({
  barberService: {
    getAllBarbers: jest.fn(),
    createBarber: jest.fn(),
    updateBarber: jest.fn(),
    deleteBarber: jest.fn(),
  },
}));

describe('BarberController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    // Reiniciar los mocks y las instancias antes de cada test
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(), // Permite encadenar .status().json()
      send: jest.fn(), // Añadido para manejar res.send()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore console.error
  });

  it('debería obtener todos los barberos', async () => {
    const barbers = [
      { id: 1, name: 'Juan' },
      { id: 2, name: 'Pedro' },
    ];
    (barberService.getAllBarbers as jest.Mock).mockResolvedValue(barbers);

    await barberController.getAllBarbers(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(barberService.getAllBarbers).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(barbers);
    expect(mockResponse.status).not.toHaveBeenCalledWith(500);
  });

  it('debería crear un nuevo barbero', async () => {
    const newBarber = { name: 'Nuevo', station_id: 1 };
    const createdBarber = { id: 3, ...newBarber };
    (barberService.createBarber as jest.Mock).mockResolvedValue(createdBarber);

    mockRequest.body = newBarber;

    await barberController.createBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(barberService.createBarber).toHaveBeenCalledWith(newBarber);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdBarber);
  });

  it('debería actualizar un barbero existente', async () => {
    const updatedBarber = { id: 1, name: 'Juan Actualizado', station_id: 1 };
    (barberService.updateBarber as jest.Mock).mockResolvedValue(updatedBarber);

    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Juan Actualizado', station_id: 1 };

    await barberController.updateBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(barberService.updateBarber).toHaveBeenCalledWith(1, {
      name: 'Juan Actualizado',
      station_id: 1,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedBarber); // Changed to updatedBarber
  });

  it('debería eliminar un barbero', async () => {
    (barberService.deleteBarber as jest.Mock).mockResolvedValue(true);

    mockRequest.params = { id: '1' };

    await barberController.deleteBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(barberService.deleteBarber).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204); // Changed to 204
    expect(mockResponse.send).toHaveBeenCalledTimes(1); // Expect send to be called
  });

  // Manejo de errores
  it('debería manejar errores al obtener todos los barberos', async () => {
    (barberService.getAllBarbers as jest.Mock).mockRejectedValue(
      new Error('Error de DB'),
    );

    await barberController.getAllBarbers(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('debería manejar error al crear barbero con salario base inválido (negativo)', async () => {
    mockRequest.body = { name: 'Test', base_salary: -100 };

    await barberController.createBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Base salary must be a non-negative number',
    });
  });

  it('debería manejar error al crear barbero con salario base inválido (no numérico)', async () => {
    mockRequest.body = { name: 'Test', base_salary: 'abc' };

    await barberController.createBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Base salary must be a non-negative number',
    });
  });

  it('debería manejar barbero no encontrado al actualizar', async () => {
    (barberService.updateBarber as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };
    mockRequest.body = { name: 'No Existe', station_id: 1 };

    await barberController.updateBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Barber not found',
    });
  });

  it('debería manejar error al actualizar barbero con salario base inválido (negativo)', async () => {
    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Test', base_salary: -100 };

    await barberController.updateBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Base salary must be a non-negative number',
    });
  });

  it('debería manejar error al actualizar barbero con salario base inválido (no numérico)', async () => {
    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Test', base_salary: 'abc' };

    await barberController.updateBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Base salary must be a non-negative number',
    });
  });

  it('debería manejar barbero no encontrado al eliminar', async () => {
    (barberService.deleteBarber as jest.Mock).mockResolvedValue(false);

    mockRequest.params = { id: '999' };

    await barberController.deleteBarber(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Barber not found',
    });
  });
});
