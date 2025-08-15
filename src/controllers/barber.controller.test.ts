
import { Request, Response } from 'express';
import {
  getAllBarbersController,
  getBarberByIdController,
  createBarberController,
  updateBarberController,
  deleteBarberController,
} from './barber.controller';
import * as barberService from '../services/barber.service';

jest.mock('../services/barber.service');

describe('BarberController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería obtener todos los barberos', async () => {
    const barbers = [
      { id: 1, name: 'Juan', is_active: true },
      { id: 2, name: 'Pedro', is_active: true },
    ];
    (barberService.getAllBarbers as jest.Mock).mockResolvedValue(barbers);

    await getAllBarbersController(mockRequest as Request, mockResponse as Response);

    expect(barberService.getAllBarbers).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(barbers);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('debería manejar errores al obtener todos los barberos', async () => {
    (barberService.getAllBarbers as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    await getAllBarbersController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error fetching barbers', error: new Error('Error de DB') });
  });

  it('debería obtener un barbero por ID', async () => {
    const barber = { id: 1, name: 'Juan', is_active: true };
    (barberService.getBarberById as jest.Mock).mockResolvedValue(barber);

    mockRequest.params = { id: '1' };

    await getBarberByIdController(mockRequest as Request, mockResponse as Response);

    expect(barberService.getBarberById).toHaveBeenCalledWith(1);
    expect(mockResponse.json).toHaveBeenCalledWith(barber);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it('debería manejar barbero no encontrado al obtener por ID', async () => {
    (barberService.getBarberById as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };

    await getBarberByIdController(mockRequest as Request, mockResponse as Response);

    expect(barberService.getBarberById).toHaveBeenCalledWith(999);
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Barber not found' });
  });

  it('debería manejar errores al obtener barbero por ID', async () => {
    (barberService.getBarberById as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.params = { id: '1' };

    await getBarberByIdController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error fetching barber', error: new Error('Error de DB') });
  });

  it('debería crear un nuevo barbero', async () => {
    const newBarber = { name: 'Nuevo', station_id: 1, is_active: true };
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

    mockRequest.body = { name: 'Nuevo', is_active: true };

    await createBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating barber', error: new Error('Error de DB') });
  });

  it('debería actualizar un barbero existente', async () => {
    const updatedBarber = { id: 1, name: 'Juan Actualizado', station_id: 1, is_active: true };
    (barberService.updateBarber as jest.Mock).mockResolvedValue(updatedBarber);

    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Juan Actualizado', station_id: 1, is_active: true };

    await updateBarberController(mockRequest as Request, mockResponse as Response);

    expect(barberService.updateBarber).toHaveBeenCalledWith(1, {
      name: 'Juan Actualizado',
      station_id: 1,
      is_active: true,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedBarber);
  });

  it('debería manejar barbero no encontrado al actualizar', async () => {
    (barberService.updateBarber as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };
    mockRequest.body = { name: 'No Existe', station_id: 1, is_active: true };

    await updateBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Barber not found' });
  });

  it('debería manejar errores al actualizar barbero', async () => {
    (barberService.updateBarber as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Juan Actualizado', is_active: true };

    await updateBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating barber', error: new Error('Error de DB') });
  });

  it('debería eliminar un barbero (soft delete)', async () => {
    const deletedBarber = { id: 1, name: 'Juan', is_active: false };
    (barberService.deleteBarber as jest.Mock).mockResolvedValue(deletedBarber);

    mockRequest.params = { id: '1' };

    await deleteBarberController(mockRequest as Request, mockResponse as Response);

    expect(barberService.deleteBarber).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Barber deactivated successfully' });
  });

  it('debería manejar barbero no encontrado al eliminar', async () => {
    (barberService.deleteBarber as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };

    await deleteBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Barber not found' });
  });

  it('debería manejar errores al eliminar barbero', async () => {
    (barberService.deleteBarber as jest.Mock).mockRejectedValue(new Error('Error de DB'));

    mockRequest.params = { id: '1' };

    await deleteBarberController(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deactivating barber', error: new Error('Error de DB') });
  });
});
