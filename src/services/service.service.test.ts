import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { ServiceService } from './service.service';

describe('ServiceService', () => {
  let db: Database;
  let serviceService: ServiceService;

  beforeEach(async () => {
    db = await setupTestDB(); // Obtener una nueva DB limpia para cada test
    serviceService = new ServiceService(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it('debería obtener todos los servicios', async () => {
    const services = await serviceService.getAllServices();
    expect(Array.isArray(services)).toBe(true);
    expect(services.length).toBeGreaterThan(0);
    expect(services[0].name).toBe('Aceite para Barba');
  });

  it('debería crear un nuevo servicio', async () => {
    const newService = {
      name: 'Nuevo Servicio',
      price: 100,
      duration_minutes: 60,
    };
    const createdService = await serviceService.createService(newService);
    expect(createdService).toHaveProperty('id');
    expect(createdService.name).toBe('Nuevo Servicio');
    expect(createdService.duration_minutes).toBe(60);

    const allServices = await serviceService.getAllServices();
    expect(allServices.length).toBe(10); // 9 iniciales + 1 nuevo
  });

  it('debería actualizar un servicio existente', async () => {
    const updatedService = await serviceService.updateService(1, {
      name: 'Corte Actualizado',
      price: 35,
      duration_minutes: 45,
    });
    expect(updatedService).not.toBeNull();
    expect(updatedService?.name).toBe('Corte Actualizado');
    expect(updatedService?.price).toBe(35);
    expect(updatedService?.duration_minutes).toBe(45);

    const service = (await serviceService.getAllServices()).find(
      (s) => s.id === 1,
    );
    expect(service?.name).toBe('Corte Actualizado');
    expect(service?.price).toBe(35);
    expect(service?.duration_minutes).toBe(45);
  });

  it('debería eliminar un servicio', async () => {
    // Creamos un nuevo servicio que no estará asociado a ninguna venta
    const serviceToDelete = await serviceService.createService({
      name: 'Servicio a Eliminar',
      price: 10,
      duration_minutes: 30,
    });
    const isDeleted = await serviceService.deleteService(serviceToDelete.id!);
    expect(isDeleted).toBe(true);

    const allServices = await serviceService.getAllServices();
    expect(allServices.some((s) => s.id === serviceToDelete.id)).toBe(false);
  });

  it('no debería eliminar un servicio asociado a una venta', async () => {
    // El servicio con ID 1 (Corte de Cabello) está en las ventas de prueba
    const result = await serviceService.deleteService(1);
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'No se puede eliminar el servicio porque está asociado a una venta.',
    );
  });

  it('no debería actualizar un servicio que no existe', async () => {
    const updatedService = await serviceService.updateService(999, {
      name: 'No Existe',
      price: 10,
      duration_minutes: 30,
    });
    expect(updatedService).toBeNull();
  });

  it('no debería eliminar un servicio que no existe', async () => {
    const isDeleted = await serviceService.deleteService(999);
    expect(isDeleted).toBe(false);
  });
});
