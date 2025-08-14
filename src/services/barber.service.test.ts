import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { BarberService } from './barber.service';

describe('BarberService', () => {
  let db: Database;
  let barberService: BarberService;

  beforeEach(async () => {
    db = await setupTestDB(); // Obtener una nueva DB limpia para cada test
    barberService = new BarberService(db);
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    jest.spyOn(console, 'log').mockImplementation(() => {}); // Suppress console.log
  });

  afterEach(async () => {
    await db.close();
    jest.restoreAllMocks(); // Restore console.error
  });

  it('debería obtener todos los barberos', async () => {
    const barbers = await barberService.getAllBarbers();
    expect(Array.isArray(barbers)).toBe(true);
    expect(barbers.length).toBeGreaterThan(0);
    expect(barbers[0].name).toBe('Juan Pérez');
  });

  it('debería crear un nuevo barbero', async () => {
    const newBarber = {
      name: 'Nuevo Barbero',
      email: 'nuevo.barbero@example.com',
      station_id: 1,
      base_salary: 1500,
    }; // Added email and station_id
    const createdBarber = await barberService.createBarber(newBarber);
    expect(createdBarber).toHaveProperty('id');
    expect(createdBarber.name).toBe('Nuevo Barbero');

    const allBarbers = await barberService.getAllBarbers();
    expect(allBarbers.length).toBe(4); // 3 iniciales + 1 nuevo
  });

  it('debería actualizar un barbero existente', async () => {
    const updatedBarber = await barberService.updateBarber(1, {
      name: 'Juan Actualizado',
      email: 'juan.actualizado@example.com',
      station_id: 1,
      base_salary: 1400,
    }); // Added email and station_id
    expect(updatedBarber).not.toBeNull();
    expect(updatedBarber?.name).toBe('Juan Actualizado');

    const barber = (await barberService.getAllBarbers()).find(
      (b) => b.id === 1,
    );
    expect(barber?.name).toBe('Juan Actualizado');
  });

  it('debería eliminar un barbero', async () => {
    const isDeleted = await barberService.deleteBarber(1);
    expect(isDeleted).toBe(true);

    const allBarbers = await barberService.getAllBarbers();
    expect(allBarbers.length).toBe(2); // 3 iniciales - 1 eliminado
    expect(allBarbers.some((b) => b.id === 1)).toBe(false);
  });

  it('no debería actualizar un barbero que no existe', async () => {
    const updatedBarber = await barberService.updateBarber(999, {
      name: 'No Existe',
      email: 'no.existe@example.com',
      station_id: 1,
      base_salary: 1000,
    }); // Added email and station_id
    expect(updatedBarber).toBeNull();
  });

  it('no debería eliminar un barbero que no existe', async () => {
    const isDeleted = await barberService.deleteBarber(999);
    expect(isDeleted).toBe(false);
  });
});
