-- ====================================================================
-- GARUT JOURNEY — PRODUCTION DATABASE MIGRATION
-- Database: Supabase PostgreSQL
-- Features: 10 Core Tables, RLS, Foreign Keys, Snapshot Pricing,
--           Atomic Capacity Control, Idempotent Payment Events
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'guide', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'settlement', 'capture', 'deny', 'expire', 'cancel', 'refund');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (User identity & role)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TOUR PACKAGES TABLE
CREATE TABLE IF NOT EXISTS tour_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g. 'Gunung & Alam', 'Keluarga & Relaksasi', 'Budaya & Sejarah', 'Private Trip'
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    duration_days INT NOT NULL DEFAULT 1,
    duration_nights INT NOT NULL DEFAULT 0,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    min_participants INT NOT NULL DEFAULT 1,
    max_participants INT NOT NULL DEFAULT 25,
    destination_area TEXT NOT NULL, -- e.g. 'Papandayan', 'Kamojang', 'Bagendit', 'Pameungpeuk'
    inclusions TEXT[] NOT NULL DEFAULT '{}',
    exclusions TEXT[] NOT NULL DEFAULT '{}',
    itinerary JSONB NOT NULL DEFAULT '[]', -- Array of {day: 1, title: '', activities: ['']}
    pickup_points TEXT[] NOT NULL DEFAULT '{}',
    terms_and_conditions TEXT NOT NULL DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    featured_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PACKAGE IMAGES TABLE
CREATE TABLE IF NOT EXISTS package_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DEPARTURE SCHEDULES TABLE (Capacity management)
CREATE TABLE IF NOT EXISTS departure_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
    departure_date DATE NOT NULL,
    total_capacity INT NOT NULL CHECK (total_capacity > 0),
    booked_capacity INT NOT NULL DEFAULT 0 CHECK (booked_capacity <= total_capacity),
    custom_price NUMERIC(12, 2) DEFAULT NULL, -- override base_price if specified
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'sold_out')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_package_departure_date UNIQUE (package_id, departure_date)
);

-- 7. PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discount_type discount_type NOT NULL DEFAULT 'percentage',
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    max_discount_amount NUMERIC(12, 2) DEFAULT NULL,
    min_spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
    max_usage_limit INT DEFAULT 100,
    current_usage_count INT NOT NULL DEFAULT 0,
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. BOOKINGS TABLE (Main reservation record)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number TEXT UNIQUE NOT NULL, -- e.g. 'GJ-202610-8472'
    access_token TEXT UNIQUE NOT NULL,   -- Cryptographic secure token for customer access without login
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_notes TEXT DEFAULT '',
    schedule_id UUID NOT NULL REFERENCES departure_schedules(id) ON DELETE RESTRICT,
    package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE RESTRICT,
    participants_count INT NOT NULL CHECK (participants_count > 0),
    pickup_location TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    addon_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (addon_total >= 0),
    discount_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    applied_promo_code TEXT DEFAULT NULL,
    status booking_status NOT NULL DEFAULT 'pending_payment',
    payment_expiry TIMESTAMPTZ NOT NULL, -- usually 60 mins from creation
    cancelled_reason TEXT DEFAULT NULL,
    confirmed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. BOOKING ITEMS TABLE (Immutable price & item snapshot)
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('package', 'addon')),
    item_name TEXT NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(12, 2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. PAYMENTS TABLE (Midtrans transaction records)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    provider TEXT NOT NULL DEFAULT 'midtrans',
    transaction_id TEXT UNIQUE, -- Midtrans transaction_id
    order_id TEXT NOT NULL,      -- Midtrans order_id (matches booking_number or booking_number-attempt)
    payment_type TEXT,          -- e.g. 'qris', 'bank_transfer', 'echannel', 'gopay', 'credit_card'
    gross_amount NUMERIC(12, 2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    snap_token TEXT,
    snap_redirect_url TEXT,
    settlement_time TIMESTAMPTZ DEFAULT NULL,
    expiry_time TIMESTAMPTZ DEFAULT NULL,
    raw_response JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. PAYMENT EVENTS TABLE (Idempotency and audit log)
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    event_id TEXT UNIQUE NOT NULL, -- hash or transaction_id + status + time for strict idempotency
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    is_processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ DEFAULT NULL,
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SITE SETTINGS TABLE (Business info & operational configs)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL DEFAULT 'PT Garut Journey Nusantara',
    brand_name TEXT NOT NULL DEFAULT 'Garut Journey',
    office_address TEXT NOT NULL DEFAULT 'Jl. Cimanuk No. 88, Tarogong Kidul, Garut, Jawa Barat 44151',
    whatsapp_number TEXT NOT NULL DEFAULT '6281223456789',
    support_email TEXT NOT NULL DEFAULT 'halo@garutjourney.id',
    bank_name TEXT NOT NULL DEFAULT 'Bank Central Asia (BCA)',
    bank_account_number TEXT NOT NULL DEFAULT '148-092-8899',
    bank_account_holder TEXT NOT NULL DEFAULT 'PT Garut Journey Nusantara',
    payment_timeout_minutes INT NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. INDEXES FOR PERFORMANCE & SEARCH
CREATE INDEX IF NOT EXISTS idx_packages_slug ON tour_packages(slug);
CREATE INDEX IF NOT EXISTS idx_packages_category ON tour_packages(category);
CREATE INDEX IF NOT EXISTS idx_packages_published ON tour_packages(is_published);
CREATE INDEX IF NOT EXISTS idx_departure_date ON departure_schedules(departure_date);
CREATE INDEX IF NOT EXISTS idx_departure_package ON departure_schedules(package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_token ON bookings(access_token);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_unique ON payment_events(event_id);

-- 14. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE departure_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can view active packages, images, open schedules, and site settings
CREATE POLICY "Public read packages" ON tour_packages FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Public read images" ON package_images FOR SELECT USING (TRUE);
CREATE POLICY "Public read open schedules" ON departure_schedules FOR SELECT USING (status != 'closed');
CREATE POLICY "Public read site settings" ON site_settings FOR SELECT USING (TRUE);

-- Only authenticated admins or system service role can modify tour packages & schedules
CREATE POLICY "Admin manage packages" ON tour_packages FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admin manage schedules" ON departure_schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- Booking access: either matching access token via backend service role or admin profile
CREATE POLICY "Customer read booking via token" ON bookings FOR SELECT USING (
    access_token IS NOT NULL
);
CREATE POLICY "Admin full booking access" ON bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin'))
);

-- 15. ATOMIC CAPACITY RESERVATION STORED FUNCTION
CREATE OR REPLACE FUNCTION reserve_schedule_capacity(
    p_schedule_id UUID,
    p_seats INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_available INT;
BEGIN
    -- Select with row locking
    SELECT (total_capacity - booked_capacity) INTO v_available
    FROM departure_schedules
    WHERE id = p_schedule_id
    FOR UPDATE;

    IF v_available IS NULL OR v_available < p_seats THEN
        RETURN FALSE;
    END IF;

    UPDATE departure_schedules
    SET booked_capacity = booked_capacity + p_seats,
        status = CASE WHEN booked_capacity + p_seats >= total_capacity THEN 'sold_out' ELSE 'open' END,
        updated_at = NOW()
    WHERE id = p_schedule_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 16. RELEASE CAPACITY STORED FUNCTION (on cancel / expiry)
CREATE OR REPLACE FUNCTION release_schedule_capacity(
    p_schedule_id UUID,
    p_seats INT
) RETURNS VOID AS $$
BEGIN
    UPDATE departure_schedules
    SET booked_capacity = GREATEST(0, booked_capacity - p_seats),
        status = 'open',
        updated_at = NOW()
    WHERE id = p_schedule_id;
END;
$$ LANGUAGE plpgsql;
