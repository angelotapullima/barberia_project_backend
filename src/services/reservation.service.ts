import setup from '../database';
import { createSale } from './sale.service';
import { PoolClient } from 'pg';

const pool = setup();

// Keep interfaces for type safety
export interface SaleItem {
  id?: number;
  sale_id?: number;
  item_id: number;
  price: number;
  price_at_sale: number;
  item_name?: string;
  type?: string;
  quantity: number;
}

export interface Sale {
  id: number;
  total_amount: number;
  payment_method: string;
  sale_items: SaleItem[];
}

export interface Reservation {
  id?: number;
  barber_id: number;
  station_id: number;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  start_time: string;
  end_time: string;
  service_id: number;
  status?: string;
  notes?: string;
  created_at?: string;
  barber_name?: string;
  service_name?: string;
  station_name?: string; // Added this line
  sale?: Sale;
}

function buildReservationQuery(includeSaleDetails: boolean): { query: string; selectFields: string[] } {
  const selectFields = [
    'r.id', 'r.barber_id', 'b.name as barber_name',
    'r.station_id', 'st.name as station_name', 'r.client_name', 'r.client_phone', 'r.client_email',
    'r.start_time', 'r.end_time', 'r.service_id', 's.name as service_name',
    'r.status', 'r.notes', 'r.created_at'
  ];
  if (includeSaleDetails) {
    selectFields.push(
      'sale.id as sale_id', 'sale.total_amount as sale_total',
      'sale.payment_method as sale_payment_method',
      'si.id as sale_item_id', 'si.item_name as sale_item_name',
      'si.price_at_sale as sale_item_price', 'si.quantity as sale_item_quantity'
    );
  }
  let query = `
    SELECT
      ${selectFields.join(', ')}
    FROM reservations r
    JOIN barbers b ON r.barber_id = b.id
    JOIN services s ON r.service_id = s.id
    LEFT JOIN stations st ON r.station_id = st.id
  `;
  if (includeSaleDetails) {
    query += `
      LEFT JOIN sales sale ON r.id = sale.reservation_id
      LEFT JOIN sale_items si ON sale.id = si.sale_id
    `;
  }
  query += ` ORDER BY r.start_time DESC `;
  return { query, selectFields };
}

function addSaleItemToReservation(reservation: Reservation, row: any) {
  if (!reservation.sale) return;
  const existingItem = reservation.sale.sale_items.find(
    (item) => item.id === row.sale_item_id,
  );
  if (!existingItem) {
    reservation.sale.sale_items.push({
      id: row.sale_item_id,
      item_id: row.sale_item_id,
      item_name: row.sale_item_name,
      price: Number(row.sale_item_price),
      price_at_sale: Number(row.sale_item_price),
      quantity: Number(row.sale_item_quantity),
    });
  }
}

function mapReservationRows(
  rows: any[],
  includeSaleDetails: boolean
): Reservation[] {
  const reservationsMap = new Map<number, Reservation>();
  for (const row of rows) {
    if (!reservationsMap.has(row.id)) {
      reservationsMap.set(row.id, {
        id: row.id,
        barber_id: row.barber_id,
        barber_name: row.barber_name,
        station_id: row.station_id,
        station_name: row.station_name,
        client_name: row.client_name,
        client_phone: row.client_phone,
        client_email: row.client_email,
        start_time: row.start_time,
        end_time: row.end_time,
        service_id: row.service_id,
        service_name: row.service_name,
        status: row.status,
        notes: row.notes,
        created_at: row.created_at,
        sale: includeSaleDetails && row.sale_id
          ? {
            id: row.sale_id,
            total_amount: Number(row.sale_total),
            payment_method: row.sale_payment_method,
            sale_items: [],
          }
          : undefined,
      });
    }
    if (includeSaleDetails && row.sale_id && row.sale_item_id) {
      const reservation = reservationsMap.get(row.id)!;
      addSaleItemToReservation(reservation, row);
    }
  }
  return Array.from(reservationsMap.values());
}

export const getAllReservations = async (
  page: number,
  limit: number,
  includeSaleDetails: boolean = false,
): Promise<{ reservations: Reservation[]; total: number; page: number }> => {
  const offset = (page - 1) * limit;
  const { query } = buildReservationQuery(includeSaleDetails);

  const paginatedQuery = `${query} LIMIT $1 OFFSET $2`;
  const params = [limit, offset];

  const { rows } = await pool.query(paginatedQuery, params);

  const countQuery = `SELECT COUNT(*) FROM reservations r`;
  const totalResult = await pool.query(countQuery, []);
  const total = Number(totalResult.rows[0].count);

  const reservations = mapReservationRows(rows, includeSaleDetails);

  return { reservations, total, page };
};

export const getReservationById = async (id: number): Promise<Reservation | null> => {
  const { rows } = await pool.query(
    `
    SELECT 
        r.id, r.barber_id, b.name as barber_name,
        r.station_id,
        r.client_name, r.client_phone, r.client_email,
        r.start_time, r.end_time, r.service_id, s.name as service_name,
        r.status, r.notes, r.created_at
    FROM reservations r
    JOIN barbers b ON r.barber_id = b.id
    JOIN services s ON r.service_id = s.id
    WHERE r.id = $1
  `,
    [id],
  );
  return rows[0] || null;
};

export const createReservation = async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
  const {
    barber_id,
    station_id,
    client_name,
    client_phone,
    client_email,
    start_time,
    end_time,
    service_id,
    status,
    notes,
  } = reservation;
  const { rows } = await pool.query(
    'INSERT INTO reservations (barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
    [
      barber_id,
      station_id,
      client_name,
      client_phone || null,
      client_email || null,
      start_time,
      end_time,
      service_id,
      status || 'pending',
      notes || null,
    ],
  );
  return rows[0];
};

export const updateReservation = async (
  id: number,
  reservation: Partial<Reservation>,
): Promise<Reservation | null> => {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  // Dynamically build the SET part of the query
  for (const [key, value] of Object.entries(reservation)) {
    if (value !== undefined) {
      fields.push(`${key} = $${paramIndex++}`);
      params.push(value);
    }
  }

  if (fields.length === 0) {
    return getReservationById(id); // Nothing to update, return current state
  }

  params.push(id);
  const sql = `UPDATE reservations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING *`;

  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
};

export const deleteReservation = async (id: number): Promise<{ message: string } | { error: string }> => {
  const result = await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return { error: 'Reservation not found' };
  }
  return { message: 'Reservation deleted successfully' };
};


export const completeReservationAndCreateSale = async (reservationId: number): Promise<any> => {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const reservationResult = await client.query('SELECT * FROM reservations WHERE id = $1 FOR UPDATE', [reservationId]);
    const reservation = reservationResult.rows[0];

    if (!reservation) {
      throw new Error('Reservation not found.');
    }

    if (reservation.status === 'completed') {
      throw new Error('Reservation is already completed.');
    }

    await client.query("UPDATE reservations SET status = 'completed', updated_at = NOW() WHERE id = $1", [reservationId]);

    const serviceResult = await client.query('SELECT id, name, price, type FROM services WHERE id = $1', [reservation.service_id]);
    const service = serviceResult.rows[0];
    if (!service) {
      throw new Error('Service not found for reservation.');
    }

    const saleDate = new Date().toISOString();
    const totalAmount = service.price;

    const newSale = await createSale({
      sale_date: saleDate,
      total_amount: totalAmount,
      customer_name: reservation.client_name,
      payment_method: 'cash',
      reservation_id: reservation.id,
      sale_items: [
        {
          item_id: service.id,
          service_id: service.id, // Make sure service_id is passed
          item_type: service.type,
          item_name: service.name,
          price: service.price,
          price_at_sale: service.price,
          quantity: 1,
        },
      ],
    }, client); // Pass the client to use the same transaction

    await client.query('COMMIT');
    return newSale;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error completing reservation and creating sale:', error);
    throw error; // Re-throw the error after rollback
  } finally {
    client.release();
  }
};