import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { StationService } from './station.service';

describe('StationService', () => {
  let db: Database;
  let stationService: StationService;

  beforeEach(async () => {
    db = await setupTestDB(); // Obtener una nueva DB limpia para cada test
    stationService = new StationService(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it('debería obtener todas las estaciones', async () => {
    const stations = await stationService.getAllStations();
    expect(Array.isArray(stations)).toBe(true);
    expect(stations.length).toBeGreaterThan(0);
    expect(stations[0].name).toBe('Estación Central');
  });

  it('debería crear una nueva estación', async () => {
    const newStation = { name: 'Nueva Estación' };
    const createdStation = await stationService.createStation(newStation);
    expect(createdStation).toHaveProperty('id');
    expect((createdStation as { name: string }).name).toBe('Nueva Estación');

    const allStations = await stationService.getAllStations();
    expect(allStations.length).toBe(4); // 3 iniciales + 1 nuevo
  });

  it('debería actualizar una estación existente', async () => {
    const updatedStation = await stationService.updateStation(1, {
      name: 'Central Actualizada',
    });
    expect(updatedStation).not.toBeNull();
    expect((updatedStation as { name: string })?.name).toBe(
      'Central Actualizada',
    );

    const station = (await stationService.getAllStations()).find(
      (s) => s.id === 1,
    );
    expect(station?.name).toBe('Central Actualizada');
  });

  it('debería eliminar una estación', async () => {
    // Primero, asegurémonos de que no haya barberos asignados a la estación 3
    await db.run(
      'UPDATE barbers SET station_id = ? WHERE station_id = ?',
      [1, 3],
    );

    const isDeleted = await stationService.deleteStation(3);
    expect(isDeleted).toBe(true);

    const allStations = await stationService.getAllStations();
    expect(allStations.length).toBe(2); // 3 iniciales - 1 eliminado
    expect(allStations.some((s) => s.id === 3)).toBe(false);
  });

  it('no debería crear más de 10 estaciones', async () => {
    // Crear 7 estaciones adicionales (ya hay 3)
    for (let i = 0; i < 7; i++) {
      await stationService.createStation({ name: `Estación ${i + 4}` });
    }
    const result = await stationService.createStation({ name: 'Estación 11' });
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'No se pueden crear más de 10 estaciones.',
    );
  });

  it('no debería crear una estación con nombre duplicado', async () => {
    const result = await stationService.createStation({
      name: 'Estación Central',
    });
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'El nombre de la estación ya existe.',
    );
  });

  it('no debería actualizar una estación con nombre duplicado', async () => {
    const result = await stationService.updateStation(2, {
      name: 'Estación Central',
    });
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'El nombre de la estación ya existe.',
    );
  });

  it('no debería eliminar una estación si tiene barberos asignados', async () => {
    // La estación 1 tiene un barbero asignado por defecto (Juan Pérez)
    const result = await stationService.deleteStation(1);
    expect(result).toHaveProperty('error');
    expect((result as { error: string }).error).toBe(
      'No se puede eliminar la estación porque está asignada a un barbero.',
    );
  });

  it('no debería actualizar una estación que no existe', async () => {
    const updatedStation = await stationService.updateStation(999, {
      name: 'No Existe',
    });
    expect(updatedStation).toBeNull();
  });

  it('no debería eliminar una estación que no existe', async () => {
    const isDeleted = await stationService.deleteStation(999);
    expect(isDeleted).toBe(false);
  });
});
