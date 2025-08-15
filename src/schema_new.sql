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
    email TEXT UNIQUE,
    phone TEXT,
    specialty TEXT,
    photo_url TEXT,
    station_id INTEGER,
    base_salary REAL DEFAULT 1250, -- Corregido: era 1300
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (station_id) REFERENCES stations (id)
);

-- ===== SEPARACIÓN: SERVICIOS Y PRODUCTOS =====
-- Solo servicios de corte (sin stock)
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solo productos (con stock)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    category TEXT, -- 'cuidado', 'bebidas', 'accesorios'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===== RESERVAS =====
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'paid', 'cancelled'
    service_price REAL NOT NULL, -- Precio del servicio al momento de reservar
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (barber_id) REFERENCES barbers (id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations (id),
    FOREIGN KEY (service_id) REFERENCES services (id)
);

-- ===== PRODUCTOS ADICIONALES EN RESERVAS =====
CREATE TABLE IF NOT EXISTS reservation_products (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_reservation REAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (reservation_id) REFERENCES reservations (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- ===== VENTAS =====
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER UNIQUE, -- Una venta por reserva
    barber_id INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    service_amount REAL NOT NULL, -- Solo monto de servicios (para comisiones)
    products_amount REAL NOT NULL DEFAULT 0, -- Solo monto de productos
    total_amount REAL NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (reservation_id) REFERENCES reservations (id),
    FOREIGN KEY (barber_id) REFERENCES barbers (id)
);

-- ===== ITEMS DE VENTA (DETALLE) =====
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL,
    item_type TEXT NOT NULL, -- 'service' o 'product'
    item_id INTEGER NOT NULL, -- ID del servicio o producto
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    -- Para comisiones: solo items tipo 'service' cuentan para barberos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (sale_id) REFERENCES sales (id) ON DELETE CASCADE
);

-- ===== MOVIMIENTOS DE INVENTARIO =====
CREATE TABLE IF NOT EXISTS inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL, -- 'in' (entrada), 'out' (salida)
    quantity INTEGER NOT NULL,
    reference_type TEXT, -- 'sale', 'adjustment', 'purchase'
    reference_id INTEGER, -- ID de la venta, ajuste, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- ===== CÁLCULO DE COMISIONES =====
CREATE TABLE IF NOT EXISTS barber_commissions (
    id SERIAL PRIMARY KEY,
    barber_id INTEGER NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary REAL NOT NULL,
    services_total REAL NOT NULL,
    commission_amount REAL NOT NULL,
    total_payment REAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (barber_id) REFERENCES barbers (id),
    UNIQUE(barber_id, period_start, period_end)
);

-- ===== SETTINGS =====
CREATE TABLE IF NOT EXISTS settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT,
    description TEXT
);

-- ===== TRIGGERS PARA ACTUALIZAR STOCK =====
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.item_type = 'product' THEN
        -- Reducir stock cuando se vende
        UPDATE products 
        SET stock_quantity = stock_quantity - NEW.quantity
        WHERE id = NEW.item_id;
        
        -- Crear movimiento de inventario
        INSERT INTO inventory_movements (
            product_id, movement_type, quantity, 
            reference_type, reference_id
        ) VALUES (
            NEW.item_id, 'out', NEW.quantity, 
            'sale', NEW.sale_id
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
    AFTER INSERT ON sale_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- ===== VISTA PARA REPORTES DE COMISIONES =====
CREATE OR REPLACE VIEW barber_sales_summary AS
SELECT 
    b.id as barber_id,
    b.name as barber_name,
    b.base_salary,
    COALESCE(SUM(s.service_amount), 0) as total_services,
    CASE
        WHEN COALESCE(SUM(s.service_amount), 0) > (b.base_salary * 2)
        THEN COALESCE(SUM(s.service_amount), 0) / 2
        ELSE b.base_salary
    END as commission_payment,
    COUNT(s.id) as total_sales
FROM barbers b
LEFT JOIN sales s ON b.id = s.barber_id 
    AND s.sale_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY b.id, b.name, b.base_salary;

-- ===== ÍNDICES PARA PERFORMANCE =====
CREATE INDEX idx_reservations_barber_date ON reservations(barber_id, start_time);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_barber ON sales(barber_id);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);

-- ===== DATOS DE EJEMPLO =====
INSERT INTO settings (setting_key, setting_value, description) VALUES 
('commission_threshold', '2500', 'Monto mínimo para activar comisión del 50%'),
('default_service_duration', '30', 'Duración por defecto de servicios en minutos'),
('low_stock_notification', 'true', 'Notificar cuando hay poco stock');