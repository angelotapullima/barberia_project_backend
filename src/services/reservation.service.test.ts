import { Database } from 'sqlite';
import { setupTestDB } from '../database';
import { ReservationService } from './reservation.service';
import { saleService } from './sale.service';

describe('ReservationService', () => {
  let db: Database;
  let reservationService: ReservationService;
  let testStartDate: string;
  let testEndDate: string;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});

    db = await setupTestDB();
    reservationService = new ReservationService(db);
    (saleService as any)['db'] = db; // Inject test db into saleService singleton

    const today = new Date();
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(today.getDate() - 45);
    testStartDate = fortyFiveDaysAgo.toISOString().split('T')[0];
    testEndDate = today.toISOString().split('T')[0];
  });

  afterEach(async () => {
    await db.close();
    jest.restoreAllMocks();
  });

  it('debería obtener todas las reservaciones', async () => {
    const reservations = await reservationService.getAllReservations();
    expect(Array.isArray(reservations)).toBe(true);
    expect(reservations.length).toBeGreaterThan(0);
    expect(reservations[0]).toHaveProperty('client_name');
  });

  it('debería crear una nueva reservación', async () => {
    const initialReservations = await reservationService.getAllReservations();
    const newReservation = {
      barber_id: 1,
      station_id: 1,
      client_name: 'Test Customer',
      client_phone: '+1234567890',
      start_time: '2025-08-15T10:00:00.000Z',
      end_time: '2025-08-15T11:00:00.000Z',
      service_id: 1,
    };
    const createdReservation =
      await reservationService.createReservation(newReservation);
    expect(createdReservation).toHaveProperty('id');
    expect(createdReservation.client_name).toBe('Test Customer');

    const allReservationsAfterCreation =
      await reservationService.getAllReservations();
    expect(allReservationsAfterCreation.length).toBe(
      initialReservations.length + 1,
    );
  });

  it('debería obtener una reservación por ID', async () => {
    const allReservations = await reservationService.getAllReservations();
    const firstReservationId = allReservations[0].id!;
    const reservation =
      await reservationService.getReservationById(firstReservationId);
    expect(reservation).toBeDefined();
    expect(reservation?.id).toBe(firstReservationId);
  });

  it('debería actualizar una reservación existente', async () => {
    const allReservations = await reservationService.getAllReservations();
    const firstReservationId = allReservations[0].id!;
    const updatedName = 'Updated Customer';
    await reservationService.updateReservation(firstReservationId, {
      client_name: updatedName,
    });

    const updatedReservation =
      await reservationService.getReservationById(firstReservationId);
    expect(updatedReservation?.client_name).toBe(updatedName);
  });

  it('debería eliminar una reservación', async () => {
    const allReservations = await reservationService.getAllReservations();
    const firstReservationId = allReservations[0].id!;
    await reservationService.deleteReservation(firstReservationId);

    const deletedReservation =
      await reservationService.getReservationById(firstReservationId);
    expect(deletedReservation).toBeUndefined();
  });

  it('debería obtener el conteo de reservaciones en un rango de fechas', async () => {
    const count = await reservationService.getReservationCount(
      testStartDate,
      testEndDate,
    );
    expect(count).toBeGreaterThan(0);
  });

  it('debería obtener el conteo de reservaciones completadas en un rango de fechas', async () => {
    const count = await reservationService.getCompletedReservationCount(
      testStartDate,
      testEndDate,
    );
    expect(count).toBeGreaterThan(0);
  });

  it('debería obtener las reservaciones completadas en un rango de fechas', async () => {
    const completedReservations =
      await reservationService.getCompletedReservations(
        testStartDate,
        testEndDate,
      );
    expect(Array.isArray(completedReservations)).toBe(true);
    expect(completedReservations.length).toBeGreaterThan(0);
    expect(completedReservations[0].status).toBe('completed');
  });

  describe('completeReservationAndCreateSale', () => {
    it('debería completar una reserva y crear una venta', async () => {
      const newReservation = {
        barber_id: 1,
        station_id: 1,
        client_name: 'Cliente para Venta',
        start_time: '2025-09-01T10:00:00.000Z',
        end_time: '2025-09-01T11:00:00.000Z',
        service_id: 1,
        status: 'pending',
      };
      const createdReservation =
        await reservationService.createReservation(newReservation);

      const newSale = await reservationService.completeReservationAndCreateSale(
        createdReservation.id!,
      );

      const updatedReservation = await reservationService.getReservationById(
        createdReservation.id!,
      );
      expect(updatedReservation?.status).toBe('completed');

      expect(newSale).toBeDefined();
      expect(newSale).toHaveProperty('id');
      expect(newSale.reservation_id).toBe(createdReservation.id);

      const sales = await db.all(
        'SELECT * FROM sales WHERE id = ?',
        newSale.id,
      );
      expect(sales.length).toBe(1);
      expect(sales[0].reservation_id).toBe(createdReservation.id);
    });

    it('debería lanzar un error si la reserva no se encuentra', async () => {
      await expect(
        reservationService.completeReservationAndCreateSale(99999),
      ).rejects.toThrow('Reservation not found.');
    });

    it('debería lanzar un error si la reserva ya está completada', async () => {
      const newReservation = {
        barber_id: 1,
        station_id: 1,
        client_name: 'Cliente Completado',
        start_time: '2025-09-02T10:00:00.000Z',
        end_time: '2025-09-02T11:00:00.000Z',
        service_id: 1,
        status: 'completed',
      };
      const createdReservation =
        await reservationService.createReservation(newReservation);

      await expect(
        reservationService.completeReservationAndCreateSale(
          createdReservation.id!,
        ),
      ).rejects.toThrow('Reservation is already completed.');
    });
  });
});
