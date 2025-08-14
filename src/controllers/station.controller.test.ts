import { Request, Response } from 'express';
import { stationController } from '../controllers/station.controller'; // Importar la instancia
import { stationService } from '../services/station.service';

// Mock del servicio de estación
jest.mock('../services/station.service', () => ({
  stationService: {
    getAllStations: jest.fn(),
    createStation: jest.fn(),
    updateStation: jest.fn(),
    deleteStation: jest.fn(),
  },
}));

describe('StationController', () => {
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

  it('debería obtener todas las estaciones', async () => {
    const stations = [{ id: 1, name: 'Estación 1' }];
    (stationService.getAllStations as jest.Mock).mockResolvedValue(stations);

    await stationController.getAllStations(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(stationService.getAllStations).toHaveBeenCalledTimes(1);
    expect(mockResponse.json).toHaveBeenCalledWith(stations);
  });

  it('debería crear una nueva estación', async () => {
    const newStation = { name: 'Nueva Estación' };
    const createdStation = { id: 4, ...newStation };
    (stationService.createStation as jest.Mock).mockResolvedValue(
      createdStation,
    );

    mockRequest.body = newStation;

    await stationController.createStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(stationService.createStation).toHaveBeenCalledWith(newStation);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(createdStation);
  });

  it('debería actualizar una estación existente', async () => {
    const updatedStation = { id: 1, name: 'Estación Actualizada' };
    (stationService.updateStation as jest.Mock).mockResolvedValue(
      updatedStation,
    );

    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Estación Actualizada' };

    await stationController.updateStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(stationService.updateStation).toHaveBeenCalledWith(1, {
      name: 'Estación Actualizada',
    });
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(updatedStation); // Changed to updatedStation
  });

  it('debería eliminar una estación', async () => {
    (stationService.deleteStation as jest.Mock).mockResolvedValue(true);

    mockRequest.params = { id: '1' };

    await stationController.deleteStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(stationService.deleteStation).toHaveBeenCalledWith(1);
    expect(mockResponse.status).toHaveBeenCalledWith(204); // Changed to 204
    expect(mockResponse.send).toHaveBeenCalledTimes(1); // Expect send to be called
  });

  // Manejo de errores
  it('debería manejar errores al obtener todas las estaciones', async () => {
    (stationService.getAllStations as jest.Mock).mockRejectedValue(
      new Error('Error de DB'),
    );

    await stationController.getAllStations(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('debería manejar error al crear estación con nombre duplicado', async () => {
    (stationService.createStation as jest.Mock).mockResolvedValue({
      error: 'El nombre de la estación ya existe.',
    });

    mockRequest.body = { name: 'Estación Existente' };

    await stationController.createStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'El nombre de la estación ya existe.',
    });
  });

  it('debería manejar error al actualizar estación con nombre duplicado', async () => {
    (stationService.updateStation as jest.Mock).mockResolvedValue({
      error: 'El nombre de la estación ya existe.',
    });

    mockRequest.params = { id: '1' };
    mockRequest.body = { name: 'Estación Existente' };

    await stationController.updateStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'El nombre de la estación ya existe.',
    });
  });

  it('debería manejar estación no encontrada al actualizar', async () => {
    (stationService.updateStation as jest.Mock).mockResolvedValue(null);

    mockRequest.params = { id: '999' };
    mockRequest.body = { name: 'No Existe' };

    await stationController.updateStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Station not found',
    });
  });

  it('debería manejar error al eliminar estación con barberos asignados', async () => {
    (stationService.deleteStation as jest.Mock).mockResolvedValue({
      error:
        'No se puede eliminar la estación porque está asignada a un barbero.',
    });

    mockRequest.params = { id: '1' };

    await stationController.deleteStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error:
        'No se puede eliminar la estación porque está asignada a un barbero.',
    });
  });

  it('debería manejar estación no encontrada al eliminar', async () => {
    (stationService.deleteStation as jest.Mock).mockResolvedValue(false);

    mockRequest.params = { id: '999' };

    await stationController.deleteStation(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Station not found',
    });
  });
});
