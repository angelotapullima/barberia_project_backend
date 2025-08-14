import { Request, Response } from 'express';
import { reportController } from './report.controller'; // Importar la instancia
import { reportService } from '../services/report.service';

// Mock del servicio de reportes
jest.mock('../services/report.service', () => ({
  reportService: {
    generateReport: jest.fn(),
    getComprehensiveSales: jest.fn(),
    getServicesProductsSales: jest.fn(),
    getStationUsage: jest.fn(),
    getCustomerFrequency: jest.fn(),
    getPeakHours: jest.fn(),
  },
}));

describe('ReportController', () => {
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

  it('debería generar un reporte general', async () => {
    const reportData = { events: [], stats: [] };
    (reportService.generateReport as jest.Mock).mockResolvedValue(reportData);

    mockRequest.query = { year: '2025', month: '8' };

    await reportController.getReport(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(reportService.generateReport).toHaveBeenCalledWith(2025, 8);
    expect(mockResponse.json).toHaveBeenCalledWith(reportData);
  });

  it('debería obtener el reporte de ventas completo', async () => {
    const salesData = [{ id: 1, total: 100 }];
    (reportService.getComprehensiveSales as jest.Mock).mockResolvedValue(
      salesData,
    );

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reportController.getComprehensiveSalesReport(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(reportService.getComprehensiveSales).toHaveBeenCalledWith({
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    });
    expect(mockResponse.json).toHaveBeenCalledWith(salesData);
  });

  it('debería obtener el reporte de ventas por servicios/productos', async () => {
    const salesData = [{ type: 'service', total: 50 }];
    (reportService.getServicesProductsSales as jest.Mock).mockResolvedValue(
      salesData,
    );

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reportController.getServicesProductsSalesReport(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(reportService.getServicesProductsSales).toHaveBeenCalledWith(
      '2025-01-01',
      '2025-01-31',
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      currentPeriod: salesData,
      comparisonPeriod: undefined, // Since compareStartDate and compareEndDate are not provided in the test
    });
  });

  it('debería obtener el reporte de utilización de estaciones', async () => {
    const data = [{ station_name: 'Estación 1', usage_count: 5 }];
    (reportService.getStationUsage as jest.Mock).mockResolvedValue(data);

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reportController.getStationUsageReport(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(reportService.getStationUsage).toHaveBeenCalledWith(
      '2025-01-01',
      '2025-01-31',
    );
    expect(mockResponse.json).toHaveBeenCalledWith(data);
  });

  it('debería obtener el reporte de frecuencia de clientes', async () => {
    const data = [{ customer_name: 'Cliente A', visit_count: 3 }];
    (reportService.getCustomerFrequency as jest.Mock).mockResolvedValue(data);

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reportController.getCustomerFrequencyReport(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(reportService.getCustomerFrequency).toHaveBeenCalledWith(
      '2025-01-01',
      '2025-01-31',
    );
    expect(mockResponse.json).toHaveBeenCalledWith(data);
  });

  it('debería obtener el reporte de horas pico', async () => {
    const data = [{ hour: '10:00', reservation_count: 7 }];
    (reportService.getPeakHours as jest.Mock).mockResolvedValue(data);

    mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

    await reportController.getPeakHoursReport(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(reportService.getPeakHours).toHaveBeenCalledWith(
      '2025-01-01',
      '2025-01-31',
    );
    expect(mockResponse.json).toHaveBeenCalledWith(data);
  });

  // Manejo de errores (ejemplo para un método)
  it('debería manejar errores al generar un reporte general', async () => {
    (reportService.generateReport as jest.Mock).mockRejectedValue(
      new Error('Error de DB'),
    );

    mockRequest.query = { year: '2025', month: '8' };

    await reportController.getReport(
      mockRequest as Request,
      mockResponse as Response,
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Failed to generate report.',
    });
  });
});
