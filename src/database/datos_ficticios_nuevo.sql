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
    settings,
    barber_advances
RESTART IDENTITY CASCADE;

-- Insert data for users table
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'administrador'), -- password: adminpassword
('Cashier User', 'cashier@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'), -- password: cashierpassword
('Barber User 1', 'barber1@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'), -- password: cashierpassword
('New Admin User', 'newadmin@example.com', '$2b$10$3J7J.VnJBCn6hqVsNi2b1.msw9CEJ0feAVy4T3s8whHrwgUPIzMGK', 'administrador'), -- password: newadminpassword
('New Admin User 2', 'newadmin2@example.com', '$2b$10$aNSO.i..ZxdvMvkSJF7mj.ANDH4ss247fXKV4EHUp01utfoGNqyDq', 'administrador'), -- password: newadminpass
('New Cashier User', 'newcashier@example.com', '$2b$10$wHI/RpHxsiCY8.r1gY.XdeZQxq2ROE8V5hXTbsALUAgZGD3BhdNTu', 'cajero'); -- password: newcashierpass

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
(1, 'Carlos Ruiz', 'carlos.ruiz@example.com', '555-5678', 'Cortes clásicos', NULL, 1, 1000, true),
(2, 'Luis Fernandez', 'luis.fernandez@example.com', '555-8765', 'Estilos modernos', NULL, 2, 1400, true),
(3, 'Pedro Martinez', 'pedro.martinez@example.com', '555-4321', 'Barba y bigote', NULL, 3, 1350, true),
(4, 'Ana García', 'ana.garcia@example.com', '555-9876', 'Color y tratamientos', NULL, 4, 1200, true),
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
CREATE OR REPLACE FUNCTION generate_timestamp(months_ago INT, days_ago INT, hours INT, minutes INT) RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN NOW() - INTERVAL '1 month' * months_ago - INTERVAL '1 day' * days_ago + INTERVAL '1 hour' * hours + INTERVAL '1 minute' * minutes;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================================================
-- DATOS HISTÓRICOS (ÚLTIMOS 3 MESES)
-- =====================================================================================================================

-- Loop para 3 meses atrás (Mayo, Junio, Julio)
DO $$
DECLARE
    current_month_offset INT;
    current_day_offset INT;
    barber_id_val INT;
    service_id_val INT;
    station_id_val INT;
    client_name_val TEXT;
    sale_id_val INT;
    reservation_id_val INT;
    service_price_val REAL;
    base_salary_val REAL;
    total_services_val REAL;
    commission_amount_val REAL;
    total_payment_val REAL;
    period_start_date DATE;
    period_end_date DATE;
BEGIN
    FOR current_month_offset IN 3..1 LOOP -- 3 = Mayo, 2 = Junio, 1 = Julio
        -- Calcular inicio y fin del mes
        period_start_date := (NOW() - INTERVAL '1 month' * current_month_offset)::DATE;
        period_start_date := DATE_TRUNC('month', period_start_date);
        period_end_date := (period_start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

        -- Ventas y Reservas para Carlos Ruiz (ID 1) - Supera umbral
        barber_id_val := 1;
        base_salary_val := (SELECT base_salary FROM barbers WHERE id = barber_id_val);
        total_services_val := 0;

        FOR current_day_offset IN 0..29 LOOP -- Días del mes
            -- Venta de Corte y Barba (40.00)
            INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
            (barber_id_val, 1, 3, 'Cliente Histórico CR ' || current_month_offset || '-' || current_day_offset, '9876543' || (current_month_offset * 100 + current_day_offset), generate_timestamp(current_month_offset, current_day_offset, 9, 0), generate_timestamp(current_month_offset, current_day_offset, 9, 50), 'paid', 40.00) RETURNING id INTO reservation_id_val;
            INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
            (reservation_id_val, barber_id_val, 'Cliente Histórico CR ' || current_month_offset || '-' || current_day_offset, 40.00, 0.00, 40.00, 'Efectivo', generate_timestamp(current_month_offset, current_day_offset, 9, 55)) RETURNING id INTO sale_id_val;
            INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
            (sale_id_val, 'service', 3, 'Corte y Barba', 1, 40.00, 40.00);
            total_services_val := total_services_val + 40.00;

            -- Venta de Tinte de Cabello (60.00) - para asegurar umbral
            IF current_day_offset % 5 = 0 THEN
                INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
                (barber_id_val, 1, 5, 'Cliente Tinte CR ' || current_month_offset || '-' || current_day_offset, '9876544' || (current_month_offset * 100 + current_day_offset), generate_timestamp(current_month_offset, current_day_offset, 11, 0), generate_timestamp(current_month_offset, current_day_offset, 12, 30), 'paid', 60.00) RETURNING id INTO reservation_id_val;
                INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
                (reservation_id_val, barber_id_val, 'Cliente Tinte CR ' || current_month_offset || '-' || current_day_offset, 60.00, 0.00, 60.00, 'Tarjeta', generate_timestamp(current_month_offset, current_day_offset, 12, 35)) RETURNING id INTO sale_id_val;
                INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
                (sale_id_val, 'service', 5, 'Tinte de Cabello', 1, 60.00, 60.00);
                total_services_val := total_services_val + 60.00;
            END IF;
        END LOOP;

        -- Calcular y registrar comisión para Carlos Ruiz
        commission_amount_val := CASE
            WHEN total_services_val > (base_salary_val * 2) THEN total_services_val / 2
            ELSE base_salary_val
        END;
        total_payment_val := commission_amount_val; -- Sin adelantos por ahora en histórico

        INSERT INTO barber_commissions (barber_id, period_start, period_end, base_salary, services_total, commission_amount, total_payment, status) VALUES
        (barber_id_val, period_start_date, period_end_date, base_salary_val, total_services_val, commission_amount_val, total_payment_val, 'paid');

        -- Ventas y Reservas para Luis Fernandez (ID 2) - No supera umbral
        barber_id_val := 2;
        base_salary_val := (SELECT base_salary FROM barbers WHERE id = barber_id_val);
        total_services_val := 0;

        FOR current_day_offset IN 0..15 LOOP -- Menos ventas
            INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
            (barber_id_val, 2, 1, 'Cliente Histórico LF ' || current_month_offset || '-' || current_day_offset, '9876545' || (current_month_offset * 100 + current_day_offset), generate_timestamp(current_month_offset, current_day_offset, 10, 0), generate_timestamp(current_month_offset, current_day_offset, 10, 30), 'paid', 25.00) RETURNING id INTO reservation_id_val;
            INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
            (reservation_id_val, barber_id_val, 'Cliente Histórico LF ' || current_month_offset || '-' || current_day_offset, 25.00, 0.00, 25.00, 'Efectivo', generate_timestamp(current_month_offset, current_day_offset, 10, 35)) RETURNING id INTO sale_id_val;
            INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
            (sale_id_val, 'service', 1, 'Corte de Cabello', 1, 25.00, 25.00);
            total_services_val := total_services_val + 25.00;
        END LOOP;

        -- Calcular y registrar comisión para Luis Fernandez
        commission_amount_val := CASE
            WHEN total_services_val > (base_salary_val * 2) THEN total_services_val / 2
            ELSE base_salary_val
        END;
        total_payment_val := commission_amount_val;

        INSERT INTO barber_commissions (barber_id, period_start, period_end, base_salary, services_total, commission_amount, total_payment, status) VALUES
        (barber_id_val, period_start_date, period_end_date, base_salary_val, total_services_val, commission_amount_val, total_payment_val, 'paid');

        -- Ventas y Reservas para Ana García (ID 4) - Supera umbral
        barber_id_val := 4;
        base_salary_val := (SELECT base_salary FROM barbers WHERE id = barber_id_val);
        total_services_val := 0;

        FOR current_day_offset IN 0..29 LOOP -- Días del mes
            -- Venta de Corte y Barba (40.00)
            INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
            (barber_id_val, 4, 3, 'Cliente Histórico AG ' || current_month_offset || '-' || current_day_offset, '9876546' || (current_month_offset * 100 + current_day_offset), generate_timestamp(current_month_offset, current_day_offset, 13, 0), generate_timestamp(current_month_offset, current_day_offset, 13, 50), 'paid', 40.00) RETURNING id INTO reservation_id_val;
            INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
            (reservation_id_val, barber_id_val, 'Cliente Histórico AG ' || current_month_offset || '-' || current_day_offset, 40.00, 0.00, 40.00, 'Tarjeta', generate_timestamp(current_month_offset, current_day_offset, 13, 55)) RETURNING id INTO sale_id_val;
            INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
            (sale_id_val, 'service', 3, 'Corte y Barba', 1, 40.00, 40.00);
            total_services_val := total_services_val + 40.00;

            -- Venta de Tinte de Cabello (60.00) - para asegurar umbral
            IF current_day_offset % 7 = 0 THEN
                INSERT INTO reservations (barber_id, station_id, service_id, client_name, client_phone, start_time, end_time, status, service_price) VALUES
                (barber_id_val, 4, 5, 'Cliente Tinte AG ' || current_month_offset || '-' || current_day_offset, '9876547' || (current_month_offset * 100 + current_day_offset), generate_timestamp(current_month_offset, current_day_offset, 15, 0), generate_timestamp(current_month_offset, current_day_offset, 16, 30), 'paid', 60.00) RETURNING id INTO reservation_id_val;
                INSERT INTO sales (reservation_id, barber_id, customer_name, service_amount, products_amount, total_amount, payment_method, sale_date) VALUES
                (reservation_id_val, barber_id_val, 'Cliente Tinte AG ' || current_month_offset || '-' || current_day_offset, 60.00, 0.00, 60.00, 'Efectivo', generate_timestamp(current_month_offset, current_day_offset, 16, 35)) RETURNING id INTO sale_id_val;
                INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price) VALUES
                (sale_id_val, 'service', 5, 'Tinte de Cabello', 1, 60.00, 60.00);
                total_services_val := total_services_val + 60.00;
            END IF;
        END LOOP;

        -- Calcular y registrar comisión para Ana García
        commission_amount_val := CASE
            WHEN total_services_val > (base_salary_val * 2) THEN total_services_val / 2
            ELSE base_salary_val
        END;
        total_payment_val := commission_amount_val;

        INSERT INTO barber_commissions (barber_id, period_start, period_end, base_salary, services_total, commission_amount, total_payment, status) VALUES
        (barber_id_val, period_start_date, period_end_date, base_salary_val, total_services_val, commission_amount_val, total_payment_val, 'paid');

    END LOOP;
END $$;

-- =====================================================================================================================
-- DATOS DE ADELANTOS DE SUELDO
-- =====================================================================================================================

INSERT INTO barber_advances (barber_id, amount, date, notes) VALUES
(1, 100.00, generate_timestamp(0, 10, 0, 0)::DATE, 'Adelanto para gastos personales'),
(1, 50.00, generate_timestamp(0, 5, 0, 0)::DATE, 'Adelanto por emergencia'),
(2, 75.00, generate_timestamp(0, 8, 0, 0)::DATE, 'Adelanto para transporte');

-- =====================================================================================================================
-- CÁLCULO Y REGISTRO DE COMISIONES (Este bloque se manejará ahora por la función generateBarberPayments)
-- =====================================================================================================================

-- Eliminar la función helper
DROP FUNCTION IF EXISTS generate_timestamp(INT, INT, INT, INT);

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
SELECT 'Adelantos registrados: ' || COUNT(*)::TEXT AS mensaje FROM barber_advances;
SELECT 'Comisiones históricas registradas: ' || COUNT(*)::TEXT AS mensaje FROM barber_commissions;

SELECT '========================================' AS mensaje;
SELECT 'Listo para usar el sistema!' AS mensaje;
SELECT '========================================' AS mensaje;