import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { SaleService } from './sale.service';

describe('SaleService', () => {
  let db: Database;
  let saleService: SaleService;
  let testStartDate: string;
  let testEndDate: string;

  beforeEach(async () => {
    db = await setupTestDB(); // Obtener una nueva DB limpia para cada test
    saleService = new SaleService(db);

    const today = new Date();
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
    testStartDate = fortyFiveDaysAgo.toISOString().split('T')[0];
    testEndDate = today.toISOString().split('T')[0];
  });

  afterEach(async () => {
    await db.close();
  });

  it('debería obtener todas las ventas', async () => {
    const sales = await saleService.getAllSales();
    expect(Array.isArray(sales)).toBe(true);
    expect(sales.length).toBeGreaterThan(0);
    expect(sales[0]).toHaveProperty('customer_name');
  });

  it('debería crear una nueva venta', async () => {
    const newSale = {
      sale_date: '2025-08-15',
      barber_id: 1,
      station_id: 1,
      total_amount: 50,
      customer_name: 'Nuevo Cliente',
      payment_method: 'cash',
      services: [
        {
          service_id: 1,
          price_at_sale: 30,
          name: 'Service 1',
          type: 'service',
        },
        {
          service_id: 2,
          price_at_sale: 20,
          name: 'Service 2',
          type: 'service',
        },
      ],
    };
    const createdSale = await saleService.createSale(newSale);
    expect(createdSale).toHaveProperty('id');
    expect(createdSale.customer_name).toBe('Nuevo Cliente');

    const allSales = await saleService.getAllSales();
    expect(allSales.length).toBeGreaterThan(0); // Ya hay datos de prueba
  });

  it('debería obtener ventas filtradas por día', async () => {
    const sales = await saleService.getFilteredSales('day', testEndDate);
    expect(Array.isArray(sales)).toBe(true);
    expect(sales.length).toBeGreaterThan(0);
  });

  it('debería obtener el resumen de ventas por rango de fechas', async () => {
    const summary = await saleService.getSalesSummaryByDateRange(
      testStartDate,
      testEndDate,
    );
    expect(Array.isArray(summary)).toBe(true);
    expect(summary.length).toBeGreaterThan(0);
    expect(summary[0]).toHaveProperty('date');
    expect(summary[0]).toHaveProperty('total');
  });

  it('debería obtener el ranking de ventas por barbero', async () => {
    const ranking = await saleService.getBarberSalesRanking(
      testStartDate,
      testEndDate,
    );
    expect(Array.isArray(ranking)).toBe(true);
    expect(ranking.length).toBeGreaterThan(0);
    expect(ranking[0]).toHaveProperty('barber_name');
    expect(ranking[0]).toHaveProperty('total_sales');
  });

  it('debería obtener el total de pagos a barberos', async () => {
    const totalPayments = await saleService.getTotalPaymentsToBarbers(
      testStartDate,
      testEndDate,
    );
    expect(typeof totalPayments).toBe('number');
    expect(totalPayments).toBeGreaterThan(0);
  });

  it('debería obtener el resumen de ventas por servicio', async () => {
    const summary = await saleService.getSalesSummaryByService(
      testStartDate,
      testEndDate,
    );
    expect(Array.isArray(summary)).toBe(true);
    expect(summary.length).toBeGreaterThan(0);
    expect(summary[0]).toHaveProperty('service_name');
    expect(summary[0]).toHaveProperty('total_sales');
  });

  it('debería obtener el resumen de ventas por método de pago', async () => {
    const summary = await saleService.getSalesSummaryByPaymentMethod(
      testStartDate,
      testEndDate,
    );
    expect(Array.isArray(summary)).toBe(true);
    expect(summary.length).toBeGreaterThan(0);
    expect(summary[0]).toHaveProperty('payment_method');
    expect(summary[0]).toHaveProperty('total_sales');
  });
});
