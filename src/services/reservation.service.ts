import getPool from '../database';
import { PoolClient } from 'pg';
import { Reservation, ReservationProduct } from '../models/reservation.model';
import { Service } from '../models/service.model';
import { Barber } from '../models/barber.model'; // Assuming barber model exists or will be created
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

const pool = getPool();

interface CalendarViewData {
  reservations: Reservation[];
  barbers: Barber[];
  services: Service[];
}

interface PaginatedReservations {
  reservations: Reservation[];
  total: number;
  page: number;
  limit: number;
}


// --- HELPERS ---

const getReservationProducts = async (reservationId: number, client: PoolClient): Promise<ReservationProduct[]> => {
  const result = await client.query('SELECT * FROM reservation_products WHERE reservation_id = $1', [reservationId]);
  return result.rows;
}

// --- PUBLIC API ---

export const getAllReservations = async (page: number, limit: number, includeSaleDetails: boolean): Promise<PaginatedReservations> => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT r.*, b.name as barber_name, s.name as service_name
    FROM reservations r
    LEFT JOIN barbers b ON r.barber_id = b.id
    LEFT JOIN services s ON r.service_id = s.id
  `;

  if (includeSaleDetails) {
    query += `
      LEFT JOIN sales sa ON r.id = sa.reservation_id
    `;
  }

  query += `
    ORDER BY r.start_time DESC
    LIMIT $1 OFFSET $2
  `;

  const values = [limit, offset];

  const countQuery = 'SELECT COUNT(*) FROM reservations';

  const client = await pool.connect();
  try {
    const [reservationsResult, countResult] = await Promise.all([
      client.query(query, values),
      client.query(countQuery)
    ]);

    return {
      reservations: reservationsResult.rows,
      total: parseInt(countResult.rows[0].count, 10),
      page,
      limit,
    };
  } finally {
    client.release();
  }
};


export const createReservation = async (res: Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'service_price' | 'end_time'>): Promise<Reservation> => {
  const { barber_id, station_id, service_id, client_name, start_time, client_phone, client_email, notes, status } = res;

  const serviceResult = await pool.query('SELECT price, duration_minutes FROM services WHERE id = $1', [service_id]);
  if (serviceResult.rows.length === 0) {
    throw new Error('Service not found');
  }
  const service = serviceResult.rows[0];
  const service_price = service.price;
  const calculatedEndTime = new Date(new Date(start_time).getTime() + service.duration_minutes * 60000);
  const end_time = calculatedEndTime > new Date(start_time) ? calculatedEndTime : new Date(new Date(start_time).getTime() + 60000); // Ensure end_time is at least 1 minute after start_time

  const result = await pool.query(
    'INSERT INTO reservations (barber_id, station_id, service_id, client_name, start_time, end_time, status, service_price, notes, client_phone, client_email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    [barber_id, station_id, service_id, client_name, start_time, end_time, status || 'pending', service_price, notes, client_phone, client_email]
  );
  return result.rows[0];
};

export const addProductToReservation = async (reservationId: number, productId: number, quantity: number): Promise<ReservationProduct> => {
  const productResult = await pool.query('SELECT price FROM products WHERE id = $1', [productId]);
  if (productResult.rows.length === 0) {
    throw new Error('Product not found');
  }
  const price_at_reservation = productResult.rows[0].price;

  const result = await pool.query(
    'INSERT INTO reservation_products (reservation_id, product_id, quantity, price_at_reservation) VALUES ($1, $2, $3, $4) RETURNING *',
    [reservationId, productId, quantity, price_at_reservation]
  );
  return result.rows[0];
};

export const removeProductFromReservation = async (reservationProductId: number): Promise<void> => {
  await pool.query('DELETE FROM reservation_products WHERE id = $1', [reservationProductId]);
};


export const completeReservationAndCreateSale = async (reservationId: number, paymentMethod: string): Promise<any> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Get all reservation data
    const reservationResult = await client.query('SELECT * FROM reservations WHERE id = $1 FOR UPDATE', [reservationId]);
    const reservation = reservationResult.rows[0];
    if (!reservation) throw new Error('Reservation not found.');
    if (reservation.status === 'paid') throw new Error('Reservation is already paid.');

    const products = await getReservationProducts(reservationId, client);

    // 2. Calculate amounts
    const service_amount = reservation.service_price;
    const products_amount = products.reduce((sum, p) => sum + (p.price_at_reservation * p.quantity), 0);
    const total_amount = service_amount + products_amount;

    // 3. Create the sale record
    const saleResult = await client.query(
      'INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id',
      [reservation.id, reservation.barber_id, reservation.client_name, service_amount, products_amount, total_amount, paymentMethod]
    );
    const saleId = saleResult.rows[0].id;

    // 4. Create sale_items from service
    const serviceInfo = await client.query('SELECT name FROM services WHERE id = $1', [reservation.service_id]);
    await client.query(
      'INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [saleId, 'service', reservation.service_id, serviceInfo.rows[0].name, 1, service_amount, service_amount]
    );

    // 5. Create sale_items from products
    if (products.length > 0) {
      const productInfo = await client.query('SELECT id, name FROM products WHERE id = ANY($1::int[])', [products.map(p => p.product_id)]);
      const productMap = new Map(productInfo.rows.map(p => [p.id, p.name]));

      const productValues = products.map(p =>
        `(${saleId}, 'product', ${p.product_id}, '${productMap.get(p.product_id)}', ${p.quantity}, ${p.price_at_reservation}, ${p.price_at_reservation * p.quantity})`
      ).join(', ');

      await client.query(`INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES ${productValues}`);
    }

    // 6. Update reservation status
    await client.query("UPDATE reservations SET status = 'paid', updated_at = NOW() WHERE id = $1", [reservationId]);

    await client.query('COMMIT');

    return { saleId, total_amount };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in completeReservationAndCreateSale:', error);
    throw error;
  } finally {
    client.release();
  }
};

// ... other functions like getAllReservations, updateReservation, etc. will be updated or simplified later.

export const getAllServices = async (): Promise<Service[]> => {
  const result = await pool.query('SELECT id, name, duration_minutes, price FROM services WHERE is_active = true ORDER BY name ASC');
  return result.rows;
};

export const getCalendarViewData = async (startDate: string, endDate: string): Promise<CalendarViewData> => {
  const reservationsQuery = pool.query('SELECT * FROM reservations WHERE start_time >= $1 AND start_time <= $2 ORDER BY start_time ASC', [startDate, endDate]);
  const barbersQuery = pool.query('SELECT id, name FROM barbers WHERE is_active = true ORDER BY name ASC');
  const servicesQuery = pool.query('SELECT id, name, duration_minutes, price FROM services WHERE is_active = true ORDER BY name ASC');

  const [reservationsResult, barbersResult, servicesResult] = await Promise.all([
    reservationsQuery,
    barbersQuery,
    servicesQuery,
  ]);

  return {
    reservations: reservationsResult.rows,
    barbers: barbersResult.rows,
    services: servicesResult.rows,
  };
};

export const fixReservationEndTimes = async (): Promise<{ fixedCount: number }> => {
  const client = await pool.connect();
  let fixedCount = 0;
  try {
    await client.query('BEGIN');

    const services = await getAllServices();
    const serviceMap = new Map(services.map(s => [s.id, s]));

    const allReservationsResult = await client.query('SELECT id, start_time, end_time, service_id FROM reservations');
    const allReservations: Reservation[] = allReservationsResult.rows;
    console.log("allReservations", allReservations);

    for (const reservation of allReservations) {
      console.log("reservation", reservation)
      const service = serviceMap.get(reservation.service_id);
      if (!service) {
        console.warn(`Service with ID ${reservation.service_id} not found for reservation ${reservation.id}. Skipping.`);
        continue;
      }

      let currentStartTime = dayjs(reservation.start_time);
      let currentEndTime = dayjs(reservation.end_time);
      let updated = false;

      // Define business hours
      const businessStartHour = 8; // 8 AM
      const businessEndHour = 21; // 9 PM (21:00)

      // 1. Adjust start_time if before 8 AM
      if (currentStartTime.hour() < businessStartHour) {
        currentStartTime = currentStartTime.hour(businessStartHour).minute(0).second(0).millisecond(0);
        updated = true;
      }

      // 2. Recalculate expected end_time based on (potentially adjusted) start_time and service duration
      let expectedEndTime = currentStartTime.add(service.duration_minutes, 'minute');

      // 3. Adjust end_time if after 9 PM
      if (expectedEndTime.hour() > businessEndHour || (expectedEndTime.hour() === businessEndHour && expectedEndTime.minute() > 0)) {
        expectedEndTime = currentStartTime.hour(businessEndHour).minute(0).second(0).millisecond(0);
        // If setting end_time to 9 PM makes it earlier than start_time, adjust start_time
        if (expectedEndTime.isBefore(currentStartTime)) {
          currentStartTime = expectedEndTime.subtract(service.duration_minutes, 'minute');
          // If start_time goes before 8 AM due to this, cap it at 8 AM
          if (currentStartTime.hour() < businessStartHour) {
            currentStartTime = currentStartTime.hour(businessStartHour).minute(0).second(0).millisecond(0);
          }
        }
        updated = true;
      }

      // Ensure end_time is always after start_time (minimum 1 minute duration)
      if (expectedEndTime.isSameOrBefore(currentStartTime)) {
        expectedEndTime = currentStartTime.add(1, 'minute');
        updated = true;
      }

      // Update reservation if any changes were made
      if (updated || dayjs(reservation.start_time).toISOString() !== currentStartTime.toISOString() || dayjs(reservation.end_time).toISOString() !== expectedEndTime.toISOString()) {
        await client.query(
          'UPDATE reservations SET start_time = $1, end_time = $2, updated_at = NOW() WHERE id = $3',
          [currentStartTime.toISOString(), expectedEndTime.toISOString(), reservation.id]
        );
        fixedCount++;
      }
    }

    await client.query('COMMIT');
    return { fixedCount };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fixing reservation end times:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const cancelReservation = async (reservationId: number): Promise<Reservation> => {
  const result = await pool.query(
    "UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND status != 'paid' RETURNING *",
    [reservationId]
  );
  if (result.rowCount === 0) {
    throw new Error('Reservation not found or already paid.');
  }
  return result.rows[0];
};

export const getReservationById = async (reservationId: number, includeProducts: boolean = false): Promise<Reservation | null> => {
  const client = await pool.connect();
  try {
    const reservationResult = await client.query('SELECT * FROM reservations WHERE id = $1', [reservationId]);
    const reservation = reservationResult.rows[0];

    if (reservation && includeProducts) {
      reservation.products = await getReservationProducts(reservationId, client);
    }

    return reservation || null;
  } finally {
    client.release();
  }
};

export const updateReservationDetails = async (reservationId: number, details: Partial<Omit<Reservation, 'id' | 'created_at' | 'updated_at'>>): Promise<Reservation> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const currentReservationResult = await client.query('SELECT * FROM reservations WHERE id = $1 FOR UPDATE', [reservationId]);
    if (currentReservationResult.rows.length === 0) {
      throw new Error('Reservation not found');
    }
    const currentReservation = currentReservationResult.rows[0];

    // Recalculate end_time if service or start_time changes
    const newServiceId = details.service_id || currentReservation.service_id;
    const newStartTime = details.start_time || currentReservation.start_time;
    let newEndTime = currentReservation.end_time;
    let newServicePrice = currentReservation.service_price;

    if (details.service_id || details.start_time) {
      const serviceResult = await client.query('SELECT price, duration_minutes FROM services WHERE id = $1', [newServiceId]);
      if (serviceResult.rows.length === 0) {
        throw new Error('Service not found');
      }
      const service = serviceResult.rows[0];
      newServicePrice = service.price;
      const calculatedEndTime = new Date(new Date(newStartTime).getTime() + service.duration_minutes * 60000);
      newEndTime = calculatedEndTime > new Date(newStartTime) ? calculatedEndTime : new Date(new Date(newStartTime).getTime() + 60000); // Ensure end_time is at least 1 minute after start_time
    }

    const updateData = {
      ...currentReservation,
      ...details,
      end_time: newEndTime,
      service_price: newServicePrice,
    };

    const query = `
      UPDATE reservations SET
        barber_id = $1,
        station_id = $2,
        service_id = $3,
        client_name = $4,
        start_time = $5,
        end_time = $6,
        status = $7,
        service_price = $8,
        notes = $9,
        client_phone = $10,
        client_email = $11,
        updated_at = NOW()
      WHERE id = $12
      RETURNING *`;

    const values = [
      updateData.barber_id,
      updateData.station_id,
      updateData.service_id,
      updateData.client_name,
      updateData.start_time,
      updateData.end_time,
      updateData.status,
      updateData.service_price,
      updateData.notes,
      updateData.client_phone,
      updateData.client_email,
      reservationId
    ];

    const result = await client.query(query, values);

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating reservation details:', error);
    throw error;
  } finally {
    client.release();
  }
};
