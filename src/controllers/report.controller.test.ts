import { Request, Response } from 'express';
import {
  getComprehensiveSalesReportController,
  getServicesProductsSalesReportController,
  getStationUsageReportController,
  getCustomerFrequencyReportController,
  getPeakHoursReportController,
  getBarberPaymentsReportController,
  getDetailedBarberServiceSalesReportController,
} from './report.controller';
import * as reportService from '../services/report.service'; // Import all functions from service

// Mock all functions from report.service
jest.mock('../services/report.service', () => ({
  generateReport: jest.fn(),
  getComprehensiveSales: jest.fn(),
  getServicesProductsSales: jest.fn(),
  getStationUsage: jest.fn(),
  getCustomerFrequency: jest.fn(),
  getPeakHours: jest.fn(),
  getBarberPayments: jest.fn(),
  getDetailedBarberServiceSales: jest.fn(),
}));

describe('ReportController', () => {
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

  describe('getComprehensiveSalesReportController', () => {
    it('debería obtener el reporte de ventas completo', async () => {
      const salesData = [{ id: 1, total: 100 }];
      (reportService.getComprehensiveSales as jest.Mock).mockResolvedValue(salesData);

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getComprehensiveSalesReportController(mockRequest as Request, mockResponse as Response);

      expect(reportService.getComprehensiveSales).toHaveBeenCalledWith({
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });
      expect(mockResponse.json).toHaveBeenCalledWith(salesData);
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });

    it('debería manejar errores al obtener el reporte de ventas completo', async () => {
      (reportService.getComprehensiveSales as jest.Mock).mockRejectedValue(new Error('Error de DB'));

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getComprehensiveSalesReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error al obtener el reporte de ventas comprensivo.' });
    });
  });

  describe('getServicesProductsSalesReportController', () => {
    it('debería obtener el reporte de ventas por servicios/productos', async () => {
      const salesData = [{ type: 'service', total: 50 }];
      (reportService.getServicesProductsSales as jest.Mock).mockResolvedValue(salesData);

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getServicesProductsSalesReportController(mockRequest as Request, mockResponse as Response);

      expect(reportService.getServicesProductsSales).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(mockResponse.json).toHaveBeenCalledWith(salesData); // Expecting salesData directly
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });

    it('debería manejar parámetros faltantes al obtener el reporte de ventas por servicios/productos', async () => {
      mockRequest.query = { startDate: '2025-01-01' }; // Missing endDate

      await getServicesProductsSalesReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Fechas de inicio y fin son requeridas.' });
    });

    it('debería manejar errores al obtener el reporte de ventas por servicios/productos', async () => {
      (reportService.getServicesProductsSales as jest.Mock).mockRejectedValue(new Error('Error de DB'));

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getServicesProductsSalesReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error al obtener el reporte de ventas por tipo.' });
    });
  });

  describe('getStationUsageReportController', () => {
    it('debería obtener el reporte de utilización de estaciones', async () => {
      const data = [{ station_name: 'Estación 1', usage_count: 5 }];
      (reportService.getStationUsage as jest.Mock).mockResolvedValue(data);

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getStationUsageReportController(mockRequest as Request, mockResponse as Response);

      expect(reportService.getStationUsage).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(mockResponse.json).toHaveBeenCalledWith(data);
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });

    it('debería manejar parámetros faltantes al obtener el reporte de utilización de estaciones', async () => {
      mockRequest.query = { startDate: '2025-01-01' }; // Missing endDate

      await getStationUsageReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Fechas de inicio y fin son requeridas.' });
    });

    it('debería manejar errores al obtener el reporte de utilización de estaciones', async () => {
      (reportService.getStationUsage as jest.Mock).mockRejectedValue(new Error('Error de DB'));

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getStationUsageReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error al obtener el reporte de uso de estaciones.' });
    });
  });

  describe('getCustomerFrequencyReportController', () => {
    it('debería obtener el reporte de frecuencia de clientes', async () => {
      const data = [{ customer_name: 'Cliente A', visit_count: 3 }];
      (reportService.getCustomerFrequency as jest.Mock).mockResolvedValue(data);

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getCustomerFrequencyReportController(mockRequest as Request, mockResponse as Response);

      expect(reportService.getCustomerFrequency).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(mockResponse.json).toHaveBeenCalledWith(data);
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });

    it('debería manejar parámetros faltantes al obtener el reporte de frecuencia de clientes', async () => {
      mockRequest.query = { startDate: '2025-01-01' }; // Missing endDate

      await getCustomerFrequencyReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Fechas de inicio y fin son requeridas.' });
    });

    it('debería manejar errores al obtener el reporte de frecuencia de clientes', async () => {
      (reportService.getCustomerFrequency as jest.Mock).mockRejectedValue(new Error('Error de DB'));

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getCustomerFrequencyReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error al obtener el reporte de frecuencia de clientes.' });
    });
  });

  describe('getPeakHoursReportController', () => {
    it('debería obtener el reporte de horas pico', async () => {
      const data = [{ hour: '10:00', reservation_count: 7 }];
      (reportService.getPeakHours as jest.Mock).mockResolvedValue(data);

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getPeakHoursReportController(mockRequest as Request, mockResponse as Response);

      expect(reportService.getPeakHours).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(mockResponse.json).toHaveBeenCalledWith(data);
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });

    it('debería manejar parámetros faltantes al obtener el reporte de horas pico', async () => {
      mockRequest.query = { startDate: '2025-01-01' }; // Missing endDate

      await getPeakHoursReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Fechas de inicio y fin son requeridas.' });
    });

    it('debería manejar errores al obtener el reporte de horas pico', async () => {
      (reportService.getPeakHours as jest.Mock).mockRejectedValue(new Error('Error de DB'));

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getPeakHoursReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error al obtener el reporte de horas pico.' });
    });
  });

  describe('getBarberPaymentsReportController', () => {
    it('debería obtener el reporte de pagos a barberos', async () => {
      const paymentsData = [{ barber_id: 1, barber_name: 'Barbero A', payment: 1500 }];
      (reportService.getBarberPayments as jest.Mock).mockResolvedValue(paymentsData);

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getBarberPaymentsReportController(mockRequest as Request, mockResponse as Response);

      expect(reportService.getBarberPayments).toHaveBeenCalledWith('2025-01-01', '2025-01-31');
      expect(mockResponse.json).toHaveBeenCalledWith(paymentsData);
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });

    it('debería manejar parámetros faltantes al obtener el reporte de pagos a barberos', async () => {
      mockRequest.query = { startDate: '2025-01-01' }; // Missing endDate

      await getBarberPaymentsReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Fechas de inicio y fin son requeridas.' });
    });

    it('debería manejar errores al obtener el reporte de pagos a barberos', async () => {
      (reportService.getBarberPayments as jest.Mock).mockRejectedValue(new Error('Error de DB'));

      mockRequest.query = { startDate: '2025-01-01', endDate: '2025-01-31' };

      await getBarberPaymentsReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error al obtener el reporte de pago a barberos.' });
    });
  });

  describe('getDetailedBarberServiceSalesReportController', () => {
    it('debería obtener el reporte detallado de servicios por barbero', async () => {
      const salesData = [{ barber_name: 'Barbero A', service_name: 'Corte' }];
      (reportService.getDetailedBarberServiceSales as jest.Mock).mockResolvedValue(salesData);

      mockRequest.query = { barberId: '1', startDate: '2025-01-01', endDate: '2025-01-31' };

      await getDetailedBarberServiceSalesReportController(mockRequest as Request, mockResponse as Response);

      expect(reportService.getDetailedBarberServiceSales).toHaveBeenCalledWith({
        barberId: '1',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      });
      expect(mockResponse.json).toHaveBeenCalledWith(salesData);
      expect(mockResponse.status).not.toHaveBeenCalledWith(500);
    });

    it('debería manejar errores al obtener el reporte detallado de servicios por barbero', async () => {
      (reportService.getDetailedBarberServiceSales as jest.Mock).mockRejectedValue(new Error('Error de DB'));

      mockRequest.query = { barberId: '1', startDate: '2025-01-01', endDate: '2025-01-31' };

      await getDetailedBarberServiceSalesReportController(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error al obtener el reporte detallado de servicios por barbero.' });
    });
  });
});