import setup from '../database';

const pool = setup();

// --- INTERFACES (puedes moverlas a un archivo de tipos dedicado) ---
export interface CalendarEvent {
  title: string;
  start: string;
  allDay: boolean;
}

export interface BarberStat {
  barber_id: number;
  barber_name: string;
  base_salary: number;
  total_generated: number;
  payment: number;
}

export interface ReportData {
  events: CalendarEvent[];
  stats: BarberStat[];
}

// --- PUBLIC API ---

export const getComprehensiveSales = async (filters: {
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any[]> => {
  let query = `
    SELECT
        s.id AS sale_id,
        s.sale_date,
        s.total_amount,
        s.customer_name,
        s.payment_method,
        STRING_AGG(si.item_name || ' (' || si.price_at_sale || ')', ', ') AS items_sold
    FROM sales s
    JOIN sale_items si ON s.id = si.sale_id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.paymentMethod) {
    query += ` AND s.payment_method = $${paramIndex++}`;
    params.push(filters.paymentMethod);
  }
  if (filters.startDate) {
    query += ` AND s.sale_date >= $${paramIndex++}`;
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND s.sale_date <= $${paramIndex++}`;
    params.push(filters.endDate);
  }

  query += ` GROUP BY s.id ORDER BY s.sale_date DESC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const getServicesProductsSales = async (
  startDate: string,
  endDate: string
): Promise<{ type: string; total_sales_by_type: number }[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      DATE(sa.sale_date) as date,
      si.item_type as type,
      SUM(si.price_at_sale * si.quantity) as total_sales_by_type
    FROM sale_items si
    JOIN sales sa ON si.sale_id = sa.id
    WHERE sa.sale_date::date BETWEEN $1 AND $2
    GROUP BY DATE(sa.sale_date), si.item_type
    ORDER BY date, type;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, total_sales_by_type: Number(r.total_sales_by_type)}));
};

export const getBarberPayments = async (
  startDate: string,
  endDate: string
): Promise<{ barber_id: number; barber_name: string; total_service_sales: number; payment: number }[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      b.id AS barber_id,
      b.name AS barber_name,
      COALESCE(SUM(si.price_at_sale * si.quantity), 0) AS total_service_sales
    FROM barbers b
    LEFT JOIN reservations r ON b.id = r.barber_id
    LEFT JOIN sales s ON r.id = s.reservation_id AND s.sale_date::date BETWEEN $1 AND $2
    LEFT JOIN sale_items si ON s.id = si.sale_id AND si.item_type = 'service'
    GROUP BY
      b.id, b.name
    ORDER BY
      total_service_sales DESC;
  `,
    [startDate, endDate],
  );

  // La lógica de pago se mantiene igual, solo se aplica a los resultados de la nueva consulta
  return rows.map((row: any) => {
    const total_service_sales = Number(row.total_service_sales);
    const settings = { commission_percentage: 0.5, base_salary_threshold: 2500, default_base_salary: 1250 }; // Estos valores podrían venir de la tabla settings
    let payment = settings.default_base_salary;
    if (total_service_sales > settings.base_salary_threshold) {
      payment = total_service_sales * settings.commission_percentage;
    }
    return {
      barber_id: row.barber_id,
      barber_name: row.barber_name,
      total_service_sales: total_service_sales,
      payment: payment,
    };
  });
};

export const getDetailedBarberServiceSales = async (filters: {
  barberId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<any[]> => {
  let query = `
    SELECT
      b.name AS barber_name,
      svc.name AS service_name,
      sa.sale_date,
      si.price_at_sale AS service_price
    FROM sales sa
    JOIN sale_items si ON sa.id = si.sale_id
    JOIN services svc ON si.service_id = svc.id
    LEFT JOIN reservations r ON sa.reservation_id = r.id
    LEFT JOIN barbers b ON r.barber_id = b.id
    WHERE si.item_type = 'service'
  `;
  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (filters.barberId) {
    query += ` AND b.id = $${paramIndex++}`;
    params.push(filters.barberId);
  }
  if (filters.startDate) {
    query += ` AND sa.sale_date >= $${paramIndex++}`;
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND sa.sale_date <= $${paramIndex++}`;
    params.push(filters.endDate);
  }

  query += ` ORDER BY sa.sale_date DESC, b.name ASC`;

  const { rows } = await pool.query(query, params);
  return rows;
};

export const getStationUsage = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      st.name AS station_name,
      COUNT(r.id)::integer AS completed_reservations_count
    FROM stations st
    LEFT JOIN reservations r ON st.id = r.station_id
    WHERE r.status = 'completed' AND r.start_time::date BETWEEN $1 AND $2
    GROUP BY st.id, st.name
    ORDER BY st.name ASC;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, completed_reservations_count: Number(r.completed_reservations_count)}));
};

export const getCustomerFrequency = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      customer_name,
      COUNT(id)::integer AS visit_count,
      SUM(total_amount)::real AS total_spent
    FROM sales
    WHERE sale_date::date BETWEEN $1 AND $2 AND customer_name IS NOT NULL AND customer_name != ''
    GROUP BY customer_name
    ORDER BY visit_count DESC, total_spent DESC;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, visit_count: Number(r.visit_count), total_spent: Number(r.total_spent)}));
};

export const getPeakHours = async (startDate: string, endDate: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `
    SELECT
      EXTRACT(HOUR FROM start_time) AS hour,
      COUNT(id)::integer AS reservation_count
    FROM reservations
    WHERE start_time::date BETWEEN $1 AND $2
    GROUP BY hour
    ORDER BY hour ASC;
  `,
    [startDate, endDate],
  );
  return rows.map(r => ({...r, hour: Number(r.hour), reservation_count: Number(r.reservation_count)}));
};

export const generateReport = async (
  year: number,
  month: number,
): Promise<ReportData> => {
  // Obtener el primer y último día del mes
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // Formatear fechas para la consulta SQL
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // 1. Obtener eventos (ventas y reservas) para el calendario
  const salesEventsResult = await pool.query(
    `
    SELECT
      'Venta: ' || COALESCE(s.customer_name, 'Cliente Desconocido') || ' - ' || s.total_amount || '€' AS title,
      s.sale_date AS start,
      TRUE AS allDay
    FROM sales s
    WHERE s.sale_date::date BETWEEN $1 AND $2
    ORDER BY s.sale_date;
  `,
    [startDateStr, endDateStr],
  );

  const reservationEventsResult = await pool.query(
    `
    SELECT
      'Reserva: ' || r.client_name || ' (' || b.name || ')' AS title,
      r.start_time AS start,
      FALSE AS allDay
    FROM reservations r
    JOIN barbers b ON r.barber_id = b.id
    WHERE r.start_time::date BETWEEN $1 AND $2
    ORDER BY r.start_time;
  `,
    [startDateStr, endDateStr],
  );

  const events: CalendarEvent[] = [
    ...salesEventsResult.rows.map((row: any) => ({
      title: row.title,
      start: row.start.toISOString(),
      allDay: row.allDay,
    })),
    ...reservationEventsResult.rows.map((row: any) => ({
      title: row.title,
      start: row.start.toISOString(),
      allDay: row.allDay,
    })),
  ];

  // 2. Obtener estadísticas de barberos
  const barberStatsResult = await pool.query(
    `
    SELECT
      b.id AS barber_id,
      b.name AS barber_name,
      b.base_salary,
      COALESCE(SUM(si.price_at_sale * si.quantity), 0) AS total_generated
    FROM barbers b
    LEFT JOIN reservations r ON b.id = r.barber_id
    LEFT JOIN sales s ON r.id = s.reservation_id AND s.sale_date::date BETWEEN $1 AND $2
    LEFT JOIN sale_items si ON s.id = si.sale_id AND si.item_type = 'service'
    GROUP BY
      b.id, b.name, b.base_salary
    ORDER BY
      total_generated DESC;
  `,
    [startDateStr, endDateStr],
  );

  const stats: BarberStat[] = barberStatsResult.rows.map((row: any) => {
    const total_generated = Number(row.total_generated);
    const base_salary = Number(row.base_salary);

    // Lógica de pago (ejemplo, esto podría ser más complejo o configurable)
    const commission_percentage = 0.5; // 50% de comisión si supera el umbral
    const base_salary_threshold = 2500; // Umbral para aplicar comisión
    const default_base_salary = 1250; // Salario base si no se alcanza el umbral

    let payment = default_base_salary; // Salario base por defecto

    if (total_generated > base_salary_threshold) {
      payment = total_generated * commission_percentage;
    } else {
      payment = base_salary; // Si no supera el umbral, se paga el salario base del barbero
    }

    return {
      barber_id: row.barber_id,
      barber_name: row.barber_name,
      base_salary: base_salary,
      total_generated: total_generated,
      payment: payment,
    };
  });

  return { events, stats };
};