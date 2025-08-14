import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcrypt';

let dbPromise: Promise<Database> | null = null;

// --- Lógica de Creación de Schema y Datos de Prueba ---

async function createSchema(db: Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cajero',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT
    );
    CREATE TABLE IF NOT EXISTS barbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      specialty TEXT,
      photo_url TEXT,
      station_id INTEGER,
      base_salary REAL DEFAULT 1300,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES stations (id)
    );
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      duration_minutes INTEGER NOT NULL,
      type TEXT NOT NULL DEFAULT 'service',
      stock_quantity INTEGER DEFAULT 0,
      min_stock_level INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barber_id INTEGER UNSIGNED NOT NULL,
      station_id INTEGER UNSIGNED NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT,
      client_email TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      service_id INTEGER UNSIGNED NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER UNSIGNED,
      total_amount REAL NOT NULL,
      customer_name TEXT,
      payment_method TEXT DEFAULT 'cash',
      sale_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER UNSIGNED NOT NULL,
      service_id INTEGER UNSIGNED,
      item_type TEXT,
      item_name TEXT,
      price REAL NOT NULL,
      price_at_sale REAL NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS draft_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reservation_id INTEGER UNSIGNED UNIQUE,
      client_name TEXT,
      barber_id INTEGER,
      total_amount REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE,
      FOREIGN KEY (barber_id) REFERENCES barbers (id)
    );
    CREATE TABLE IF NOT EXISTS draft_sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      draft_sale_id INTEGER UNSIGNED NOT NULL,
      item_id INTEGER UNSIGNED NOT NULL,
      item_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_draft REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (draft_sale_id) REFERENCES draft_sales (id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function seedDatabase(db: Database) {
  console.log('Insertando datos de prueba...');

  // Clear existing data for sales and reservations to ensure a clean slate for new seeding
  await db.exec(`
    DELETE FROM sale_items;
    DELETE FROM sales;
    DELETE FROM reservations;
    DELETE FROM barbers;
    DELETE FROM services;
    DELETE FROM stations;
    DELETE FROM users;
    DELETE FROM settings;
  `);

  // Seed Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  await db.run(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Admin User', 'admin@example.com', adminPassword, 'administrador'],
  );

  // Seed default settings
  await db.run(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
    ['base_salary_threshold', '2500'],
  );
  await db.run(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
    ['commission_percentage', '0.5'],
  );
  await db.run(
    'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
    ['default_base_salary', '1250'],
  );

  // Seed Stations
  await db.run('INSERT INTO stations (name) VALUES (?), (?), (?)', [
    'Estación Central',
    'Estación VIP',
    'Estación Rápida',
  ]);
  const stations = await db.all('SELECT id, name FROM stations');

  // Seed Barbers
  await db.run(
    'INSERT INTO barbers (name, email, phone, specialty, photo_url, station_id) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)',
    [
      'Juan Pérez',
      'juan.perez@example.com',
      '+51987654321',
      'Cortes Modernos',
      'https://example.com/juan.jpg',
      stations[0].id,
      'Luis Gómez',
      'luis.gomez@example.com',
      '+51912345678',
      'Barbas Clásicas',
      'https://example.com/luis.jpg',
      stations[1].id,
      'Carlos Ruiz',
      'carlos.ruiz@example.com',
      '+51998877665',
      'Coloración',
      'https://example.com/carlos.jpg',
      stations[2].id,
      'María López',
      'maria.lopez@example.com',
      '+51999888777',
      'Peinados',
      'https://example.com/maria.jpg', // Added photo_url
      stations[0].id,
    ],
  );
  const barbers = await db.all('SELECT id, name FROM barbers');

  // Seed Services and Products
  await db.run(
    'INSERT INTO services (name, price, duration_minutes, type, stock_quantity, min_stock_level) VALUES (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?), (?, ?, ?, ?, ?, ?)', // Added one more set of placeholders
    [
      'Corte de Cabello', 30, 30, 'service', 0, 0,
      'Afeitado Clásico', 25, 40, 'service', 0, 0, // Changed from 45 to 40
      'Corte y Barba', 50, 40, 'service', 0, 0,    // Changed from 60 to 40
      'Lavado y Secado', 15, 20, 'service', 0, 0,
      'Tinte de Cabello', 80, 40, 'service', 0, 0, // Changed from 90 to 40
      'Masaje Capilar', 20, 15, 'service', 0, 0,
      'Cera para Peinar', 15, 0, 'product', 100, 10,
      'Aceite para Barba', 20, 0, 'product', 50, 5,
      'Shampoo Especializado', 35, 0, 'product', 20, 25,
      'Acondicionador Premium', 30, 0, 'product', 15, 10,
      'Gel Fijador Fuerte', 12, 0, 'product', 5, 10,
      'Navajas Desechables (pack)', 8, 0, 'product', 30, 5,
    ],
  );
  const services = await db.all('SELECT id, name, price, type, duration_minutes FROM services WHERE type = \'service\'');
  const products = await db.all('SELECT id, name, price, type, stock_quantity FROM services WHERE type = \'product\'');

  const customers = [
    'Pedro Pascal', 'Ana de Armas', 'Ricardo Arjona', 'Shakira Mebarak',
    'Lionel Messi', 'Karol G', 'Bad Bunny', 'Sofia Vergara', 'Diego Luna',
    'Salma Hayek', 'Gael Garcia Bernal', 'Eugenio Derbez',
  ];
  const paymentMethods = ['cash', 'card', 'yape', 'plin'];

  // Generate data for the last 3 months
  const today = new Date();
  const numDays = 90; // Generate data for the last 90 days

  for (let i = numDays; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    const numTransactions = Math.floor(Math.random() * 3) + 1; // 1 to 3 transactions per day

    for (let t = 0; t < numTransactions; t++) {
      const randomBarber = barbers[Math.floor(Math.random() * barbers.length)];
      const randomStation = stations[Math.floor(Math.random() * stations.length)];
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      let totalAmount = 0;
      const saleItemsToInsert = [];
      let reservationId = null;

      // Decide if this transaction includes services
      const includesServices = Math.random() > 0.3; // 70% chance to include services

      if (includesServices) {
        // Create a reservation first
        const randomService = services[Math.floor(Math.random() * services.length)];
        const startTime = new Date(date);
        startTime.setHours(Math.floor(Math.random() * 8) + 9, Math.floor(Math.random() * 60), 0, 0); // Between 9 AM and 5 PM
        const durationInMinutes = Math.min(randomService.duration_minutes, 60); // Ensure max duration is 60 mins
        const endTime = new Date(startTime.getTime() + durationInMinutes * 60 * 1000);

        const reservationResult = await db.run(
          `INSERT INTO reservations (barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
          [
            randomBarber.id,
            randomStation.id,
            randomCustomer,
            `+51${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
            `${randomCustomer.toLowerCase().replace(/\s/g, '.')}@example.com`,
            startTime.toISOString(),
            endTime.toISOString(),
            randomService.id,
            'completed', // Mark as completed for sales
            'Generado por script de prueba',
          ],
        );
        reservationId = reservationResult.lastID;

        // Add service to sale items
        saleItemsToInsert.push({
          id: randomService.id, // Use service ID as item_id
          item_type: 'service',
          item_name: randomService.name,
          price: randomService.price,
          price_at_sale: randomService.price,
          quantity: 1,
        });
        totalAmount += randomService.price;
      }

      // Decide if this transaction includes products
      const includesProducts = Math.random() > 0.5 || !includesServices; // 50% chance, or if no services
      if (includesProducts) {
        const numProducts = Math.floor(Math.random() * 3) + 1; // 1 to 3 products
        for (let p = 0; p < numProducts; p++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 quantity
          saleItemsToInsert.push({
            id: randomProduct.id, // Use product ID as item_id
            item_type: 'product',
            item_name: randomProduct.name,
            price: randomProduct.price,
            price_at_sale: randomProduct.price,
            quantity: quantity,
          });
          totalAmount += randomProduct.price * quantity;
        }
      }

      // Only create sale if there are items to sell
      if (saleItemsToInsert.length > 0) {
        const saleResult = await db.run(
          `INSERT INTO sales (sale_date, total_amount, customer_name, payment_method, reservation_id)
           VALUES (?, ?, ?, ?, ?)`, 
          [
            dateString,
            totalAmount,
            randomCustomer,
            randomPaymentMethod,
            reservationId, // Link to reservation if exists, otherwise null
          ],
        );
        const saleId = saleResult.lastID;

        if (saleId) {
          const stmt = await db.prepare(
            `INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity)
             VALUES (?, ?, ?, ?, ?, ?, ?)`, 
          );
          for (const item of saleItemsToInsert) {
            await stmt.run(
              saleId,
              item.item_type === 'service' ? item.id : null, // service_id only for services
              item.item_type,
              item.item_name,
              item.price,
              item.price_at_sale,
              item.quantity,
            );
          }
          await stmt.finalize();
        }
      }
    }
  }

  console.log('Datos de prueba insertados.');
}

async function initializeDatabase(isTest = false): Promise<Database> {
  const db = await open(
    isTest
      ? { filename: ':memory:', driver: sqlite3.Database }
      : { filename: './barberia.sqlite', driver: sqlite3.Database },
  );
  await createSchema(db);

  if (!isTest) {
    console.log('Inicializando base de datos de desarrollo y sembrando datos...');
    await seedDatabase(db);
  }

  return db;
}

function setup(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = initializeDatabase(false);
  }
  return dbPromise;
}

export async function setupTestDB(): Promise<Database> {
  const db = await initializeDatabase(true);
  await seedDatabase(db);
  return db;
}

export default setup;
