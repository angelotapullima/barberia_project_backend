import { Request, Response } from 'express';
import { serviceController } from '../controllers/service.controller'; // Importar la instancia
import { serviceService } from '../services/service.service';

// Mock del servicio de servicio
jest.mock('../services/service.service', () => ({
  serviceService: {
    getAllServices: jest.fn(),
    createService: jest.fn(),
    updateService: jest.fn(),
    deleteService: jest.fn(),
  },
}));

describe('ServiceController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(), // Añadido para manejar res.send()
    };
  });

  afterEach(() => {
    jest.restoreAllMocks(); // Restore console.error
  });

  it('debería obtener todos los servicios', async () => {
    const services = [{ id: 1, name: 'Corte', price: 30 }];
    (serviceService.getAllServices as jest.Mock).mockResolvedValue(services);

    await serviceController.getAllServices(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(serviceService.getAllServices).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(services);
  });

  it('debería crear un nuevo servicio', async () => {
    const newService = {
      name: 'Nuevo Servicio',
      price: 50,
      duration_minutes: 60,
    };
    const createdService = { id: 3, ...newService };
    (serviceService.createService as jest.Mock).mockResolvedValue(
      createdService,
    );

    mockRequest.body = newService;

    await serviceController.createService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(serviceService.createService).toHaveBeenCalledWith(newService);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdService);
  });

  it('debería actualizar un servicio existente', async () => {
    const updatedService = {
      id: 1,
      name: 'Corte Actualizado',
      price: 35,
      duration_minutes: 45,
    };
    (serviceService.updateService as jest.Mock).mockResolvedValue(
      updatedService,
    );

    mockRequest.params = { id: '1' };
    mockRequest.body = {
      name: 'Corte Actualizado',
      price: 35,
      duration_minutes: 45,
    };

    await serviceController.updateService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(serviceService.updateService).toHaveBeenCalledWith(1, {
      name: 'Corte Actualizado',
      price: 35,
      duration_minutes: 45,
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedService); // Changed to updatedService
  });

  it('debería eliminar un servicio', async () => {
    (serviceService.deleteService as jest.Mock).mockResolvedValue(true);

    mockRequest.params = { id: '1' };

    await serviceController.deleteService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(serviceService.deleteService).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204); // Changed to 204
    expect(mockResponse.send).toHaveBeenCalledTimes(1); // Expect send to be called
  });

  // Manejo de errores
  it('debería manejar errores al obtener todos los servicios', async () => {
    (serviceService.getAllServices as jest.Mock).mockRejectedValue(
      new Error('Error de DB'),
    );

    await serviceController.getAllServices(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('debería manejar error al crear servicio con datos inválidos', async () => {
    mockRequest.body = { name: '' }; // Missing price

    await serviceController.createService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Name, price, and duration_minutes are required',
    });
  });

  it('debería manejar error al actualizar servicio con datos inválidos', async () => {
    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Test', price: -10, duration_minutes: 30 }; // Invalid price

    await serviceController.updateService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Price must be a non-negative number',
    });
  });

  it('debería manejar servicio no encontrado al actualizar', async () => {
    (serviceService.updateService as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };
    mockRequest.body = { name: 'No Existe', price: 10, duration_minutes: 30 };

    await serviceController.updateService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Service not found',
    });
  });

  it('debería manejar error al eliminar servicio asociado a venta', async () => {
    (serviceService.deleteService as jest.Mock).mockResolvedValue({
      error:
        'No se puede eliminar el servicio porque está asociado a una venta.',
    });

    mockRequest.params = { id: '1' };

    await serviceController.deleteService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error:
        'No se puede eliminar el servicio porque está asociado a una venta.',
    });
  });

  it('debería manejar servicio no encontrado al eliminar', async () => {
    (serviceService.deleteService as jest.Mock).mockResolvedValue(false);

    mockRequest.params = { id: '999' };

    await serviceController.deleteService(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Service not found',
    });
  });
});
