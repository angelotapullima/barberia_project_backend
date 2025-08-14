-- Clear all existing data from tables
TRUNCATE TABLE
    users,
    settings,
    stations,
    barbers,
    services,
    reservations,
    sales,
    sale_items,
    draft_sales,
    draft_sale_items
RESTART IDENTITY CASCADE;

-- Insert data for users table
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'admin'), -- password: adminpassword
('Cashier User', 'cashier@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'); -- password: cashierpassword

-- Insert data for settings table
INSERT INTO settings (setting_key, setting_value) VALUES
('shop_name', 'Barberia La Fígaro'),
('shop_address', 'Calle Falsa 123, Springfield'),
('shop_phone', '555-1234');

-- Insert data for stations table
INSERT INTO stations (name, description) VALUES
('Estación 1', 'Puesto de barbero principal'),
('Estación 2', 'Puesto de barbero secundario'),
('Estación 3', 'Puesto de barbero auxiliar');

-- Insert data for barbers table
INSERT INTO barbers (name, email, phone, specialty, station_id, base_salary) VALUES
('Carlos Ruiz', 'carlos.ruiz@example.com', '555-5678', 'Cortes clásicos', 1, 1500),
('Luis Fernandez', 'luis.fernandez@example.com', '555-8765', 'Estilos modernos', 2, 1400),
('Pedro Martinez', 'pedro.martinez@example.com', '555-4321', 'Barba y bigote', 3, 1350);

-- Insert data for services table
INSERT INTO services (name, description, price, duration_minutes, type, stock_quantity, min_stock_level) VALUES
('Corte de Cabello', 'Corte de cabello para hombre', 25, 30, 'service', 0, 0),
('Afeitado Clásico', 'Afeitado con navaja y toallas calientes', 20, 25, 'service', 0, 0),
('Corte y Barba', 'Paquete completo de corte de cabello y arreglo de barba', 40, 50, 'service', 0, 0),
('Gel Fijador Fuerte', 'Gel para peinar de alta duración', 15, 0, 'product', 50, 10),
('Cera Modeladora', 'Cera para peinar con acabado mate', 18, 0, 'product', 40, 15);

-- Original reservations
INSERT INTO reservations (id, barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status) VALUES
(1, 1, 1, 'Juan Perez', '555-1111', 'juan.perez@email.com', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes', 1, 'completed'),
(2, 2, 2, 'Andres Gomez', '555-2222', 'andres.gomez@email.com', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '25 minutes', 2, 'completed');

-- MORE SEED DATA --

-- Last Month's Reservations
INSERT INTO reservations (id, barber_id, station_id, client_name, start_time, end_time, service_id, status) VALUES
(5, 1, 1, 'Cliente Mes Pasado 1', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '1 day', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '1 day 30 minutes', 1, 'completed'),
(6, 2, 2, 'Cliente Mes Pasado 2', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '3 days', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '3 days 25 minutes', 2, 'completed'),
(7, 3, 3, 'Cliente Mes Pasado 3', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '5 days', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '5 days 50 minutes', 3, 'completed');

-- This Month's Reservations
INSERT INTO reservations (id, barber_id, station_id, client_name, start_time, end_time, service_id, status) VALUES
(8, 1, 1, 'Cliente Este Mes 1', date_trunc('day', NOW()) - INTERVAL '5 days', date_trunc('day', NOW()) - INTERVAL '5 days' + INTERVAL '30 minutes', 1, 'completed'),
(9, 2, 2, 'Cliente Este Mes 2', date_trunc('day', NOW()) - INTERVAL '3 days', date_trunc('day', NOW()) - INTERVAL '3 days' + INTERVAL '25 minutes', 2, 'completed'),
(10, 3, 3, 'Cliente Este Mes 3', date_trunc('day', NOW()) - INTERVAL '1 day', date_trunc('day', NOW()) - INTERVAL '1 day' + INTERVAL '50 minutes', 3, 'cancelled');

-- Today's Reservations
INSERT INTO reservations (id, barber_id, station_id, client_name, start_time, end_time, service_id, status) VALUES
(11, 1, 1, 'Cliente Hoy 1', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 30 minutes', 1, 'completed'),
(12, 2, 2, 'Cliente Hoy 2', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '1 hour 25 minutes', 2, 'pending');

-- Tomorrow's Reservations
INSERT INTO reservations (id, barber_id, station_id, client_name, start_time, end_time, service_id, status) VALUES
(13, 3, 3, 'Cliente Mañana 1', NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 50 minutes', 3, 'pending'),
(14, 1, 1, 'Cliente Mañana 2', NOW() + INTERVAL '1 day 2 hours', NOW() + INTERVAL '1 day 2 hours 30 minutes', 1, 'pending');

-- Original Sales
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(1, 1, 25, 'Juan Perez', 'cash', NOW() - INTERVAL '2 days'),
(2, 2, 38, 'Andres Gomez', 'card', NOW() - INTERVAL '1 day');

-- Sales for Last Month
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(5, 5, 25, 'Cliente Mes Pasado 1', 'cash', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '1 day'),
(6, 6, 20, 'Cliente Mes Pasado 2', 'card', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '3 days'),
(7, 7, 40, 'Cliente Mes Pasado 3', 'cash', date_trunc('month', NOW()) - INTERVAL '1 month' + INTERVAL '5 days');

-- Sales for This Month
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(8, 8, 43, 'Cliente Este Mes 1', 'card', date_trunc('day', NOW()) - INTERVAL '5 days'),
(9, 9, 20, 'Cliente Este Mes 2', 'cash', date_trunc('day', NOW()) - INTERVAL '3 days');

-- Sales for Today
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(11, 11, 25, 'Cliente Hoy 1', 'card', NOW() - INTERVAL '2 hours');

-- Original Sale Items
INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES
(1, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(2, 2, 'service', 'Afeitado Clásico', 20, 20, 1),
(2, 5, 'product', 'Cera Modeladora', 18, 18, 1);

-- Sale Items for new sales
INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES
(5, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(6, 2, 'service', 'Afeitado Clásico', 20, 20, 1),
(7, 3, 'service', 'Corte y Barba', 40, 40, 1),
(8, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(8, 4, 'product', 'Gel Fijador Fuerte', 15, 18, 1), -- Price changed at sale
(9, 2, 'service', 'Afeitado Clásico', 20, 20, 1),
(11, 1, 'service', 'Corte de Cabello', 25, 25, 1);
