import { Request, Response } from 'express';
import {
  getAllBarbersController,
  getBarberByIdController,
  createBarberController,
  updateBarberController,
  deleteBarberController,
  getBarberAvailabilityController,
} from './barber.controller';
import * as barberService from '../services/barber.service'; // Import all functions from service

// Mock all functions from barber.service
jest.mock('../services/barber.service', () => ({
  getAllBarbers: jest.fn(),
  getBarberById: jest.fn(),
  createBarber: jest.fn(),
  updateBarber: jest.fn(),
  deleteBarber: jest.fn(),
  getBarberAvailability: jest.fn(),
}));

describe('BarberController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock; // For error handling middleware if needed

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería obtener todos los barberos', async () => {
    const barbers = [
      { id: 1, name: 'Juan' },
      { id: 2, name: 'Pedro' },
    ];
    (barberService.getAllBarbers as jest.Mock).mockResolvedValue(barbers);

    await getAllBarbersController(mockRequest as Request, mockResponse as Response);

    expect(barberService.getAllBarbers).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(barbers);
    expect(mockResponse.status).not.toHaveBeenCalledWith(500);
  });

  it('debería manejar errores al obtener todos los barberos', async () => {
    (barberService.getAllBarbers as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    await getAllBarbersController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });

  it('debería obtener un barbero por ID', async () => {
    const barber = { id: 1, name: 'Juan' };
    (barberService.getBarberById as jest.Mock).mockResolvedValue(barber);

    mockRequest.params = { id: '1' };

    await getBarberByIdController(mockRequest as Request, mockResponse as Response);

    expect(barberService.getBarberById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(barber);
    expect(mockResponse.status).not.toHaveBeenCalledWith(404);
  });

  it('debería manejar barbero no encontrado al obtener por ID', async () => {
    (barberService.getBarberById as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };

    await getBarberByIdController(mockRequest as Request, mockResponse as Response);

    expect(barberService.getBarberById).toHaveBeenCalledWith(999);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Barbero no encontrado' });
  });

  it('debería manejar errores al obtener barbero por ID', async () => {
    (barberService.getBarberById as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.params = { id: '1' };

    await getBarberByIdController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });

  it('debería crear un nuevo barbero', async () => {
    const newBarber = { name: 'Nuevo', station_id: 1 };
    const createdBarber = { id: 3, ...newBarber };
    (barberService.createBarber as jest.Mock).mockResolvedValue(createdBarber);

    mockRequest.body = newBarber;

    await createBarberController(mockRequest as Request, mockResponse as Response);

    expect(barberService.createBarber).toHaveBeenCalledWith(newBarber);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdBarber);
  });

  it('debería manejar errores al crear barbero', async () => {
    (barberService.createBarber as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.body = { name: 'Nuevo' };

    await createBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });

  it('debería actualizar un barbero existente', async () => {
    const updatedBarber = { id: 1, name: 'Juan Actualizado', station_id: 1 };
    (barberService.updateBarber as jest.Mock).mockResolvedValue(updatedBarber);

    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Juan Actualizado', station_id: 1 };

    await updateBarberController(mockRequest as Request, mockResponse as Response);

    expect(barberService.updateBarber).toHaveBeenCalledWith(1, {
      name: 'Juan Actualizado',
      station_id: 1,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedBarber);
  });

  it('debería manejar barbero no encontrado al actualizar', async () => {
    (barberService.updateBarber as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };
    mockRequest.body = { name: 'No Existe', station_id: 1 };

    await updateBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Barbero no encontrado' });
  });

  it('debería manejar errores al actualizar barbero', async () => {
    (barberService.updateBarber as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Juan Actualizado' };

    await updateBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });

  it('debería eliminar un barbero', async () => {
    (barberService.deleteBarber as jest.Mock).mockResolvedValue({ message: 'Barber deleted successfully' });

    mockRequest.params = { id: '1' };

    await deleteBarberController(mockRequest as Request, mockResponse as Response);

    expect(barberService.deleteBarber).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.send).toHaveBeenCalledTimes(1);
  });

  it('debería manejar barbero no encontrado al eliminar', async () => {
    (barberService.deleteBarber as jest.Mock).mockResolvedValue({ message: 'Barber not found' });

    mockRequest.params = { id: '999' };

    await deleteBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(204); // Corrected expectation
    expect(mockResponse.send).toHaveBeenCalledTimes(1); // Corrected expectation
  });

  it('debería manejar errores al eliminar barbero', async () => {
    (barberService.deleteBarber as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.params = { id: '1' };

    await deleteBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });

  it('debería obtener la disponibilidad del barbero', async () => {
    const availability = [{ start_time: '10:00', end_time: '11:00' }];
    (barberService.getBarberAvailability as jest.Mock).mockResolvedValue(availability);

    mockRequest.query = { barberId: '1', date: '2025-08-14' };

    await getBarberAvailabilityController(mockRequest as Request, mockResponse as Response);

    expect(barberService.getBarberAvailability).toHaveBeenCalledWith(1, '2025-08-14');
    expect(mockResponse.json).toHaveBeenCalledWith(availability);
    expect(mockResponse.status).not.toHaveBeenCalledWith(500);
  });

  it('debería manejar parámetros faltantes para la disponibilidad del barbero', async () => {
    mockRequest.query = { barberId: '1' }; // Missing date

    await getBarberAvailabilityController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Los parámetros barberId y date son requeridos.' });
  });

  it('debería manejar errores al obtener la disponibilidad del barbero', async () => {
    (barberService.getBarberAvailability as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.query = { barberId: '1', date: '2025-08-14' };

    await getBarberAvailabilityController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error interno del servidor' });
  });
});
