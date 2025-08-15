import getPool from '../database';

const pool = getPool();

// This service will contain functions to fetch aggregated data for the dashboard.

export const getDashboardSummary = async (): Promise<any> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Query for sales stats
  const salesQuery = `
    SELECT
      COALESCE(SUM(CASE WHEN sale_date >= $1 THEN service_amount ELSE 0 END), 0) as "serviceSalesToday",
      COALESCE(SUM(CASE WHEN sale_date >= $1 THEN products_amount ELSE 0 END), 0) as "productSalesToday",
      COALESCE(SUM(CASE WHEN sale_date >= $2 THEN total_amount ELSE 0 END), 0) as "salesMonth"
    FROM sales
    WHERE sale_date >= $2;
  `;

  // Query for reservation stats
  const reservationsQuery = `
    SELECT
      COUNT(*) FILTER (WHERE start_time >= $1 AND start_time <= $2 AND status = 'pending') as "upcomingReservations",
      COUNT(*) FILTER (WHERE start_time >= $1 AND start_time <= $2 AND status = 'paid') as "completedReservationsToday"
    FROM reservations
    WHERE start_time <= $2;
  `;

  // Query for barber payouts (using the view)
  const barberPayoutsQuery = `SELECT * FROM barber_sales_summary;`;

  // Query for daily product sales for the last 30 days
  const dailyProductSalesQuery = `
    SELECT
      DATE(sale_date) as date,
      SUM(products_amount) as total_amount
    FROM sales
    WHERE sale_date >= $1
    GROUP BY DATE(sale_date)
    ORDER BY date ASC;
  `;

  // Query for daily service sales for the last 30 days
  const dailyServiceSalesQuery = `
    SELECT
      DATE(sale_date) as date,
      SUM(service_amount) as total_amount
    FROM sales
    WHERE sale_date >= $1
    GROUP BY DATE(sale_date)
    ORDER BY date ASC;
  `;

  // Query for popular services for the last 30 days
  const popularServicesQuery = `
    SELECT
      s.name as service_name,
      COUNT(si.item_id) as total_sales_count
    FROM sales sa
    JOIN sale_items si ON sa.id = si.sale_id
    JOIN services s ON si.item_id = s.id
    WHERE sa.sale_date >= $1 AND si.item_type = 'service'
    GROUP BY s.name
    ORDER BY total_sales_count DESC
    LIMIT 5;
  `;

  // --- Execute all queries in parallel ---
  const [salesResult, reservationsResult, barberPayoutsResult, dailyProductSalesResult, dailyServiceSalesResult, popularServicesResult] = await Promise.all([
    pool.query(salesQuery, [todayStart, monthStart]),
    pool.query(reservationsQuery, [todayStart, todayEnd]),
    pool.query(barberPayoutsQuery),
    pool.query(dailyProductSalesQuery, [thirtyDaysAgo]),
    pool.query(dailyServiceSalesQuery, [thirtyDaysAgo]),
    pool.query(popularServicesQuery, [thirtyDaysAgo]),
  ]);

  return {
    ...salesResult.rows[0],
    ...reservationsResult.rows[0],
    barberPayouts: barberPayoutsResult.rows,
    dailyProductSales: dailyProductSalesResult.rows,
    dailyServiceSales: dailyServiceSalesResult.rows,
    popularServices: popularServicesResult.rows,
  };
};