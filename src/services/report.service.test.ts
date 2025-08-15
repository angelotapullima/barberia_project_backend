// Removed sqlite imports and ReportService class instantiation
import {
  getStationUsage,
  getCustomerFrequency,
  getPeakHours,
  // generateReport,
  getComprehensiveSales,
  getServicesProductsSales,
  // CalendarEvent, // Now correctly imported
  // BarberStat,    // Now correctly imported
  // ReportData,    // Now correctly imported
} from './report.service';

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

describe('ReportService', () => {
  let mockPoolQuery: jest.Mock;
  let testStartDate: string;
  let testEndDate: string;

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockPoolQuery = _getMockPoolQuery();
    mockPoolQuery.mockClear();

    const today = new Date('2025-08-14T12:00:00Z'); // Fixed date for consistent testing
    const fortyFiveDaysAgo = new Date(today);
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
    testStartDate = fortyFiveDaysAgo.toISOString().split('T')[0];
    testEndDate = today.toISOString().split('T')[0];
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería calcular correctamente la utilización de estaciones', async () => {
    const mockStationUsageData = [
      { station_name: 'Estación Central', completed_reservations_count: 5 },
      { station_name: 'Estación Norte', completed_reservations_count: 3 },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockStationUsageData });

    const stationUsage = await getStationUsage(testStartDate, testEndDate);

    expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [testStartDate, testEndDate]);
    expect(Array.isArray(stationUsage)).toBe(true);
    expect(stationUsage.length).toBe(2);
    expect(stationUsage[0].station_name).toBe('Estación Central');
    expect(stationUsage[0].completed_reservations_count).toBe(5);
  });

  it('debería calcular correctamente la frecuencia de clientes', async () => {
    const mockCustomerFrequencyData = [
      { customer_name: 'Pedro Pascal', visit_count: 3, total_spent: 150 },
      { customer_name: 'Juan Perez', visit_count: 2, total_spent: 100 },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockCustomerFrequencyData });

    const customerFrequency = await getCustomerFrequency(testStartDate, testEndDate);

    expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [testStartDate, testEndDate]);
    expect(Array.isArray(customerFrequency)).toBe(true);
    expect(customerFrequency.length).toBe(2);
    expect(customerFrequency[0].customer_name).toBe('Pedro Pascal');
    expect(customerFrequency[0].visit_count).toBe(3);
  });

  it('debería calcular correctamente las horas pico', async () => {
    const mockPeakHoursData = [
      { hour: 10, reservation_count: 5 },
      { hour: 11, reservation_count: 8 },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockPeakHoursData });

    const peakHours = await getPeakHours(testStartDate, testEndDate);

    expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('SELECT'), [testStartDate, testEndDate]);
    expect(Array.isArray(peakHours)).toBe(true);
    expect(peakHours.length).toBe(2);
    expect(peakHours[0].hour).toBe(10);
    expect(peakHours[0].reservation_count).toBe(5);
  });

  describe('getComprehensiveSales', () => {
    it('debería obtener todas las ventas sin filtros', async () => {
      const mockSalesData = [
        { sale_id: 1, sale_date: '2025-08-10', total_amount: 50, customer_name: 'Cliente 1', payment_method: 'cash', items_sold: 'Corte (25), Gel (25)' },
      ];
      mockPoolQuery.mockResolvedValue({ rows: mockSalesData });

      const sales = await getComprehensiveSales({});
      expect(Array.isArray(sales)).toBe(true);
      expect(sales.length).toBe(1);
      expect(sales[0]).toHaveProperty('sale_id', 1);
      expect(sales[0]).toHaveProperty('customer_name', 'Cliente 1');
    });

    it('debería filtrar ventas por paymentMethod', async () => {
      const mockFilteredSales = [
        { sale_id: 1, sale_date: new Date('2025-08-10'), total_amount: 50, customer_name: 'Cliente 1', payment_method: 'cash', items_sold: 'Corte (25), Gel (25)' },
      ];
      mockPoolQuery.mockResolvedValue({ rows: mockFilteredSales });

      const filteredSales = await getComprehensiveSales({ paymentMethod: 'cash' });
      expect(Array.isArray(filteredSales)).toBe(true);
      expect(filteredSales.length).toBe(1);
      filteredSales.forEach((sale) => {
        expect(sale.payment_method).toBe('cash');
      });
    });

    it('debería filtrar ventas por rango de fechas', async () => {
      const mockSalesData = [
        { sale_id: 1, sale_date: new Date('2025-08-10'), total_amount: 50, customer_name: 'Cliente 1', payment_method: 'cash', items_sold: 'Corte (25), Gel (25)' },
      ];
      mockPoolQuery.mockResolvedValue({ rows: mockSalesData });

      const sales = await getComprehensiveSales({ startDate: testStartDate, endDate: testEndDate });
      expect(Array.isArray(sales)).toBe(true);
      expect(sales.length).toBe(1);
      sales.forEach((sale) => {
        expect(new Date(sale.sale_date).toISOString().split('T')[0] >= testStartDate).toBe(true);
        expect(new Date(sale.sale_date).toISOString().split('T')[0] <= testEndDate).toBe(true);
      });
    });
  });

  describe('getServicesProductsSales', () => {
    it('debería obtener el resumen de ventas por tipo de servicio/producto', async () => {
      const mockSummaryData = [
        { date: '2025-08-10', service_total: '100', product_total: '50' },
        { date: '2025-08-11', service_total: '200', product_total: '75' },
      ];
      mockPoolQuery.mockResolvedValue({ rows: mockSummaryData });

      const summary = await getServicesProductsSales(testStartDate, testEndDate);
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBe(2);
      expect(summary[0]).toHaveProperty('date', '2025-08-10');
      expect(summary[0]).toHaveProperty('service_total', 100);
      expect(summary[0]).toHaveProperty('product_total', 50);
    });

    it('debería manejar un rango de fechas sin ventas', async () => {
      mockPoolQuery.mockResolvedValue({ rows: [] });

      const summary = await getServicesProductsSales('2000-01-01', '2000-01-31');
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBe(0);
    });
  });
});