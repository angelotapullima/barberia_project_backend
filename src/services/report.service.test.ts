import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { ReportService } from './report.service'; // Importar la clase, no la instancia

describe('ReportService', () => {
  let db: Database;
  let reportService: ReportService;
  let testStartDate: string;
  let testEndDate: string;

  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log

    db = await setupTestDB();
    // @ts-ignore
    reportService = new ReportService(db); // Inyectamos la BD de prueba

    // Definimos un rango de fechas de prueba que coincida con los datos generados (últimos 45 días)
    const today = new Date();
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
    testStartDate = fortyFiveDaysAgo.toISOString().split('T')[0];
    testEndDate = today.toISOString().split('T')[0];
  });

  afterAll(async () => {
    await db.close();
    jest.restoreAllMocks(); // Restore console.error and console.log
  });

  it('debería calcular correctamente la utilización de estaciones', async () => {
    const stationUsage = await reportService.getStationUsage(
      testStartDate,
      testEndDate,
    );

    expect(Array.isArray(stationUsage)).toBe(true);
    expect(stationUsage.length).toBeGreaterThan(0);
    // Verificamos que la estación más usada sea la 'Estación Central' según nuestra lógica de datos de prueba
    expect(stationUsage[0].station_name).toBe('Estación Central');
    expect(stationUsage[0].usage_count).toBeGreaterThan(0);
  });

  it('debería calcular correctamente la frecuencia de clientes', async () => {
    const customerFrequency = await reportService.getCustomerFrequency(
      testStartDate,
      testEndDate,
    );

    expect(Array.isArray(customerFrequency)).toBe(true);
    expect(customerFrequency.length).toBeGreaterThan(0);
    // Verificamos que el cliente más frecuente sea Pedro Pascal
    expect(customerFrequency[0].customer_name).toBe('Pedro Pascal');
    expect(customerFrequency[0].visit_count).toBeGreaterThan(0); // Cambiado a toBeGreaterThan(0)
  });

  it('debería calcular correctamente las horas pico', async () => {
    const peakHours = await reportService.getPeakHours(
      testStartDate,
      testEndDate,
    );

    expect(Array.isArray(peakHours)).toBe(true);
    expect(peakHours.length).toBeGreaterThan(0);
    expect(peakHours[0].hour).toBeDefined();
    expect(peakHours[0].reservation_count).toBeGreaterThan(0);
  });

  describe('generateReport', () => {
    it('debería generar un reporte completo con eventos y estadísticas de barberos', async () => {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // Mes actual (1-12)

      const report = await reportService.generateReport(
        currentYear,
        currentMonth,
      );

      expect(report).toBeDefined();
      expect(report).toHaveProperty('events');
      expect(report).toHaveProperty('stats');

      expect(Array.isArray(report.events)).toBe(true);
      expect(report.events.length).toBeGreaterThan(0);
      expect(report.events[0]).toHaveProperty('title');
      expect(report.events[0]).toHaveProperty('start');
      expect(report.events[0]).toHaveProperty('allDay');

      expect(Array.isArray(report.stats)).toBe(true);
      expect(report.stats.length).toBeGreaterThan(0);
      expect(report.stats[0]).toHaveProperty('barber_id');
      expect(report.stats[0]).toHaveProperty('barber_name');
      expect(report.stats[0]).toHaveProperty('base_salary');
      expect(report.stats[0]).toHaveProperty('total_generated');
      expect(report.stats[0]).toHaveProperty('payment');

      // Verificar que el pago se calcula correctamente (ejemplo simple)
      const barberWithSales = report.stats.find(
        (stat) => stat.total_generated > 0,
      );
      if (barberWithSales) {
        const expectedPayment =
          barberWithSales.total_generated > 2500
            ? barberWithSales.total_generated * 0.5
            : 1250;
        expect(barberWithSales.payment).toBeCloseTo(expectedPayment);
      }
    });

    it('debería manejar meses sin ventas', async () => {
      const year = 2020; // Un año donde probablemente no haya datos de prueba
      const month = 1; // Enero

      const report = await reportService.generateReport(year, month);

      expect(report).toBeDefined();
      expect(report.events).toEqual([]); // No debería haber eventos de venta
      expect(report.stats.length).toBeGreaterThan(0); // Debería haber barberos, pero con total_generated en 0
      report.stats.forEach((stat) => {
        expect(stat.total_generated).toBe(0);
        expect(stat.payment).toBe(1250); // Solo salario base
      });
    });
  });

  describe('getComprehensiveSales', () => {
    it('debería obtener todas las ventas sin filtros', async () => {
      const sales = await reportService.getComprehensiveSales({});
      expect(Array.isArray(sales)).toBe(true);
      expect(sales.length).toBeGreaterThan(0);
      expect(sales[0]).toHaveProperty('sale_id');
      expect(sales[0]).toHaveProperty('barber_name');
      expect(sales[0]).toHaveProperty('services_sold');
    });

    it('debería filtrar ventas por barberId', async () => {
      // Asumiendo que el barbero con ID 1 (Juan Pérez) tiene ventas
      const filteredSales = await reportService.getComprehensiveSales({
        barberId: 1,
      });
      expect(Array.isArray(filteredSales)).toBe(true);
      expect(filteredSales.length).toBeGreaterThan(0);
      filteredSales.forEach((sale) => {
        expect(sale.barber_name).toBe('Juan Pérez');
      });
    });

    it('debería filtrar ventas por paymentMethod', async () => {
      const filteredSales = await reportService.getComprehensiveSales({
        paymentMethod: 'cash',
      });
      expect(Array.isArray(filteredSales)).toBe(true);
      expect(filteredSales.length).toBeGreaterThan(0);
      filteredSales.forEach((sale) => {
        expect(sale.payment_method).toBe('cash');
      });
    });

    it('debería filtrar ventas por rango de fechas', async () => {
      const sales = await reportService.getComprehensiveSales({
        startDate: testStartDate,
        endDate: testEndDate,
      });
      expect(Array.isArray(sales)).toBe(true);
      expect(sales.length).toBeGreaterThan(0);
      sales.forEach((sale) => {
        expect(sale.sale_date >= testStartDate).toBe(true);
        expect(sale.sale_date <= testEndDate).toBe(true);
      });
    });

    it('debería filtrar ventas por serviceId', async () => {
      // Asumiendo que el servicio con ID 1 (Corte de Cabello) tiene ventas
      const filteredSales = await reportService.getComprehensiveSales({
        serviceId: 1,
      });
      expect(Array.isArray(filteredSales)).toBe(true);
      expect(filteredSales.length).toBeGreaterThan(0);
      filteredSales.forEach((sale) => {
        expect(sale.services_sold).toContain('Corte de Cabello');
      });
    });

    it('debería filtrar ventas por múltiples criterios', async () => {
      const filteredSales = await reportService.getComprehensiveSales({
        barberId: 1,
        paymentMethod: 'cash',
        startDate: testStartDate,
        endDate: testEndDate,
      });
      expect(Array.isArray(filteredSales)).toBe(true);
      expect(filteredSales.length).toBeGreaterThan(0);
      filteredSales.forEach((sale) => {
        expect(sale.barber_name).toBe('Juan Pérez');
        expect(sale.payment_method).toBe('cash');
        expect(sale.sale_date >= testStartDate).toBe(true);
        expect(sale.sale_date <= testEndDate).toBe(true);
      });
    });
  });

  describe('getServicesProductsSales', () => {
    it('debería obtener el resumen de ventas por tipo de servicio/producto', async () => {
      const summary = await reportService.getServicesProductsSales(
        testStartDate,
        testEndDate,
      );
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThan(0);
      expect(summary[0]).toHaveProperty('type');
      expect(summary[0]).toHaveProperty('total_sales_by_type');

      // Verificar que haya al menos 'service' y 'product'
      const serviceType = summary.find((item) => item.type === 'service');
      const productType = summary.find((item) => item.type === 'product');
      expect(serviceType).toBeDefined();
      expect(productType).toBeDefined();
      expect(serviceType.total_sales_by_type).toBeGreaterThan(0);
      expect(productType.total_sales_by_type).toBeGreaterThan(0);
    });

    it('debería manejar un rango de fechas sin ventas', async () => {
      const summary = await reportService.getServicesProductsSales(
        '2000-01-01',
        '2000-01-31',
      );
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBe(0);
    });
  });
});
