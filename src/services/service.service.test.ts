// Removed sqlite imports and ServiceService class instantiation
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  Service, // Now correctly imported
  getProducts,
  updateProductStock,
  getLowStockProducts,
  getInventoryReportSummary,
} from './service.service';

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


describe('ServiceService', () => {
  let mockPoolQuery: jest.Mock; // Declare it here to use in beforeEach and tests

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    mockPoolQuery = _getMockPoolQuery(); // Get the fresh mock for each test
    mockPoolQuery.mockClear(); // Clear mocks before each test
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería obtener todos los servicios', async () => {
    const mockServicesData: Service[] = [
      { id: 1, name: 'Corte de Cabello', price: 25, duration_minutes: 30, type: 'service' },
      { id: 2, name: 'Afeitado Clásico', price: 20, duration_minutes: 25, type: 'service' },
      { id: 3, name: 'Corte y Barba', price: 40, duration_minutes: 50, type: 'service' },
      { id: 4, name: 'Gel Fijador Fuerte', price: 15, duration_minutes: 0, type: 'product', stock_quantity: 50, min_stock_level: 10 },
      { id: 5, name: 'Cera Modeladora', price: 18, duration_minutes: 0, type: 'product', stock_quantity: 40, min_stock_level: 15 },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockServicesData });

    const services = await getAllServices();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBe(5);
    expect(services[0].name).toBe('Corte de Cabello'); // Assuming order by type, name
  });

  it('debería crear un nuevo servicio', async () => {
    const newService: Service = {
      name: 'Nuevo Servicio',
      price: 100,
      duration_minutes: 60,
      type: 'service',
    };
    const createdServiceId = 6;
    const createdServiceData = { id: createdServiceId, ...newService };

    mockPoolQuery.mockResolvedValueOnce({ rows: [createdServiceData] });

    const createdService = await createService(newService);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO services (name, description, price, duration_minutes, type, stock_quantity, min_stock_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [newService.name, undefined, newService.price, newService.duration_minutes, newService.type, 0, 0],
    );
    expect(createdService).toHaveProperty('id', createdServiceId);
    expect(createdService.name).toBe('Nuevo Servicio');
    expect(createdService.duration_minutes).toBe(60);
  });

  it('debería actualizar un servicio existente', async () => {
    const serviceId = 1;
    const updateData: Partial<Service> = {
      name: 'Corte Actualizado',
      price: 35,
      duration_minutes: 45,
    };
    const updatedServiceData: Service = {
      id: serviceId,
      name: 'Corte Actualizado',
      description: null,
      price: 35,
      duration_minutes: 45,
      type: 'service',
      stock_quantity: 0,
      min_stock_level: 0,
    };

    mockPoolQuery.mockResolvedValueOnce({ rows: [updatedServiceData], rowCount: 1 });

    const updatedService = await updateService(serviceId, updateData as Service);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'UPDATE services SET name = $1, description = $2, price = $3, duration_minutes = $4, type = $5, stock_quantity = $6, min_stock_level = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [
        updateData.name,
        undefined, // description
        updateData.price,
        updateData.duration_minutes,
        'service',
        0, // default stock_quantity
        0, // default min_stock_level
        serviceId,
      ],
    );
    expect(updatedService).not.toBeNull();
    expect(updatedService?.name).toBe('Corte Actualizado');
    expect(updatedService?.price).toBe(35);
    expect(updatedService?.duration_minutes).toBe(45);
  });

  it('debería eliminar un servicio', async () => {
    const serviceIdToDelete = 10; // Assuming a service not linked to sales

    // Mock for checking sale_items (no sale items linked)
    mockPoolQuery.mockResolvedValueOnce({ rows: [] });
    // Mock for DELETE
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 1 });

    const result = await deleteService(serviceIdToDelete);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT id FROM sale_items WHERE service_id = $1', [serviceIdToDelete]);
    expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM services WHERE id = $1', [serviceIdToDelete]);
    expect(result).toEqual({ message: 'Service deleted successfully' });
  });

  it('no debería eliminar un servicio asociado a una venta', async () => {
    const serviceIdWithSale = 1; // Assuming service ID 1 is linked to a sale

    // Mock for checking sale_items (sale items linked)
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ id: 101 }] }); // Simulate a sale item linked

    const result = await deleteService(serviceIdWithSale);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT id FROM sale_items WHERE service_id = $1', [serviceIdWithSale]);
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'No se puede eliminar el servicio porque está asociado a una venta.',
    );
  });

  it('no debería actualizar un servicio que no existe', async () => {
    const serviceId = 999;
    const updateData: Partial<Service> = {
      name: 'No Existe',
      price: 10,
      duration_minutes: 30,
    };

    mockPoolQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // Simulate no rows updated

    const updatedService = await updateService(serviceId, updateData as Service);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'UPDATE services SET name = $1, description = $2, price = $3, duration_minutes = $4, type = $5, stock_quantity = $6, min_stock_level = $7, updated_at = NOW() WHERE id = $8 RETURNING *',
      [
        updateData.name,
        undefined,
        updateData.price,
        updateData.duration_minutes,
        'service',
        0,
        0,
        serviceId,
      ],
    );
    expect(updatedService).toBeNull();
  });

  it('no debería eliminar un servicio que no existe', async () => {
    const serviceIdToDelete = 999;

    // Mock for checking sale_items (no sale items linked)
    mockPoolQuery.mockResolvedValueOnce({ rows: [] });
    // Mock for DELETE - simulate no rows deleted
    mockPoolQuery.mockResolvedValueOnce({ rowCount: 0 });

    const result = await deleteService(serviceIdToDelete);
    expect(mockPoolQuery).toHaveBeenCalledWith('SELECT id FROM sale_items WHERE service_id = $1', [serviceIdToDelete]);
    expect(mockPoolQuery).toHaveBeenCalledWith('DELETE FROM services WHERE id = $1', [serviceIdToDelete]);
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe('Service not found');
  });

  // --- Additional tests for other functions in service.service.ts ---

  it('debería obtener todos los productos', async () => {
    const mockProductsData: Service[] = [
      { id: 4, name: 'Gel Fijador Fuerte', price: 15, duration_minutes: 0, type: 'product', stock_quantity: 50, min_stock_level: 10 },
      { id: 5, name: 'Cera Modeladora', price: 18, duration_minutes: 0, type: 'product', stock_quantity: 40, min_stock_level: 15 },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockProductsData });

    const products = await getProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBe(2);
    expect(products[0].name).toBe('Gel Fijador Fuerte'); // Corrected expectation
  });

  it('debería actualizar el stock de un producto', async () => {
    const productId = 4;
    const newQuantity = 45;
    const updatedProductData: Service = {
      id: productId,
      name: 'Gel Fijador Fuerte',
      description: null,
      price: 15,
      duration_minutes: 0,
      type: 'product',
      stock_quantity: newQuantity,
      min_stock_level: 10,
    };

    mockPoolQuery.mockResolvedValueOnce({ rows: [updatedProductData], rowCount: 1 });

    const updatedProduct = await updateProductStock(productId, newQuantity);
    expect(mockPoolQuery).toHaveBeenCalledWith(
      "UPDATE services SET stock_quantity = $1, updated_at = NOW() WHERE id = $2 AND type = 'product' RETURNING *",
      [newQuantity, productId],
    );
    expect(updatedProduct).not.toBeNull();
    expect(updatedProduct?.stock_quantity).toBe(newQuantity);
  });

  it('debería obtener productos con bajo stock', async () => {
    const mockLowStockProducts: Service[] = [
      { id: 4, name: 'Gel Fijador Fuerte', price: 15, duration_minutes: 0, type: 'product', stock_quantity: 5, min_stock_level: 10 },
    ];
    mockPoolQuery.mockResolvedValue({ rows: mockLowStockProducts });

    const lowStockProducts = await getLowStockProducts();
    expect(Array.isArray(lowStockProducts)).toBe(true);
    expect(lowStockProducts.length).toBe(1);
    expect(lowStockProducts[0].name).toBe('Gel Fijador Fuerte');
  });

  it('debería obtener el resumen del informe de inventario', async () => {
    mockPoolQuery.mockResolvedValueOnce({ rows: [{ total_products: '2', low_stock_count: '1', total_inventory_value: '1000' }] });

    const summary = await getInventoryReportSummary();
    expect(summary).toEqual({
      totalProducts: 2,
      lowStockCount: 1,
      totalInventoryValue: 1000,
    });
  });
});
