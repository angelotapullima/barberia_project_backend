-- Clear all existing data from tables (order matters for foreign keys)
TRUNCATE TABLE
    barber_commissions,
    inventory_movements,
    sale_items,
    sales,
    reservation_products,
    reservations,
    barbers,
    stations,
    services,
    products,
    users,
    settings
RESTART IDENTITY CASCADE;

-- Insert data for users table
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'administrador'), -- password: adminpassword
('Cashier User', 'cashier@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'), -- password: cashierpassword
('Barber User 1', 'barber1@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'), -- password: cashierpassword
('New Admin User', 'newadmin@example.com', '$2b$10$3J7J.VnJBCn6hqVsNi2b1.msw9CEJ0feAVy4T3s8whHrwgUPIzMGK', 'administrador'); -- password: newadminpassword

-- Insert data for settings table
INSERT INTO settings (setting_key, setting_value, description) VALUES
('shop_name', 'Barberia La Fígaro', 'Nombre de la barbería'),
('shop_address', 'Calle Falsa 123, Springfield', 'Dirección de la barbería'),
('shop_phone', '555-1234', 'Teléfono de contacto'),
('commission_threshold', '2500', 'Monto de servicios para activar comisión del 50%'),
('commission_percentage', '0.5', 'Porcentaje de comisión para barberos'),
('default_base_salary', '1250', 'Salario base por defecto para barberos');

-- Insert data for stations table
INSERT INTO stations (id, name, description, is_active) VALUES
(1, 'Estación 1', 'Puesto de barbero principal', true),
(2, 'Estación 2', 'Puesto de barbero secundario', true),
(3, 'Estación 3', 'Puesto de barbero auxiliar', true),
(4, 'Estación 4', 'Puesto de barbero de lujo', true),
(5, 'Estación Inactiva', 'Estación de prueba inactiva', false);

-- Insert data for barbers table
INSERT INTO barbers (id, name, email, phone, specialty, photo_url, station_id, base_salary, is_active) VALUES
(1, 'Carlos Ruiz', 'carlos.ruiz@example.com', '555-5678', 'Cortes clásicos', NULL, 1, 1500, true),
(2, 'Luis Fernandez', 'luis.fernandez@example.com', '555-8765', 'Estilos modernos', NULL, 2, 1400, true),
(3, 'Pedro Martinez', 'pedro.martinez@example.com', '555-4321', 'Barba y bigote', NULL, 3, 1350, true),
(4, 'Ana García', 'ana.garcia@example.com', '555-9876', 'Color y tratamientos', NULL, 4, 1600, true),
(5, 'Barbero Inactivo', 'inactive@example.com', '555-0000', 'Inactivo', NULL, 1, 1000, false);

-- Insert data for services table (only services, no stock)
INSERT INTO services (id, name, description, price, duration_minutes, is_active) VALUES
(1, 'Corte de Cabello', 'Corte de cabello para hombre', 25.00, 30, true),
(2, 'Afeitado Clásico', 'Afeitado con navaja y toallas calientes', 20.00, 25, true),
(3, 'Corte y Barba', 'Paquete completo de corte de cabello y arreglo de barba', 40.00, 50, true),
(4, 'Lavado y Peinado', 'Lavado de cabello y peinado profesional', 15.00, 20, true),
(5, 'Tinte de Cabello', 'Aplicación de tinte profesional', 60.00, 90, true),
(6, 'Servicio Inactivo', 'Servicio de prueba inactivo', 10.00, 15, false);

-- Insert data for products table (only products, with stock)
INSERT INTO products (id, name, description, price, stock_quantity, min_stock_level, category, is_active) VALUES
(101, 'Gel Fijador Fuerte', 'Gel para peinar de alta duración', 15.00, 50, 10, 'Cuidado Capilar', true),
(102, 'Cera Modeladora Mate', 'Cera para peinar con acabado mate', 18.00, 40, 15, 'Cuidado Capilar', true),
(103, 'Shampoo Anticaída', 'Shampoo especializado para fortalecer el cabello', 25.00, 5, 10, 'Cuidado Capilar', true), -- Low stock
(104, 'Bálsamo para Barba', 'Hidratante y suavizante para barba', 12.00, 20, 5, 'Cuidado Facial', true),
(105, 'Refresco Cola', 'Bebida refrescante', 2.50, 100, 20, 'Bebidas', true),
(106, 'Café Espresso', 'Café recién hecho', 3.00, 80, 10, 'Bebidas', true),
(107, 'Producto Inactivo', 'Producto de prueba inactivo', 5.00, 0, 0, 'Otros', false);

-- Manual Inventory Movements (e.g., initial stock or restock)
INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes) VALUES
(101, 'in', 50, 'initial_stock', 'Stock inicial al abrir'),
(102, 'in', 40, 'initial_stock', 'Stock inicial al abrir'),
(103, 'in', 5, 'initial_stock', 'Stock inicial al abrir'),
(104, 'in', 20, 'initial_stock', 'Stock inicial al abrir'),
(105, 'in', 100, 'initial_stock', 'Stock inicial al abrir'),
(106, 'in', 80, 'initial_stock', 'Stock inicial al abrir');

-- =====================================================================================================================
-- GENERACIÓN DE DATOS TRANSACCIONALES (Reservas y Ventas)
-- =====================================================================================================================

-- Helper function to generate timestamps
CREATE OR REPLACE FUNCTION generate_timestamp(days_ago INT, hours INT, minutes INT) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN NOW() - INTERVAL '1 day' * days_ago + INTERVAL '1 hour' * hours + INTERVAL '1 minute' * minutes;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================================================
-- RESERVAS Y VENTAS PARA EL MES PASADO (COMPLETADAS)
-- =====================================================================================================================

-- Reserva 1 (Mes Pasado - Pagada)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 1, 'Cliente Mes Pasado 1', '987654321', generate_timestamp(35, 10, 0), generate_timestamp(35, 10, 30), 'paid', 25.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Mes Pasado 1'), 1, 'Cliente Mes Pasado 1', 25.00, 0.00, 25.00, 'Tarjeta', generate_timestamp(35, 10, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Mes Pasado 1'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

-- Reserva 2 (Mes Pasado - Pagada con productos)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 2, 'Cliente Mes Pasado 2', '987654322', generate_timestamp(32, 14, 0), generate_timestamp(32, 14, 25), 'paid', 20.00) RETURNING id;
INSERT INTO reservation_products (reservation_id, product_id, quantity, price_at_reservation) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Mes Pasado 2'), 105, 1, 2.50),
((SELECT id FROM reservations WHERE client_name = 'Cliente Mes Pasado 2'), 106, 1, 3.00);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Mes Pasado 2'), 2, 'Cliente Mes Pasado 2', 20.00, 5.50, 25.50, 'Efectivo', generate_timestamp(32, 14, 30));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Mes Pasado 2'), 'service', 2, 'Afeitado Clásico', 1, 20.00, 20.00),
((SELECT id FROM sales WHERE customer_name = 'Cliente Mes Pasado 2'), 'product', 105, 'Refresco Cola', 1, 2.50, 2.50),
((SELECT id FROM sales WHERE customer_name = 'Cliente Mes Pasado 2'), 'product', 106, 'Café Espresso', 1, 3.00, 3.00);

-- =====================================================================================================================
-- RESERVAS Y VENTAS PARA LA SEMANA PASADA (COMPLETADAS Y PENDIENTES)
-- =====================================================================================================================

-- Reserva 3 (Semana Pasada - Pagada, Barbero 1, Comisión)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 3, 'Cliente Semana Pasada 1', '987654323', generate_timestamp(8, 9, 0), generate_timestamp(8, 9, 50), 'paid', 40.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Semana Pasada 1'), 1, 'Cliente Semana Pasada 1', 40.00, 0.00, 40.00, 'Tarjeta', generate_timestamp(8, 9, 55));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Semana Pasada 1'), 'service', 3, 'Corte y Barba', 1, 40.00, 40.00);

-- Reserva 4 (Semana Pasada - Pagada, Barbero 1, Comisión)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 1, 'Cliente Semana Pasada 2', '987654324', generate_timestamp(7, 11, 0), generate_timestamp(7, 11, 30), 'paid', 25.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Semana Pasada 2'), 1, 'Cliente Semana Pasada 2', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(7, 11, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Semana Pasada 2'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

-- Reserva 5 (Semana Pasada - Pagada)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(3, 3, 4, 'Cliente Semana Pasada 3', '987654325', generate_timestamp(6, 16, 0), generate_timestamp(6, 16, 20), 'paid', 15.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Semana Pasada 3'), 3, 'Cliente Semana Pasada 3', 15.00, 0.00, 15.00, 'Efectivo', generate_timestamp(6, 16, 25));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Semana Pasada 3'), 'service', 4, 'Lavado y Peinado', 1, 15.00, 15.00);

-- =====================================================================================================================
-- RESERVAS Y VENTAS PARA AYER (COMPLETADAS Y PENDIENTES)
-- =====================================================================================================================

-- Reserva 6 (Ayer - Pagada, Barbero 2)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 1, 'Cliente Ayer 1', '987654326', generate_timestamp(1, 9, 0), generate_timestamp(1, 9, 30), 'paid', 25.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Ayer 1'), 2, 'Cliente Ayer 1', 25.00, 0.00, 25.00, 'Tarjeta', generate_timestamp(1, 9, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Ayer 1'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

-- Reserva 7 (Ayer - Pagada con productos, Barbero 3)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(3, 3, 2, 'Cliente Ayer 2', '987654327', generate_timestamp(1, 11, 0), generate_timestamp(1, 11, 25), 'paid', 20.00) RETURNING id;
INSERT INTO reservation_products (reservation_id, product_id, quantity, price_at_reservation) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Ayer 2'), 101, 1, 15.00),
((SELECT id FROM reservations WHERE client_name = 'Cliente Ayer 2'), 105, 2, 2.50);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Ayer 2'), 3, 'Cliente Ayer 2', 20.00, 20.00, 40.00, 'Efectivo', generate_timestamp(1, 11, 30));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Ayer 2'), 'service', 2, 'Afeitado Clásico', 1, 20.00, 20.00),
((SELECT id FROM sales WHERE customer_name = 'Cliente Ayer 2'), 'product', 101, 'Gel Fijador Fuerte', 1, 15.00, 15.00),
((SELECT id FROM sales WHERE customer_name = 'Cliente Ayer 2'), 'product', 105, 'Refresco Cola', 2, 2.50, 5.00);

-- Reserva 8 (Ayer - Pagada con productos, Barbero 4)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(4, 4, 4, 'Cliente Ayer 3', '987654328', generate_timestamp(1, 15, 0), generate_timestamp(1, 15, 20), 'paid', 15.00) RETURNING id;
INSERT INTO reservation_products (reservation_id, product_id, quantity, price_at_reservation) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Ayer 3'), 102, 1, 18.00);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Ayer 3'), 4, 'Cliente Ayer 3', 15.00, 18.00, 33.00, 'Tarjeta', generate_timestamp(1, 15, 25));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Ayer 3'), 'service', 4, 'Lavado y Peinado', 1, 15.00, 15.00),
((SELECT id FROM sales WHERE customer_name = 'Cliente Ayer 3'), 'product', 102, 'Cera Modeladora Mate', 1, 18.00, 18.00);

-- =====================================================================================================================
-- RESERVAS Y VENTAS PARA HOY (COMPLETADAS Y PENDIENTES)
-- =====================================================================================================================

-- Reserva 9 (Hoy - Pagada, Barbero 1)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 1, 'Cliente Hoy 1', '987654329', generate_timestamp(0, 9, 0), generate_timestamp(0, 9, 30), 'paid', 25.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Hoy 1'), 1, 'Cliente Hoy 1', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(0, 9, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Hoy 1'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

-- Reserva 10 (Hoy - Pagada con productos, Barbero 2)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 3, 'Cliente Hoy 2', '987654330', generate_timestamp(0, 10, 0), generate_timestamp(0, 10, 50), 'paid', 40.00) RETURNING id;
INSERT INTO reservation_products (reservation_id, product_id, quantity, price_at_reservation) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Hoy 2'), 103, 1, 25.00);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Hoy 2'), 2, 'Cliente Hoy 2', 40.00, 25.00, 65.00, 'Tarjeta', generate_timestamp(0, 10, 55));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Hoy 2'), 'service', 3, 'Corte y Barba', 1, 40.00, 40.00),
((SELECT id FROM sales WHERE customer_name = 'Cliente Hoy 2'), 'product', 103, 'Shampoo Anticaída', 1, 25.00, 25.00);

-- Reserva 11 (Hoy - Pagada, Barbero 3)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(3, 3, 1, 'Cliente Hoy 3', '987654331', generate_timestamp(0, 14, 0), generate_timestamp(0, 14, 30), 'paid', 25.00);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Hoy 3'), 3, 'Cliente Hoy 3', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(0, 14, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Hoy 3'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

-- Reserva 12 (Hoy - Pendiente con productos, Barbero 4)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(4, 4, 2, 'Cliente Hoy 4', '987654332', generate_timestamp(0, 16, 0), generate_timestamp(0, 16, 25), 'pending', 20.00) RETURNING id;
INSERT INTO reservation_products (reservation_id, product_id, quantity, price_at_reservation) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Hoy 4'), 104, 1, 12.00);

-- =====================================================================================================================
-- RESERVAS PARA MAÑANA Y SEMANA QUE VIENE (PENDIENTES)
-- =====================================================================================================================

-- Reserva 13 (Mañana - Pendiente)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 4, 'Cliente Mañana 1', '987654333', generate_timestamp(-1, 10, 0), generate_timestamp(-1, 10, 20), 'pending', 15.00);

-- Reserva 14 (Semana que viene - Pendiente)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 5, 'Cliente Semana Que Viene 1', '987654334', generate_timestamp(-7, 11, 0), generate_timestamp(-7, 11, 90), 'pending', 60.00);

-- =====================================================================================================================
-- VENTAS DIRECTAS (SIN RESERVA ASOCIADA)
-- =====================================================================================================================

-- Venta Directa 1 (Solo productos)
INSERT INTO sales (barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
(1, 'Cliente Directo 1', 0.00, 30.00, 30.00, 'Efectivo', generate_timestamp(5, 13, 0)) RETURNING id;
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Directo 1'), 'product', 101, 'Gel Fijador Fuerte', 2, 15.00, 30.00);

-- Venta Directa 2 (Solo productos, bajo stock)
INSERT INTO sales (barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
(2, 'Cliente Directo 2', 0.00, 25.00, 25.00, 'Tarjeta', generate_timestamp(0, 17, 0)) RETURNING id;
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Directo 2'), 'product', 103, 'Shampoo Anticaída', 1, 25.00, 25.00);

-- =====================================================================================================================
-- DATOS ADICIONALES PARA REPORTES (Más volumen)
-- =====================================================================================================================

-- Más ventas de servicios para Barbero 1 (para superar umbral de comisión)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 1, 'Cliente Extra 1', '987654340', generate_timestamp(10, 9, 0), generate_timestamp(10, 9, 30), 'paid', 25.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Extra 1'), 1, 'Cliente Extra 1', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(10, 9, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Extra 1'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 3, 'Cliente Extra 2', '987654341', generate_timestamp(12, 10, 0), generate_timestamp(12, 10, 50), 'paid', 40.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Extra 2'), 1, 'Cliente Extra 2', 40.00, 0.00, 40.00, 'Tarjeta', generate_timestamp(12, 10, 55));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Extra 2'), 'service', 3, 'Corte y Barba', 1, 40.00, 40.00);

INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 1, 'Cliente Extra 3', '987654342', generate_timestamp(15, 11, 0), generate_timestamp(15, 11, 30), 'paid', 25.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Extra 3'), 1, 'Cliente Extra 3', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(15, 11, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Extra 3'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

-- Más ventas de servicios para Barbero 2
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 2, 'Cliente Extra 4', '987654343', generate_timestamp(11, 14, 0), generate_timestamp(11, 14, 25), 'paid', 20.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Extra 4'), 2, 'Cliente Extra 4', 20.00, 0.00, 20.00, 'Tarjeta', generate_timestamp(11, 14, 30));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Extra 4'), 'service', 2, 'Afeitado Clásico', 1, 20.00, 20.00);

-- Más ventas de productos
INSERT INTO sales (barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
(3, 'Cliente Producto 1', 0.00, 5.50, 5.50, 'Efectivo', generate_timestamp(2, 10, 0)) RETURNING id;
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Producto 1'), 'product', 105, 'Refresco Cola', 1, 2.50, 2.50),
((SELECT id FROM sales WHERE customer_name = 'Cliente Producto 1'), 'product', 106, 'Café Espresso', 1, 3.00, 3.00);

INSERT INTO sales (barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
(4, 'Cliente Producto 2', 0.00, 18.00, 18.00, 'Tarjeta', generate_timestamp(4, 11, 0)) RETURNING id;
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Producto 2'), 'product', 102, 'Cera Modeladora Mate', 1, 18.00, 18.00);

-- Más reservas pendientes para horas pico
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 1, 'Cliente Pico 1', '987654350', generate_timestamp(0, 18, 0), generate_timestamp(0, 18, 30), 'pending', 25.00),
(2, 2, 1, 'Cliente Pico 2', '987654351', generate_timestamp(0, 18, 15), generate_timestamp(0, 18, 45), 'pending', 25.00),
(3, 3, 1, 'Cliente Pico 3', '987654352', generate_timestamp(0, 18, 30), generate_timestamp(0, 19, 0), 'pending', 25.00);

-- Más reservas para uso de estación
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 1, 'Cliente Estacion 1', '987654360', generate_timestamp(3, 9, 0), generate_timestamp(3, 9, 30), 'paid', 25.00);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Estacion 1'), 1, 'Cliente Estacion 1', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(3, 9, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Estacion 1'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 2, 'Cliente Estacion 2', '987654361', generate_timestamp(3, 10, 0), generate_timestamp(3, 10, 25), 'paid', 20.00);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Estacion 2'), 1, 'Cliente Estacion 2', 20.00, 0.00, 20.00, 'Efectivo', generate_timestamp(3, 10, 30));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Estacion 2'), 'service', 2, 'Afeitado Clásico', 1, 20.00, 20.00);

INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 1, 'Cliente Estacion 3', '987654362', generate_timestamp(3, 9, 15), generate_timestamp(3, 9, 45), 'paid', 25.00);
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Estacion 3'), 2, 'Cliente Estacion 3', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(3, 9, 50));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Estacion 3'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

-- =====================================================================================================================
-- DATOS PARA PROBAR COMISIONES DE BARBEROS
-- =====================================================================================================================

-- Más servicios para Barbero 1 para que supere los 2500 y active comisión del 50%
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 3, 'Cliente Comision 1', '987654370', generate_timestamp(5, 9, 0), generate_timestamp(5, 9, 50), 'paid', 40.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Comision 1'), 1, 'Cliente Comision 1', 40.00, 0.00, 40.00, 'Efectivo', generate_timestamp(5, 9, 55));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Comision 1'), 'service', 3, 'Corte y Barba', 1, 40.00, 40.00);

INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 3, 'Cliente Comision 2', '987654371', generate_timestamp(4, 10, 0), generate_timestamp(4, 10, 50), 'paid', 40.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Comision 2'), 1, 'Cliente Comision 2', 40.00, 0.00, 40.00, 'Tarjeta', generate_timestamp(4, 10, 55));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Comision 2'), 'service', 3, 'Corte y Barba', 1, 40.00, 40.00);

INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(1, 1, 3, 'Cliente Comision 3', '987654372', generate_timestamp(3, 11, 0), generate_timestamp(3, 11, 50), 'paid', 40.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Comision 3'), 1, 'Cliente Comision 3', 40.00, 0.00, 40.00, 'Efectivo', generate_timestamp(3, 11, 55));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Comision 3'), 'service', 3, 'Corte y Barba', 1, 40.00, 40.00);

-- Barbero 2 - Ventas moderadas (no supera umbral)
INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 1, 'Cliente Moderado 1', '987654380', generate_timestamp(6, 14, 0), generate_timestamp(6, 14, 30), 'paid', 25.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Moderado 1'), 2, 'Cliente Moderado 1', 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(6, 14, 35));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Moderado 1'), 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);

INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
(2, 2, 2, 'Cliente Moderado 2', '987654381', generate_timestamp(5, 15, 0), generate_timestamp(5, 15, 25), 'paid', 20.00) RETURNING id;
INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
((SELECT id FROM reservations WHERE client_name = 'Cliente Moderado 2'), 2, 'Cliente Moderado 2', 20.00, 0.00, 20.00, 'Tarjeta', generate_timestamp(5, 15, 30));
INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
((SELECT id FROM sales WHERE customer_name = 'Cliente Moderado 2'), 'service', 2, 'Afeitado Clásico', 1, 20.00, 20.00);

-- =====================================================================================================================
-- CÁLCULO Y REGISTRO DE COMISIONES
-- =====================================================================================================================

-- Calcular comisiones para el período actual (último mes)
INSERT INTO barber_commissions (barber_id, period_start, period_end, base_salary, services_total, commission_amount, total_payment)
SELECT 
    b.id,
    (CURRENT_DATE - INTERVAL '30 days')::DATE,
    CURRENT_DATE,
    b.base_salary,
    COALESCE(SUM(s.service_amount), 0),
    CASE 
        WHEN COALESCE(SUM(s.service_amount), 0) > (b.base_salary * 2) 
        THEN COALESCE(SUM(s.service_amount), 0) / 2 
        ELSE b.base_salary 
    END,
    CASE 
        WHEN COALESCE(SUM(s.service_amount), 0) > (b.base_salary * 2) 
        THEN COALESCE(SUM(s.service_amount), 0) / 2 
        ELSE b.base_salary 
    END
FROM barbers b
LEFT JOIN sales s ON b.id = s.barber_id 
    AND s.sale_date >= (CURRENT_DATE - INTERVAL '30 days')
WHERE b.is_active = true
GROUP BY b.id, b.name, b.base_salary;

-- =====================================================================================================================
-- CONSULTAS DE VERIFICACIÓN Y REPORTES
-- =====================================================================================================================

-- Verificar stock actual de productos
-- SELECT p.name, p.stock_quantity, p.min_stock_level,
--        CASE WHEN p.stock_quantity <= p.min_stock_level THEN 'BAJO STOCK' ELSE 'OK' END as status
-- FROM products p WHERE p.is_active = true;

-- Verificar comisiones de barberos
-- SELECT * FROM barber_sales_summary;

-- Verificar reservas por estado
-- SELECT status, COUNT(*) as cantidad FROM reservations GROUP BY status;

-- Verificar ventas por método de pago
-- SELECT payment_method, COUNT(*) as cantidad, SUM(total_amount) as total
-- FROM sales GROUP BY payment_method;

-- Verificar movimientos de inventario
-- SELECT p.name, im.movement_type, im.quantity, im.reference_type, im.created_at
-- FROM inventory_movements im
-- JOIN products p ON im.product_id = p.id
-- ORDER BY im.created_at DESC;

-- Eliminar la función helper
DROP FUNCTION IF EXISTS generate_timestamp(INT, INT, INT);

-- =====================================================================================================================
-- MENSAJES DE CONFIRMACIÓN
-- =====================================================================================================================
SELECT '========================================' AS mensaje;
SELECT 'SEED DATA INSERTADO EXITOSAMENTE' AS mensaje;
SELECT '========================================' AS mensaje;

SELECT 'Usuarios creados: ' || COUNT(*)::TEXT AS mensaje FROM users;
SELECT 'Barberos activos: ' || COUNT(*)::TEXT AS mensaje FROM barbers WHERE is_active = true;
SELECT 'Servicios activos: ' || COUNT(*)::TEXT AS mensaje FROM services WHERE is_active = true;
SELECT 'Productos activos: ' || COUNT(*)::TEXT AS mensaje FROM products WHERE is_active = true;
SELECT 'Reservas totales: ' || COUNT(*)::TEXT AS mensaje FROM reservations;
SELECT 'Reservas pagadas: ' || COUNT(*)::TEXT AS mensaje FROM reservations WHERE status = 'paid';
SELECT 'Reservas pendientes: ' || COUNT(*)::TEXT AS mensaje FROM reservations WHERE status = 'pending';
SELECT 'Ventas totales: ' || COUNT(*)::TEXT AS mensaje FROM sales;
SELECT 'Total vendido: S/ ' || COALESCE(SUM(total_amount), 0)::NUMERIC(10, 2)::TEXT AS mensaje FROM sales;
SELECT 'Productos con bajo stock: ' || COUNT(*)::TEXT AS mensaje FROM products WHERE stock_quantity <= min_stock_level AND is_active = true;

SELECT '========================================' AS mensaje;
SELECT 'Listo para usar el sistema!' AS mensaje;
SELECT '========================================' AS mensaje;