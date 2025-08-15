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
('Admin User', 'admin@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'administrador'), -- password: adminpassword
('Cashier User', 'cashier@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'), -- password: cashierpassword
('Barber User 1', 'barber1@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'); -- password: barberpassword

-- Insert data for settings table
INSERT INTO settings (setting_key, setting_value) VALUES
('shop_name', 'Barberia La Fígaro'),
('shop_address', 'Calle Falsa 123, Springfield'),
('shop_phone', '555-1234'),
('base_salary_threshold', '2500'),
('commission_percentage', '0.5'),
('default_base_salary', '1250');

-- Insert data for stations table
INSERT INTO stations (id, name, description) VALUES
(1, 'Estación 1', 'Puesto de barbero principal'),
(2, 'Estación 2', 'Puesto de barbero secundario'),
(3, 'Estación 3', 'Puesto de barbero auxiliar'),
(4, 'Estación 4', 'Puesto de barbero de lujo');

-- Insert data for barbers table
INSERT INTO barbers (id, name, email, phone, specialty, photo_url, station_id, base_salary) VALUES
(1, 'Carlos Ruiz', 'carlos.ruiz@example.com', '555-5678', 'Cortes clásicos', NULL, 1, 1500),
(2, 'Luis Fernandez', 'luis.fernandez@example.com', '555-8765', 'Estilos modernos', NULL, 2, 1400),
(3, 'Pedro Martinez', 'pedro.martinez@example.com', '555-4321', 'Barba y bigote', NULL, 3, 1350),
(4, 'Ana García', 'ana.garcia@example.com', '555-9876', 'Color y tratamientos', NULL, 4, 1600);

-- Insert data for services table
INSERT INTO services (id, name, description, price, duration_minutes, type, stock_quantity, min_stock_level) VALUES
(1, 'Corte de Cabello', 'Corte de cabello para hombre', 25, 30, 'service', 0, 0),
(2, 'Afeitado Clásico', 'Afeitado con navaja y toallas calientes', 20, 25, 'service', 0, 0),
(3, 'Corte y Barba', 'Paquete completo de corte de cabello y arreglo de barba', 40, 50, 'service', 0, 0),
(4, 'Lavado y Peinado', 'Lavado de cabello y peinado profesional', 15, 20, 'service', 0, 0),
(5, 'Gel Fijador Fuerte', 'Gel para peinar de alta duración', 15, 0, 'product', 50, 10),
(6, 'Cera Modeladora', 'Cera para peinar con acabado mate', 18, 0, 'product', 40, 15),
(7, 'Shampoo Anticaída', 'Shampoo especializado para fortalecer el cabello', 25, 0, 'product', 5, 10), -- Low stock
(8, 'Bálsamo para Barba', 'Hidratante y suavizante para barba', 12, 0, 'product', 20, 5);

-- Reservations for Last Month (Completed)
INSERT INTO reservations (id, barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status) VALUES
(101, 1, 1, 'Cliente Histórico 1', '555-0001', 'hist1@example.com', NOW() - INTERVAL '35 days' - INTERVAL '2 hours', NOW() - INTERVAL '35 days' - INTERVAL '1 hour 30 minutes', 1, 'completed'),
(102, 2, 2, 'Cliente Histórico 2', '555-0002', 'hist2@example.com', NOW() - INTERVAL '33 days' - INTERVAL '3 hours', NOW() - INTERVAL '33 days' - INTERVAL '2 hour 30 minutes', 2, 'completed'),
(103, 3, 3, 'Cliente Histórico 3', '555-0003', 'hist3@example.com', NOW() - INTERVAL '30 days' - INTERVAL '1 hour', NOW() - INTERVAL '30 days' - INTERVAL '0 hour 30 minutes', 3, 'completed'),
(104, 1, 1, 'Cliente Histórico 4', '555-0004', 'hist4@example.com', NOW() - INTERVAL '28 days' - INTERVAL '4 hours', NOW() - INTERVAL '28 days' - INTERVAL '3 hour 30 minutes', 1, 'completed'),
(105, 4, 4, 'Cliente Histórico 5', '555-0005', 'hist5@example.com', NOW() - INTERVAL '25 days' - INTERVAL '2 hours', NOW() - INTERVAL '25 days' - INTERVAL '1 hour 30 minutes', 4, 'completed');

-- Reservations for This Week (Completed and Pending)
INSERT INTO reservations (id, barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status) VALUES
(201, 1, 1, 'Cliente Semana 1', '555-0011', 'sem1@example.com', NOW() - INTERVAL '3 days' - INTERVAL '2 hours', NOW() - INTERVAL '3 days' - INTERVAL '1 hour 30 minutes', 1, 'completed'),
(202, 2, 2, 'Cliente Semana 2', '555-0012', 'sem2@example.com', NOW() - INTERVAL '2 days' - INTERVAL '1 hour', NOW() - INTERVAL '2 days' - INTERVAL '0 hour 30 minutes', 2, 'completed'),
(203, 3, 3, 'Cliente Semana 3', '555-0013', 'sem3@example.com', NOW() - INTERVAL '1 day' - INTERVAL '4 hours', NOW() - INTERVAL '1 day' - INTERVAL '3 hour 30 minutes', 3, 'completed'),
(204, 4, 4, 'Cliente Semana 4', '555-0014', 'sem4@example.com', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', NOW() + INTERVAL '1 day' + INTERVAL '1 hour 30 minutes', 4, 'pending'),
(205, 1, 1, 'Cliente Semana 5', '555-0015', 'sem5@example.com', NOW() + INTERVAL '2 days' + INTERVAL '2 hours', NOW() + INTERVAL '2 days' + INTERVAL '2 hour 30 minutes', 1, 'pending');

-- Reservations for Today (Completed and Pending)
INSERT INTO reservations (id, barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status) VALUES
(301, 1, 1, 'Cliente Hoy 1', '555-0021', 'hoy1@example.com', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hour 30 minutes', 1, 'completed'),
(302, 2, 2, 'Cliente Hoy 2', '555-0022', 'hoy2@example.com', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '0 hour 35 minutes', 2, 'completed'),
(303, 3, 3, 'Cliente Hoy 3', '555-0023', 'hoy3@example.com', NOW() + INTERVAL '30 minutes', NOW() + INTERVAL '1 hour', 3, 'pending'),
(304, 4, 4, 'Cliente Hoy 4', '555-0024', 'hoy4@example.com', NOW() + INTERVAL '2 hours', NOW() + INTERVAL '2 hour 20 minutes', 4, 'pending');

-- Cancelled Reservations
INSERT INTO reservations (id, barber_id, station_id, client_name, client_phone, client_email, start_time, end_time, service_id, status) VALUES
(401, 1, 1, 'Cliente Cancelado 1', '555-0031', 'cancel1@example.com', NOW() - INTERVAL '5 days' + INTERVAL '10 minutes', NOW() - INTERVAL '5 days' + INTERVAL '40 minutes', 1, 'cancelled'),
(402, 2, 2, 'Cliente Cancelado 2', '555-0032', 'cancel2@example.com', NOW() + INTERVAL '1 day' + INTERVAL '1 hour', NOW() + INTERVAL '1 day' + INTERVAL '1 hour 25 minutes', 2, 'cancelled');

-- Sales for Last Month (linked to completed reservations)
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(1001, 101, 25, 'Cliente Histórico 1', 'cash', NOW() - INTERVAL '35 days'),
(1002, 102, 20, 'Cliente Histórico 2', 'card', NOW() - INTERVAL '33 days'),
(1003, 103, 40, 'Cliente Histórico 3', 'cash', NOW() - INTERVAL '30 days'),
(1004, 104, 25, 'Cliente Histórico 4', 'card', NOW() - INTERVAL '28 days'),
(1005, 105, 15, 'Cliente Histórico 5', 'cash', NOW() - INTERVAL '25 days');

-- Sales for This Week (linked to completed reservations)
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(2001, 201, 25, 'Cliente Semana 1', 'card', NOW() - INTERVAL '3 days'),
(2002, 202, 20, 'Cliente Semana 2', 'cash', NOW() - INTERVAL '2 days'),
(2003, 203, 40, 'Cliente Semana 3', 'card', NOW() - INTERVAL '1 day');

-- Sales for Today (linked to completed reservations)
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(3001, 301, 25, 'Cliente Hoy 1', 'cash', NOW() - INTERVAL '3 hours'),
(3002, 302, 20, 'Cliente Hoy 2', 'card', NOW() - INTERVAL '1 hour');

-- Direct Sales (not linked to reservations)
INSERT INTO sales (id, reservation_id, total_amount, customer_name, payment_method, sale_date) VALUES
(5001, NULL, 30, 'Cliente Directo 1', 'cash', NOW() - INTERVAL '10 days'),
(5002, NULL, 50, 'Cliente Directo 2', 'card', NOW() - INTERVAL '5 days');

-- Sale Items for Last Month Sales
INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES
(1001, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(1002, 2, 'service', 'Afeitado Clásico', 20, 20, 1),
(1003, 3, 'service', 'Corte y Barba', 40, 40, 1),
(1004, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(1005, 4, 'service', 'Lavado y Peinado', 15, 15, 1);

-- Sale Items for This Week Sales
INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES
(2001, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(2002, 2, 'service', 'Afeitado Clásico', 20, 20, 1),
(2003, 3, 'service', 'Corte y Barba', 40, 40, 1);

-- Sale Items for Today Sales
INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES
(3001, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(3002, 2, 'service', 'Afeitado Clásico', 20, 20, 1);

-- Sale Items for Direct Sales
INSERT INTO sale_items (sale_id, service_id, item_type, item_name, price, price_at_sale, quantity) VALUES
(5001, 5, 'product', 'Gel Fijador Fuerte', 15, 15, 2), -- 2 units of product
(5002, 1, 'service', 'Corte de Cabello', 25, 25, 1),
(5002, 6, 'product', 'Cera Modeladora', 18, 18, 1);

-- Draft Sales (linked to pending reservations)
INSERT INTO draft_sales (id, reservation_id, client_name, barber_id, total_amount) VALUES
(1, 303, 'Cliente Hoy 3', 3, 40),
(2, 204, 'Cliente Semana 4', 4, 15);

-- Draft Sale Items
INSERT INTO draft_sale_items (draft_sale_id, item_id, item_type, quantity, price_at_draft) VALUES
(1, 3, 'service', 1, 40), -- Corte y Barba for Cliente Hoy 3
(2, 4, 'service', 1, 15); -- Lavado y Peinado for Cliente Semana 4