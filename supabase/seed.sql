-- ====================================================================
-- GARUT JOURNEY — SEED DATA
-- Comprehensive initial catalog, departure dates, promotions, and settings
-- ====================================================================

-- 1. SITE SETTINGS SEED
INSERT INTO site_settings (
    company_name,
    brand_name,
    office_address,
    whatsapp_number,
    support_email,
    bank_name,
    bank_account_number,
    bank_account_holder,
    payment_timeout_minutes
) VALUES (
    'PT Garut Journey Nusantara',
    'Garut Journey',
    'Jl. Cimanuk No. 88, Tarogong Kidul, Garut, Jawa Barat 44151',
    '6281223456789',
    'halo@garutjourney.id',
    'Bank Central Asia (BCA)',
    '148-092-8899',
    'PT Garut Journey Nusantara',
    60
) ON CONFLICT DO NOTHING;

-- 2. PROMOTIONS SEED
INSERT INTO promotions (
    code,
    description,
    discount_type,
    discount_value,
    max_discount_amount,
    min_spend,
    max_usage_limit,
    current_usage_count,
    starts_at,
    expires_at,
    is_active
) VALUES 
('GARUTASRI10', 'Diskon 10% Spesial Pembukaan Garut Journey', 'percentage', 10.00, 150000, 300000, 200, 14, NOW() - INTERVAL '5 days', NOW() + INTERVAL '90 days', TRUE),
('EXPLOREGARUT', 'Potongan Rp 50.000 untuk Semua Paket Wisata', 'fixed', 50000, NULL, 400000, 500, 32, NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', TRUE),
('FAMILYTRIP', 'Diskon Rombongan Rp 100.000 (Min Transaksi 1 Juta)', 'fixed', 100000, NULL, 1000000, 100, 8, NOW() - INTERVAL '2 days', NOW() + INTERVAL '45 days', TRUE)
ON CONFLICT (code) DO NOTHING;
