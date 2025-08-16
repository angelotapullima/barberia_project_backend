-- =====================================================================================================================
-- SCRIPT MAESTRO COMPLETO PARA BARBERÍA
-- Incluye: Estructura de tablas + Datos básicos + Datos de prueba completos
-- Usar cuando se haga DROP a las tablas para resetear completamente
-- =====================================================================================================================

-- ===== LIMPIAR TODO =====
DROP TABLE IF EXISTS
    barber_advances,
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
CASCADE;


-- ===== CREAR ESTRUCTURA COMPLETA =====

-- ===== TABLAS BÁSICAS =====
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cajero',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT,
    description TEXT
);

CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS barbers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE,
    hire_date DATE DEFAULT CURRENT_DATE,
    base_salary REAL DEFAULT 0.0,
    commission_rate REAL DEFAULT 0.0,
    is_active BOOLEAN DEFAULT true,
    station_id INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_station
        FOREIGN KEY (station_id)
        REFERENCES stations(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    duration_minutes INT NOT NULL,
    price REAL NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price REAL NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    barber_id INT NOT NULL,
    station_id INT,
    service_id INT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending',
    service_price REAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_station
        FOREIGN KEY (station_id)
        REFERENCES stations(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_service
        FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS reservation_products (
    id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_reservation REAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    reservation_id INT UNIQUE,
    barber_id INT,
    customer_name TEXT,
    service_amount REAL NOT NULL,
    products_amount REAL NOT NULL DEFAULT 0.0,
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INT NOT NULL,
    item_type TEXT NOT NULL,
    item_id INT NOT NULL,
    item_name TEXT,
    quantity INT NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_sale
        FOREIGN KEY (sale_id)
        REFERENCES sales(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type TEXT NOT NULL, -- 'in' (entrada), 'out' (salida)
    quantity INT NOT NULL,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
    notes TEXT,
    CONSTRAINT fk_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS barber_advances (
    id SERIAL PRIMARY KEY,
    barber_id INT NOT NULL,
    amount REAL NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_barber
        FOREIGN KEY (barber_id)
        REFERENCES barbers(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS barber_commissions (
    id SERIAL PRIMARY KEY,
    barber_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary REAL NOT NULL,
    services_total REAL NOT NULL,
    commission_amount REAL NOT NULL,
    total_payment REAL NOT NULL,
       status TEXT NOT NULL DEFAULT 'pending', -- 'paid'
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       CONSTRAINT fk_barber
           FOREIGN KEY (barber_id)
           REFERENCES barbers(id)
           ON DELETE CASCADE,
       -- ESTA ES LA LÍNEA A LA QUE ME REFIERO:
       CONSTRAINT unique_barber_period UNIQUE (barber_id, period_start,
      period_end)
    );



DROP VIEW IF EXISTS barber_sales_summary CASCADE;

CREATE OR REPLACE VIEW barber_sales_summary AS
SELECT
    b.id AS barber_id,
    b.name AS barber_name,
    COALESCE(SUM(s.total_amount), 0) AS total_sales_amount,
    COALESCE(SUM(s.service_amount), 0) AS total_service_sales,
    COALESCE(SUM(s.products_amount), 0) AS total_product_sales,
    COUNT(s.id) AS total_sales_count
FROM
    barbers b
LEFT JOIN
    sales s ON b.id = s.barber_id
GROUP BY
    b.id, b.name
ORDER BY
    b.name;
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;
DROP TRIGGER IF EXISTS trigger_update_stock ON sale_items;


-- ===== FUNCIONES Y TRIGGERS =====

-- Función para actualizar stock al registrar una venta
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
DECLARE
    current_product_stock INT;
    product_category TEXT;
BEGIN
    IF NEW.item_type = 'product' THEN
        -- Verificar si el producto existe
        SELECT stock_quantity, category INTO current_product_stock, product_category
        FROM products
        WHERE id = NEW.item_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Producto con ID % no encontrado', NEW.item_id;
        END IF;

        -- Actualizar stock
        UPDATE products
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.item_id;

        -- Registrar movimiento de inventario
        INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes)
        VALUES (NEW.item_id, 'out', NEW.quantity, 'sale', 'Venta de producto a través de sale_item');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para la función de actualización de stock
CREATE TRIGGER trigger_update_stock
AFTER INSERT ON sale_items
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Función auxiliar para obtener el inicio de la semana
CREATE OR REPLACE FUNCTION get_week_start(offset_weeks INT)
RETURNS DATE AS $$
BEGIN
    RETURN DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week' * offset_weeks;
END;
$$ LANGUAGE plpgsql;

-- Función auxiliar para obtener una hora aleatoria dentro de un rango
CREATE OR REPLACE FUNCTION get_random_time_in_day(day DATE, start_hour INT, end_hour INT)
RETURNS TIMESTAMP AS $$
DECLARE
    random_minutes INT;
BEGIN
    random_minutes := FLOOR(RANDOM() * ((end_hour - start_hour) * 60));
    RETURN day::TIMESTAMP + INTERVAL '1 hour' * start_hour + INTERVAL '1 minute' * random_minutes;
END;
$$ LANGUAGE plpgsql;

-- ===== INSERTAR DATOS INICIALES =====

-- Usuarios
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'administrador'), -- password: adminpassword
('Cashier User', 'cashier@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'), -- password: cashierpassword
('Barber User 1', 'barber1@example.com', '$2b$10$E.w2a/oG.Pz4.w/jKzE95uK.E5.f8rE6.yG.w/jKzE95uK.E5.f8', 'cajero'), -- password: cashierpassword
('New Admin User', 'newadmin@example.com', '$2b$10$3J7J.VnJBCn6hqVsNi2b1.msw9CEJ0feAVy4T3s8whHrwgUPIzMGK', 'administrador'), -- password: newadminpassword
('New Admin User 2', 'newadmin2@example.com', '$2b$10$aNSO.i..ZxdvMvkSJF7mj.ANDH4ss247fXKV4EHUp01utfoGNqyDq', 'administrador'), -- password: newadminpass
('New Cashier User', 'newcashier@example.com', '$2b$10$wHI/RpHxsiCY8.r1gY.XdeZQxq2ROE8V5hXTbsALUAgZGD3BhdNTu', 'cajero'); -- password: newcashierpass

-- Configuraciones
INSERT INTO settings (setting_key, setting_value, description) VALUES
('shop_name', 'Barbería La Fígaro', 'Nombre de la barbería'),
('shop_address', 'Av. Larco 1234, Miraflores, Lima', 'Dirección de la barbería'),
('shop_phone', '(01) 555-1234', 'Teléfono de contacto'),
('shop_email', 'contacto@barberiafigaro.com', 'Email de contacto'),
('commission_threshold', '2500', 'Monto de servicios para activar comisión del 50%'),
('commission_percentage', '0.5', 'Porcentaje de comisión para barberos'),
('default_base_salary', '1250', 'Salario base por defecto para barberos'),
('default_service_duration', '30', 'Duración por defecto de servicios en minutos'),
('low_stock_notification', 'true', 'Notificar cuando hay poco stock'),
('tax_rate', '0.18', 'Tasa de IGV aplicable'),
('currency', 'PEN', 'Moneda del sistema (Soles Peruanos)'),
('working_hours_start', '08:00', 'Hora de inicio laboral'),
('working_hours_end', '19:00', 'Hora de fin laboral'),
('max_advance_percentage', '0.4', 'Máximo porcentaje de adelanto sobre sueldo')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value; -- Para que funcione con un posible re-run



-- Estaciones de trabajo
INSERT INTO stations (id, name, description, is_active) VALUES
(1, 'Estación Principal', 'Puesto principal con espejo grande y mejor iluminación', true),
(2, 'Estación Deluxe', 'Puesto premium con silla reclinable y servicios completos', true),
(3, 'Estación Express', 'Puesto para servicios rápidos y cortes básicos', true),
(4, 'Estación VIP', 'Puesto exclusivo para servicios especializados', true),
(5, 'Estación Auxiliar', 'Puesto de respaldo para días ocupados', true),
(6, 'Estación Mantenimiento', 'Estación temporal fuera de servicio', false);


-- Barberos
INSERT INTO barbers (id, name, email, phone, station_id, base_salary, is_active) VALUES
(1, 'Carlos "El Maestro" Ruiz', 'carlos.ruiz@barberiafigaro.com', '987-654-321', 1, 1000, true),
(2, 'Luis "Moderno" Fernández', 'luis.fernandez@barberiafigaro.com', '987-654-322', 2, 1400, true),
(3, 'Pedro "Barbón" Martínez', 'pedro.martinez@barberiafigaro.com', '987-654-323', 3, 1350, true),
(4, 'Ana "Estilista" García', 'ana.garcia@barberiafigaro.com', '987-654-324', 4, 1200, true),
(5, 'Miguel "Rápido" Torres', 'miguel.torres@barberiafigaro.com', '987-654-325', 5, 1100, true),
(6, 'Barbero Temporal', 'temporal@barberiafigaro.com', '987-000-000', NULL, 1000, false);


-- Servicios
INSERT INTO services (id, name, description, price, duration_minutes, is_active) VALUES
(1, 'Corte Clásico', 'Corte de cabello tradicional con tijeras', 25.00, 30, true),
(2, 'Corte Moderno', 'Corte con máquina, fade y diseños', 30.00, 35, true),
(3, 'Afeitado Tradicional', 'Afeitado con navaja y toallas calientes', 20.00, 25, true),
(4, 'Corte + Barba', 'Paquete completo de corte y arreglo de barba', 40.00, 50, true),
(5, 'Lavado y Peinado', 'Lavado profundo con masaje y peinado', 15.00, 20, true),
(6, 'Tinte Profesional', 'Aplicación de tinte con productos premium', 60.00, 90, true),
(7, 'Tratamiento Capilar', 'Hidratación y nutrición del cabello', 45.00, 60, true),
(8, 'Corte Niños', 'Corte especial para menores de 12 años', 20.00, 25, true),
(9, 'Peinado Evento', 'Peinado especial para ocasiones importantes', 35.00, 40, true),
(10, 'Servicio Express', 'Corte rápido sin lavado', 18.00, 15, true),
(11, 'Servicio Temporal', 'Servicio de prueba (inactivo)', 10.00, 15, false);

-- Productos
INSERT INTO products (id, name, description, price, stock_quantity, min_stock_level, category) VALUES
-- Cuidado Capilar (ID 1xx)
(101, 'Gel Fijador Extra Fuerte', 'Gel de alta fijación para peinados duraderos.', 25.00, 50, 10, 'Cuidado Capilar'),
(102, 'Cera Modeladora', 'Cera de acabado mate para modelar el cabello.', 30.00, 45, 10, 'Cuidado Capilar'),
(103, 'Shampoo Anticaída', 'Shampoo especializado para fortalecer el cabello.', 45.00, 20, 5, 'Cuidado Capilar'),
(104, 'Acondicionador Nutritivo', 'Acondicionador que hidrata y repara el cabello.', 40.00, 35, 8, 'Cuidado Capilar'),
(105, 'Pomada Vintage', 'Pomada a base de agua para peinados clásicos.', 35.00, 28, 7, 'Cuidado Capilar'),
(106, 'Spray Texturizante', 'Spray para dar volumen y textura al cabello.', 32.00, 22, 5, 'Cuidado Capilar'),
(107, 'Crema Hidratante para Pelo', 'Crema ligera para hidratar y controlar el frizz.', 28.00, 30, 6, 'Cuidado Capilar'),
(108, 'Tónico Capilar Refrescante', 'Tónico que refresca el cuero cabelludo.', 20.00, 15, 4, 'Cuidado Capilar'),

-- Cuidado Facial/Barba (ID 2xx)
(201, 'Bálsamo para Barba Premium', 'Bálsamo para hidratar y dar forma a la barba.', 55.00, 30, 8, 'Cuidado Facial'),
(202, 'Aceite para Barba', 'Aceite ligero para suavizar y nutrir el vello facial.', 48.00, 40, 10, 'Cuidado Facial'),
(203, 'Aftershave Clásico', 'Loción para después de afeitar con aroma tradicional.', 38.00, 25, 5, 'Cuidado Facial'),
(204, 'Exfoliante Facial', 'Exfoliante para una limpieza profunda del rostro.', 30.00, 18, 5, 'Cuidado Facial'),
(205, 'Mascarilla de Arcilla', 'Mascarilla purificante para pieles grasas.', 27.00, 12, 3, 'Cuidado Facial'),
(206, 'Crema de Afeitar', 'Crema para un afeitado suave y sin irritación.', 22.00, 20, 4, 'Cuidado Facial'),

-- Bebidas y snacks (ID 3xx)
(301, 'Agua Mineral', 'Botella de 500ml.', 5.00, 120, 20, 'Bebidas'),
(302, 'Refrescos Cola', 'Lata de 355ml.', 7.00, 80, 15, 'Bebidas'),
(303, 'Café Americano', 'Taza de café recién hecho.', 10.00, 50, 10, 'Bebidas'),
(304, 'Café Espresso', 'Shot de espresso.', 8.00, 40, 8, 'Bebidas'),
(305, 'Jugo Natural Naranja', 'Jugo natural exprimido al momento.', 12.00, 25, 5, 'Bebidas'),
(306, 'Cerveza Artesanal', 'Botella de cerveza artesanal local.', 20.00, 30, 5, 'Bebidas'),

-- Otros (ID 4xx)
(401, 'Toallas Premium', 'Toallas de algodón de alta calidad.', 8.00, 50, 10, 'Otros'),
(402, 'Peines Profesionales', 'Kit de peines para barbería.', 18.00, 30, 5, 'Otros'),
(403, 'Cepillo de Barba', 'Cepillo de madera con cerdas naturales.', 25.00, 15, 3, 'Otros'),
(404, 'Kit Afeitado', 'Set de afeitado con brocha y jabón.', 70.00, 10, 2, 'Otros'),
(405, 'Gorras Barbería', 'Gorras con el logo de la barbería.', 40.00, 20, 5, 'Otros');


-- ===== STOCK INICIAL DE INVENTARIO =====
INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes) VALUES
-- Cuidado Capilar
(101, 'in', 50, 'initial_stock', 'Stock inicial - Gel Fijador'),
(102, 'in', 50, 'initial_stock', 'Stock inicial - Cera Modeladora'),
(103, 'in', 20, 'initial_stock', 'Stock inicial - Shampoo Anticaída'),
(104, 'in', 30, 'initial_stock', 'Stock inicial - Acondicionador'),
(105, 'in', 40, 'initial_stock', 'Stock inicial - Pomada Vintage'),
(106, 'in', 35, 'initial_stock', 'Stock inicial - Spray Texturizante'),

-- Cuidado Facial
(201, 'in', 45, 'initial_stock', 'Stock inicial - Bálsamo Barba'),
(202, 'in', 40, 'initial_stock', 'Stock inicial - Aceite Barba'),
(203, 'in', 35, 'initial_stock', 'Stock inicial - Aftershave'),
(204, 'in', 25, 'initial_stock', 'Stock inicial - Crema Facial'),
(205, 'in', 28, 'initial_stock', 'Stock inicial - Exfoliante'),

-- Bebidas
(301, 'in', 200, 'initial_stock', 'Stock inicial - Agua Mineral'),
(302, 'in', 100, 'initial_stock', 'Stock inicial - Refresco Cola'),
(303, 'in', 80, 'initial_stock', 'Stock inicial - Café Americano'),
(304, 'in', 60, 'initial_stock', 'Stock inicial - Café Espresso'),
(305, 'in', 40, 'initial_stock', 'Stock inicial - Jugo Naranja'),
(306, 'in', 50, 'initial_stock', 'Stock inicial - Galletas'),

-- Accesorios
(401, 'in', 25, 'initial_stock', 'Stock inicial - Toallas Premium'),
(402, 'in', 40, 'initial_stock', 'Stock inicial - Peines'),
(403, 'in', 30, 'initial_stock', 'Stock inicial - Cepillos Barba'),
(404, 'in', 15, 'initial_stock', 'Stock inicial - Kits Afeitado'),
(405, 'in', 35, 'initial_stock', 'Stock inicial - Gorras');

-- ===== DATOS DE PRUEBA ADICIONALES =====


-- =====================================================================================================================
-- CORRECCIÓN: DATOS DE PRUEBA CON HORAS CORRECTAS
-- Reemplazar las secciones de inserción de reservas en el script original
-- =====================================================================================================================

-- =====================================================================================================================
-- FUNCIÓN MEJORADA PARA CALCULAR HORAS CORRECTAS
-- =====================================================================================================================

-- Función mejorada para obtener una hora válida dentro del horario laboral
CREATE OR REPLACE FUNCTION get_valid_business_time(day DATE, start_hour INT DEFAULT 8, end_hour INT DEFAULT 21)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    random_minutes INT;
    calculated_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generar minutos aleatorios dentro del rango de horas de negocio
    random_minutes := FLOOR(RANDOM() * ((end_hour - start_hour) * 60));
    calculated_time := day::TIMESTAMP + INTERVAL '1 hour' * start_hour + INTERVAL '1 minute' * random_minutes;
    
    -- Asegurar que esté dentro del horario laboral
    IF EXTRACT(HOUR FROM calculated_time) < start_hour THEN
        calculated_time := DATE_TRUNC('day', calculated_time) + INTERVAL '1 hour' * start_hour;
    ELSIF EXTRACT(HOUR FROM calculated_time) >= end_hour THEN
        calculated_time := DATE_TRUNC('day', calculated_time) + INTERVAL '1 hour' * (end_hour - 1);
    END IF;
    
    RETURN calculated_time;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular end_time correcto basado en start_time y duración del servicio
CREATE OR REPLACE FUNCTION calculate_valid_end_time(start_time TIMESTAMP WITH TIME ZONE, duration_minutes INT, max_hour INT DEFAULT 21)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    calculated_end_time TIMESTAMP WITH TIME ZONE;
    max_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calcular end_time basado en la duración
    calculated_end_time := start_time + INTERVAL '1 minute' * duration_minutes;
    
    -- Límite máximo del día (ej: 21:00)
    max_end_time := DATE_TRUNC('day', start_time) + INTERVAL '1 hour' * max_hour;
    
    -- Si el end_time calculado excede el horario laboral, usar el límite máximo
    IF calculated_end_time > max_end_time THEN
        calculated_end_time := max_end_time;
    END IF;
    
    -- Asegurar que end_time sea al menos 1 minuto después de start_time
    IF calculated_end_time <= start_time THEN
        calculated_end_time := start_time + INTERVAL '1 minute';
    END IF;
    
    RETURN calculated_end_time;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================================================
-- DATOS DE PRUEBA: 3 MESES HISTÓRICOS (CORREGIDO CON HORAS VÁLIDAS)
-- =====================================================================================================================
DO $$
DECLARE
    historic_date DATE;
    barber_rec RECORD;
    service_rec RECORD;
    product_rec RECORD;
    reservation_id_val INT;
    sale_id_val INT;
    day_counter INT := 0;
    random_clients TEXT[] := ARRAY[
        'Juan Pérez Histórico', 'María García Antigua', 'Carlos Rodríguez Pasado', 'Ana Martínez Historia',
        'Luis González Viejo', 'Carmen López Anterior', 'José Hernández Previo', 'Elena Sánchez Pasada',
        'Miguel Torres Histórico', 'Isabel Ruiz Antigua', 'Antonio Jiménez Previo', 'Rosa Morales Historia',
        'Francisco Castro Pasado', 'Laura Ortega Anterior', 'Manuel Ramos Viejo', 'Pilar Delgado Histórica',
        'Alejandro Vargas Antiguo', 'Cristina Herrera Previa', 'Raúl Mendoza Historia', 'Patricia Silva Pasada'
    ];
    client_name_val TEXT;
    service_price_val REAL;
    total_amount_val REAL;
    products_amount_val REAL;
    calculated_start_time TIMESTAMP WITH TIME ZONE;
    calculated_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Generar datos históricos de 90 días (3 meses)
    FOR day_counter IN 0..89 LOOP
        historic_date := CURRENT_DATE - INTERVAL '90 days' + INTERVAL '1 day' * day_counter;
        
        -- Solo días laborales (no domingos)
        IF EXTRACT(DOW FROM historic_date) NOT IN (0) THEN
            
            -- Para cada barbero activo
            FOR barber_rec IN SELECT * FROM barbers WHERE is_active = true ORDER BY id LOOP
                
                -- Generar 1-4 reservas por barbero por día
                FOR i IN 1..(1 + FLOOR(RANDOM() * 4)) LOOP
                    
                    client_name_val := random_clients[1 + FLOOR(RANDOM() * array_length(random_clients, 1))];
                    SELECT * INTO service_rec FROM services WHERE is_active = true AND duration_minutes <= 90 ORDER BY RANDOM() LIMIT 1;
                    service_price_val := service_rec.price;
                    
                    -- CORRECCIÓN: Calcular horas correctamente
                    calculated_start_time := get_valid_business_time(historic_date, 8, 19); -- Hasta las 19h para dejar margen
                    calculated_end_time := calculate_valid_end_time(calculated_start_time, service_rec.duration_minutes, 21);
                    
                    -- Crear reserva histórica (todas pagadas) con horas correctas
                    INSERT INTO reservations (
                        barber_id, station_id, service_id, client_name, client_phone,
                        start_time, end_time, status, service_price, notes
                    ) VALUES (
                        barber_rec.id, barber_rec.station_id, service_rec.id, client_name_val,
                        '9' || LPAD((100000000 + FLOOR(RANDOM() * 899999999))::TEXT, 9, '0'),
                        calculated_start_time,
                        calculated_end_time,
                        'paid', service_price_val, 'Reserva histórica'
                    ) RETURNING id INTO reservation_id_val;
                    
                    -- Crear la venta asociada a esa reserva
                    products_amount_val := 0;
                    total_amount_val := service_price_val + products_amount_val;
                    
                    INSERT INTO sales (
                        reservation_id, barber_id, customer_name, service_amount, products_amount,
                        total_amount, payment_method, sale_date
                    ) VALUES (
                        reservation_id_val, barber_rec.id, client_name_val, service_price_val,
                        products_amount_val, total_amount_val,
                        CASE WHEN RANDOM() < 0.5 THEN 'cash' WHEN RANDOM() < 0.8 THEN 'card' ELSE 'transfer' END,
                        calculated_start_time + INTERVAL '1 minute' * service_rec.duration_minutes -- Sale_date al finalizar servicio
                    ) RETURNING id INTO sale_id_val;
                    
                    -- Crear sale_items para el servicio
                    INSERT INTO sale_items (
                        sale_id, item_type, item_id, item_name, quantity, unit_price, total_price
                    ) VALUES (
                        sale_id_val, 'service', service_rec.id, service_rec.name, 1, service_price_val, service_price_val
                    );
                    -- Crear sale_items para productos (si los hay)
                    IF products_amount_val > 0 THEN
                        INSERT INTO reservation_products (
                            reservation_id, product_id, quantity, price_at_reservation
                        ) VALUES (
                            reservation_id_val, product_rec.id, 1, product_rec.price
                        );
                        
                        INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price)
                        SELECT 
                            sale_id_val, 'product', rp.product_id, p.name, rp.quantity, 
                            rp.price_at_reservation, (rp.quantity * rp.price_at_reservation)
                        FROM reservation_products rp
                        JOIN products p ON rp.product_id = p.id
                        WHERE rp.reservation_id = reservation_id_val;
                    END IF;
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- =====================================================================================================================
-- DATOS DE PRUEBA: ESTA SEMANA (LUNES A HOY) (CORREGIDO CON HORAS VÁLIDAS)
-- =====================================================================================================================

DO $$
DECLARE
    current_week_start DATE := get_week_start(0);
    current_date_iter DATE;
    day_counter INT;
    barber_rec RECORD;
    service_rec RECORD;
    product_rec RECORD;
    reservation_id_val INT;
    sale_id_val INT;
    random_clients TEXT[] := ARRAY[
        'Ana Ruiz Actual', 'Carlos Vega Esta Semana', 'María Jiménez Presente', 'Luis Herrera Hoy',
        'Carmen Torres Actual', 'José Moreno Semana', 'Elena Castro Presente', 'Miguel Vargas Actual',
        'Sofia López Esta Semana', 'Diego Ramírez Presente', 'Valentina Cruz Actual', 'Mateo Silva Hoy'
    ];
    client_name_val TEXT;
    service_price_val REAL;
    total_amount_val REAL;
    products_amount_val REAL;
    reservation_status TEXT;
    calculated_start_time TIMESTAMP WITH TIME ZONE;
    calculated_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Desde el lunes de esta semana hasta hoy
    FOR day_counter IN 0..6 LOOP
        current_date_iter := current_week_start + INTERVAL '1 day' * day_counter;
        
        -- Solo hasta hoy
        EXIT WHEN current_date_iter > CURRENT_DATE;
        
        -- Solo días laborales (no domingos)
        IF EXTRACT(DOW FROM current_date_iter) NOT IN (0) THEN
            
            FOR barber_rec IN SELECT * FROM barbers WHERE is_active = true ORDER BY id LOOP
                
                -- 1-3 reservas por barbero por día en semana actual
                FOR i IN 1..(1 + FLOOR(RANDOM() * 3)) LOOP
                    
                    client_name_val := random_clients[1 + FLOOR(RANDOM() * array_length(random_clients, 1))];
                    SELECT * INTO service_rec FROM services WHERE is_active = true AND duration_minutes <= 90 ORDER BY RANDOM() LIMIT 1;
                    service_price_val := service_rec.price;
                    
                    -- Estados variados: 60% pagadas, 20% completadas, 15% en progreso, 5% confirmadas
                    reservation_status := CASE 
                        WHEN RANDOM() < 0.6 THEN 'paid'
                        WHEN RANDOM() < 0.8 THEN 'completed'
                        WHEN RANDOM() < 0.95 THEN 'in_progress'
                        ELSE 'confirmed'
                    END;
                    
                    -- CORRECCIÓN: Calcular horas correctamente
                    calculated_start_time := get_valid_business_time(current_date_iter, 8, 19);
                    calculated_end_time := calculate_valid_end_time(calculated_start_time, service_rec.duration_minutes, 21);
                    
                    INSERT INTO reservations (
                        barber_id, station_id, service_id, client_name, client_phone,
                        start_time, end_time, status, service_price, notes
                    ) VALUES (
                        barber_rec.id, barber_rec.station_id, service_rec.id, client_name_val,
                        '9' || LPAD((200000000 + FLOOR(RANDOM() * 799999999))::TEXT, 9, '0'),
                        calculated_start_time,
                        calculated_end_time,
                        reservation_status, service_price_val, 'Reserva de esta semana - ' || current_date_iter::TEXT
                    ) RETURNING id INTO reservation_id_val;
                    
                    -- Solo crear venta si está pagada o completada
                    IF reservation_status IN ('paid', 'completed') THEN
                        products_amount_val := 0;
                        
                        -- 70% probabilidad de productos adicionales
                        IF RANDOM() < 0.7 THEN
                            FOR j IN 1..(1 + FLOOR(RANDOM() * 2)) LOOP
                                SELECT * INTO product_rec FROM products WHERE is_active = true AND stock_quantity > 3 ORDER BY RANDOM() LIMIT 1;
                                
                                INSERT INTO reservation_products (
                                    reservation_id, product_id, quantity, price_at_reservation
                                ) VALUES (
                                    reservation_id_val, product_rec.id, 1, product_rec.price
                                );
                                
                                products_amount_val := products_amount_val + product_rec.price;
                            END LOOP;
                        END IF;
                        
                        total_amount_val := service_price_val + products_amount_val;
                        
                        INSERT INTO sales (
                            reservation_id, barber_id, customer_name, service_amount, products_amount,
                            total_amount, payment_method, sale_date
                        ) VALUES (
                            reservation_id_val, barber_rec.id, client_name_val, service_price_val,
                            products_amount_val, total_amount_val,
                            CASE WHEN RANDOM() < 0.5 THEN 'cash' WHEN RANDOM() < 0.8 THEN 'card' ELSE 'transfer' END,
                            calculated_start_time + INTERVAL '1 minute' * service_rec.duration_minutes
                        ) RETURNING id INTO sale_id_val;
                        
                        INSERT INTO sale_items (
                            sale_id, item_type, item_id, item_name, quantity, unit_price, total_price
                        ) VALUES (
                            sale_id_val, 'service', service_rec.id, service_rec.name, 1, service_price_val, service_price_val
                        );
                        
                        IF products_amount_val > 0 THEN
                            INSERT INTO sale_items (sale_id, item_type, item_id, item_name, quantity, unit_price, total_price)
                            SELECT 
                                sale_id_val, 'product', rp.product_id, p.name, rp.quantity, 
                                rp.price_at_reservation, (rp.quantity * rp.price_at_reservation)
                            FROM reservation_products rp
                            JOIN products p ON rp.product_id = p.id
                            WHERE rp.reservation_id = reservation_id_val;
                        END IF;
                    END IF;
                    
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- =====================================================================================================================
-- DATOS DE PRUEBA: PRÓXIMA SEMANA (RESERVAS FUTURAS) (CORREGIDO CON HORAS VÁLIDAS)
-- =====================================================================================================================

DO $$
DECLARE
    next_week_start DATE := get_week_start(1);
    future_date_iter DATE;
    day_counter INT;
    barber_rec RECORD;
    service_rec RECORD;
    product_rec RECORD;
    reservation_id_val INT;
    random_clients TEXT[] := ARRAY[
        'Pedro Futura Reserva', 'Laura Próxima Cita', 'Diego Semana Que Viene', 'Sofía Reserva Futura',
        'Andrés Cita Próxima', 'Valeria Cliente Futura', 'Roberto Próximo Corte', 'Isabella Reserva Programada',
        'Sebastián Cita Futura', 'Camila Próxima Semana', 'Fernando Reserva Pendiente', 'Lucía Cliente Próxima'
    ];
    client_name_val TEXT;
    service_price_val REAL;
    reservation_status TEXT;
    calculated_start_time TIMESTAMP WITH TIME ZONE;
    calculated_end_time TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Próxima semana completa (7 días)
    FOR day_counter IN 0..6 LOOP
        future_date_iter := next_week_start + INTERVAL '1 day' * day_counter;
        
        -- Solo días laborales (no domingos)
        IF EXTRACT(DOW FROM future_date_iter) NOT IN (0) THEN
            
            FOR barber_rec IN SELECT * FROM barbers WHERE is_active = true ORDER BY id LOOP
                
                -- 1-4 reservas futuras por barbero por día
                FOR i IN 1..(1 + FLOOR(RANDOM() * 4)) LOOP
                    
                    client_name_val := random_clients[1 + FLOOR(RANDOM() * array_length(random_clients, 1))];
                    SELECT * INTO service_rec FROM services WHERE is_active = true AND duration_minutes <= 90 ORDER BY RANDOM() LIMIT 1;
                    service_price_val := service_rec.price;
                    
                    -- Solo reservas pendientes o confirmadas para el futuro
                    reservation_status := CASE WHEN RANDOM() < 0.75 THEN 'pending' ELSE 'confirmed' END;
                    
                    -- CORRECCIÓN: Calcular horas correctamente
                    calculated_start_time := get_valid_business_time(future_date_iter, 8, 19);
                    calculated_end_time := calculate_valid_end_time(calculated_start_time, service_rec.duration_minutes, 21);
                    
                    INSERT INTO reservations (
                        barber_id, station_id, service_id, client_name, client_phone,
                        start_time, end_time, status, service_price, notes
                    ) VALUES (
                        barber_rec.id, barber_rec.station_id, service_rec.id, client_name_val,
                        '9' || LPAD((300000000 + FLOOR(RANDOM() * 699999999))::TEXT, 9, '0'),
                        calculated_start_time,
                        calculated_end_time,
                        reservation_status, service_price_val, 'Reserva para la próxima semana - ' || future_date_iter::TEXT
                    ) RETURNING id INTO reservation_id_val;
                    
                    -- 25% de reservas futuras pueden tener productos pre-seleccionados
                    IF RANDOM() < 0.25 THEN
                        SELECT * INTO product_rec FROM products WHERE is_active = true AND category IN ('Cuidado Capilar', 'Cuidado Facial') ORDER BY RANDOM() LIMIT 1;
                        INSERT INTO reservation_products (
                            reservation_id, product_id, quantity, price_at_reservation
                        ) VALUES (
                            reservation_id_val, product_rec.id, 1, product_rec.price
                        );
                    END IF;
                    
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- =====================================================================================================================
-- LIMPIAR FUNCIONES AUXILIARES TEMPORALES
-- =====================================================================================================================

DROP FUNCTION IF EXISTS get_valid_business_time(DATE, INT, INT);
DROP FUNCTION IF EXISTS calculate_valid_end_time(TIMESTAMP WITH TIME ZONE, INT, INT);

-- =====================================================================================================================
-- VERIFICACIÓN FINAL DE RESERVAS
-- =====================================================================================================================

SELECT '========================================' AS resultado;
SELECT '✅ VERIFICACIÓN DE HORAS DE RESERVAS' AS resultado;
SELECT '========================================' AS resultado;

-- Verificar reservas con horarios incorrectos
SELECT 
    'Reservas fuera de horario laboral:' AS tipo,
    COUNT(*)::TEXT AS cantidad
FROM reservations 
WHERE 
    EXTRACT(HOUR FROM start_time) < 8 
    OR EXTRACT(HOUR FROM start_time) > 21 
    OR EXTRACT(HOUR FROM end_time) > 21;

-- Verificar reservas con duración excesiva
SELECT 
    'Reservas con duración > 90 min:' AS tipo,
    COUNT(*)::TEXT AS cantidad
FROM reservations 
WHERE 
    EXTRACT(EPOCH FROM (end_time - start_time))/60 > 90;

-- Verificar reservas con end_time antes de start_time
SELECT 
    'Reservas con end_time <= start_time:' AS tipo,
    COUNT(*)::TEXT AS cantidad
FROM reservations 
WHERE end_time <= start_time;

SELECT '========================================' AS resultado;


-- =====================================================================================================================
-- DATOS DE PRUEBA: VENTAS SIN RESERVA (WALK-INS) (Corregido)
-- =====================================================================================================================

DO $$
DECLARE
    walk_in_date DATE;
    barber_rec RECORD;
    service_rec RECORD;
    product_rec RECORD;
    sale_id_val INT;
    walk_in_clients TEXT[] := ARRAY[
        'Cliente Sin Cita González', 'Walk-in García Express', 'Sin Reserva López Rápido', 'Espontáneo Martínez',
        'Cliente Directo Torres', 'Sin Cita Rodríguez Urgente', 'Walk-in Castro Expreso', 'Cliente Express Vargas',
        'Sin Reserva Herrera', 'Walk-in Morales Directo', 'Cliente Rápido Jiménez', 'Express Sánchez Sin Cita'
    ];
    client_name_val TEXT;
    service_price_val REAL;
    total_amount_val REAL;
    products_amount_val REAL;
    payment_methods TEXT[] := ARRAY['cash', 'card', 'transfer'];
BEGIN
    -- Walk-ins distribuidos en los últimos 45 días
    FOR i IN 0..44 LOOP
        walk_in_date := CURRENT_DATE - INTERVAL '45 days' + INTERVAL '1 day' * i;
        
        -- Solo días laborales (no domingos)
        IF EXTRACT(DOW FROM walk_in_date) NOT IN (0) THEN
            -- 1-3 walk-ins por día
            FOR j IN 1..(1 + FLOOR(RANDOM() * 3)) LOOP
                
                client_name_val := walk_in_clients[1 + FLOOR(RANDOM() * array_length(walk_in_clients, 1))];
                SELECT * INTO barber_rec FROM barbers WHERE is_active = true ORDER BY RANDOM() LIMIT 1;
                
                -- Walk-ins prefieren servicios rápidos
                SELECT * INTO service_rec FROM services 
                WHERE is_active = true AND duration_minutes <= 45 
                ORDER BY RANDOM() LIMIT 1;
                
                service_price_val := service_rec.price;
                products_amount_val := 0;
                
                -- 40% probabilidad de productos en walk-ins (menos que con reserva)
                IF RANDOM() < 0.4 THEN
                    SELECT price INTO products_amount_val 
                    FROM products 
                    WHERE is_active = true AND stock_quantity > 2 AND category IN ('Bebidas', 'Cuidado Capilar')
                    ORDER BY RANDOM() LIMIT 1;
                    
                    IF products_amount_val IS NULL THEN
                        products_amount_val := 0;
                    END IF;
                END IF;
                
                total_amount_val := service_price_val + COALESCE(products_amount_val, 0);
                
                -- Venta directa sin reserva
                INSERT INTO sales (
                    reservation_id, barber_id, customer_name, service_amount, products_amount,
                    total_amount, payment_method, sale_date
                ) VALUES (
                    NULL, barber_rec.id, client_name_val, service_price_val,
                    COALESCE(products_amount_val, 0), total_amount_val,
                    payment_methods[1 + FLOOR(RANDOM() * array_length(payment_methods, 1))],
                    get_random_time_in_day(walk_in_date, 10, 17)
                ) RETURNING id INTO sale_id_val;
                
                -- Sale items para servicio
                INSERT INTO sale_items (
                    sale_id, item_type, item_id, item_name, quantity, unit_price, total_price
                ) VALUES (
                    sale_id_val, 'service', service_rec.id, service_rec.name, 1, service_price_val, service_price_val
                );
                
                -- Sale item para producto si existe
                IF products_amount_val > 0 THEN
                    SELECT * INTO product_rec 
                    FROM products 
                    WHERE is_active = true AND stock_quantity > 2 AND price = products_amount_val
                    LIMIT 1;
                    
                    IF FOUND THEN
                        INSERT INTO sale_items (
                            sale_id, item_type, item_id, item_name, quantity, unit_price, total_price
                        ) VALUES (
                            sale_id_val, 'product', product_rec.id, product_rec.name, 1, products_amount_val, products_amount_val
                        );
                    END IF;
                END IF;
                
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- =====================================================================================================================
-- DATOS DE PRUEBA: ADELANTOS DE SUELDO
-- =====================================================================================================================

INSERT INTO barber_advances (barber_id, amount, date, notes) VALUES
-- Adelantos del mes actual
(1, 150.00, CURRENT_DATE - INTERVAL '10 days', 'Adelanto por gastos médicos familiares'),
(1, 80.00, CURRENT_DATE - INTERVAL '3 days', 'Adelanto adicional para medicinas'),
(2, 200.00, CURRENT_DATE - INTERVAL '15 days', 'Adelanto para reparaciones del hogar'),
(2, 120.00, CURRENT_DATE - INTERVAL '5 days', 'Adelanto por emergencia'),
(3, 100.00, CURRENT_DATE - INTERVAL '8 days', 'Adelanto por emergencia familiar'),
(4, 180.00, CURRENT_DATE - INTERVAL '12 days', 'Adelanto para curso de capacitación'),
(4, 90.00, CURRENT_DATE - INTERVAL '2 days', 'Adelanto para materiales de estudio'),
(5, 75.00, CURRENT_DATE - INTERVAL '6 days', 'Adelanto para transporte'),

-- Adelantos del mes pasado
(1, 100.00, CURRENT_DATE - INTERVAL '25 days', 'Adelanto mes pasado - gastos personales'),
(2, 150.00, CURRENT_DATE - INTERVAL '30 days', 'Adelanto mes pasado - emergencia'),
(3, 120.00, CURRENT_DATE - INTERVAL '28 days', 'Adelanto mes pasado - reparaciones'),
(4, 80.00, CURRENT_DATE - INTERVAL '35 days', 'Adelanto mes pasado - estudios'),
(5, 90.00, CURRENT_DATE - INTERVAL '32 days', 'Adelanto mes pasado - familia');

-- =====================================================================================================================
-- MOVIMIENTOS DE INVENTARIO ADICIONALES
-- =====================================================================================================================

-- Reposiciones recientes de stock
INSERT INTO inventory_movements (product_id, movement_type, quantity, reference_type, notes) VALUES
-- Reposiciones esta semana
(101, 'in', 30, 'purchase', 'Reposición semanal - Gel Fijador Extra Fuerte'),
(102, 'in', 25, 'purchase', 'Reposición semanal - Cera Modeladora'),
(103, 'in', 45, 'purchase', 'Reposición urgente - Shampoo Anticaída (stock bajo)'),
(201, 'in', 20, 'purchase', 'Reposición - Bálsamo para Barba Premium'),
(301, 'in', 100, 'purchase', 'Reposición - Agua Mineral'),
(302, 'in', 60, 'purchase', 'Reposición - Refrescos Cola'),
(303, 'in', 40, 'purchase', 'Reposición - Café Americano'),

-- Reposiciones mes pasado
(104, 'in', 35, 'purchase', 'Reposición mes pasado - Acondicionador Nutritivo'),
(105, 'in', 25, 'purchase', 'Reposición mes pasado - Pomada Vintage'),
(202, 'in', 30, 'purchase', 'Reposición mes pasado - Aceite para Barba'),
(304, 'in', 35, 'purchase', 'Reposición mes pasado - Café Espresso'),
(401, 'in', 15, 'purchase', 'Reposición mes pasado - Toallas Premium'),
(402, 'in', 20, 'purchase', 'Reposición mes pasado - Peines Profesionales'),

-- Ajustes de inventario
(101, 'out', 3, 'adjustment', 'Producto dañado en transporte'),
(301, 'out', 8, 'adjustment', 'Botellas rotas en almacén'),
(302, 'out', 5, 'adjustment', 'Bebidas próximas a vencer'),
(105, 'out', 2, 'adjustment', 'Envases dañados - Pomada Vintage'),
(403, 'out', 1, 'adjustment', 'Cepillo defectuoso'),

-- Compras especiales
(106, 'in', 20, 'purchase', 'Compra adicional - Spray Texturizante'),
(203, 'in', 15, 'purchase', 'Compra adicional - Aftershave Clásico'),
(305, 'in', 30, 'purchase', 'Compra especial - Jugo Natural Naranja'),
(404, 'in', 8, 'purchase', 'Compra adicional - Kit Afeitado'),
(405, 'in', 25, 'purchase', 'Nueva colección - Gorras Barbería');

-- =====================================================================================================================
-- LIMPIAR FUNCIONES AUXILIARES
-- =====================================================================================================================

DROP FUNCTION IF EXISTS get_week_start(INT);
DROP FUNCTION IF EXISTS get_random_time_in_day(DATE, INT, INT);

-- =====================================================================================================================
-- RESUMEN FINAL Y ESTADÍSTICAS
-- =====================================================================================================================

SELECT '========================================' AS resultado;
SELECT '✅ BASE DE DATOS COMPLETA INICIALIZADA' AS resultado;
SELECT '========================================' AS resultado;

-- Estadísticas de estructura
SELECT 'ESTRUCTURA CREADA:' AS categoria, '' AS detalle, '' AS cantidad;
SELECT '📋 Tablas principales:', '12 tablas', '' AS cantidad;
SELECT '👥 Usuarios del sistema:', COUNT(*)::TEXT, 'usuarios' AS cantidad FROM users;
SELECT '🪑 Estaciones configuradas:', COUNT(*)::TEXT, 'estaciones' AS cantidad FROM stations WHERE is_active = true;
SELECT '💇 Barberos activos:', COUNT(*)::TEXT, 'barberos' AS cantidad FROM barbers WHERE is_active = true;
SELECT '✂️ Servicios disponibles:', COUNT(*)::TEXT, 'servicios' AS cantidad FROM services WHERE is_active = true;
SELECT '🧴 Productos en catálogo:', COUNT(*)::TEXT, 'productos' AS cantidad FROM products WHERE is_active = true;

-- Estadísticas de datos de prueba
SELECT '' AS categoria, '' AS detalle, '' AS cantidad;
SELECT 'DATOS DE PRUEBA GENERADOS:' AS categoria, '' AS detalle, '' AS cantidad;
SELECT '📅 Total reservas creadas:', COUNT(*)::TEXT, 'reservas' AS cantidad FROM reservations;
SELECT '💰 Total ventas registradas:', COUNT(*)::TEXT, 'ventas' AS cantidad FROM sales;
SELECT '🛒 Items vendidos:', COUNT(*)::TEXT, 'items' AS cantidad FROM sale_items;
SELECT '📦 Movimientos inventario:', COUNT(*)::TEXT, 'movimientos' AS cantidad FROM inventory_movements;

-- Estadísticas por período
SELECT '' AS categoria, '' AS detalle, '' AS cantidad;
SELECT 'DISTRIBUCIÓN TEMPORAL:' AS categoria, '' AS detalle, '' AS cantidad;
SELECT '📊 Datos históricos (3 meses):', 
    COUNT(*)::TEXT, 'reservas' AS cantidad 
FROM reservations 
WHERE start_time < CURRENT_DATE - INTERVAL '7 days';

SELECT '📊 Reservas esta semana:', 
    COUNT(*)::TEXT, 'reservas' AS cantidad 
FROM reservations 
WHERE start_time >= DATE_TRUNC('week', CURRENT_DATE) 
AND start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week';

SELECT '📊 Reservas próxima semana:', 
    COUNT(*)::TEXT, 'reservas' AS cantidad 
FROM reservations 
WHERE start_time >= DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week' 
AND start_time < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '2 weeks';

-- Estadísticas financieras
SELECT '' AS categoria, '' AS detalle, '' AS cantidad;
SELECT 'RESUMEN FINANCIERO:' AS categoria, '' AS detalle, '' AS cantidad;
SELECT '💵 Total facturado:', 
    'S/ ' || COALESCE(SUM(total_amount), 0)::NUMERIC(10,2)::TEXT, 'soles' AS cantidad 
FROM sales;

SELECT '🔧 Ingresos por servicios:', 
    'S/ ' || COALESCE(SUM(service_amount), 0)::NUMERIC(10,2)::TEXT, 'soles' AS cantidad 
FROM sales;

SELECT '🧴 Ingresos por productos:', 
    'S/ ' || COALESCE(SUM(products_amount), 0)::NUMERIC(10,2)::TEXT, 'soles' AS cantidad 
FROM sales;

SELECT '💰 Adelantos registrados:', 
    'S/ ' || COALESCE(SUM(amount), 0)::NUMERIC(10,2)::TEXT, 'soles' AS cantidad 
FROM barber_advances;

-- Estados de reservas
SELECT '' AS categoria, '' AS detalle, '' AS cantidad;
SELECT 'ESTADOS DE RESERVAS:' AS categoria, '' AS detalle, '' AS cantidad;
SELECT '✅ Pagadas:', COUNT(*)::TEXT, 'reservas' AS cantidad FROM reservations WHERE status = 'paid';
SELECT '⏳ Pendientes:', COUNT(*)::TEXT, 'reservas' AS cantidad FROM reservations WHERE status = 'pending';
SELECT '🔄 En progreso:', COUNT(*)::TEXT, 'reservas' AS cantidad FROM reservations WHERE status = 'in_progress';
SELECT '✔️ Completadas:', COUNT(*)::TEXT, 'reservas' AS cantidad FROM reservations WHERE status = 'completed';
SELECT '📋 Confirmadas:', COUNT(*)::TEXT, 'reservas' AS cantidad FROM reservations WHERE status = 'confirmed';
SELECT '❌ Canceladas:', COUNT(*)::TEXT, 'reservas' AS cantidad FROM reservations WHERE status = 'cancelled';

-- Inventario
SELECT '' AS categoria, '' AS detalle, '' AS cantidad;
SELECT 'ESTADO DE INVENTARIO:' AS categoria, '' AS detalle, '' AS cantidad;
SELECT '⚠️ Productos con stock bajo:', 
    COUNT(*)::TEXT, 'productos' AS cantidad 
FROM products 
WHERE stock_quantity <= min_stock_level AND is_active = true;

SELECT '📈 Total unidades en stock:', 
    COALESCE(SUM(stock_quantity), 0)::TEXT, 'unidades' AS cantidad 
FROM products 
WHERE is_active = true;

SELECT '💼 Valor total inventario:', 
    'S/ ' || COALESCE(SUM(stock_quantity * price), 0)::NUMERIC(10,2)::TEXT, 'soles' AS cantidad 
FROM products 
WHERE is_active = true;


SELECT '========================================' AS resultado;
SELECT '🎉 SISTEMA LISTO PARA USAR' AS resultado;
SELECT '========================================' AS resultado;
SELECT 'ℹ️  Usuarios de prueba creados con contraseñas hash' AS resultado;
SELECT 'ℹ️  Datos distribuidos en 3 meses + semana actual + próxima semana' AS resultado;
SELECT 'ℹ️  Inventario configurado con stock realista' AS resultado;

SELECT 'ℹ️  Triggers de inventario activados' AS resultado;
SELECT '========================================' AS resultado;
