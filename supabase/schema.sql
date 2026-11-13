-- ============================================================================
-- FMK Mobile Website - Complete Supabase PostgreSQL Schema, Seed Data & RLS
-- Company: FMK | Owner: Faria (FARIA)
-- Run this entire script in your Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Store Settings (Editable Owner & Contact Info)
CREATE TABLE IF NOT EXISTS store_settings (
    id               INT PRIMARY KEY DEFAULT 1,
    website_name     VARCHAR(120) NOT NULL,
    company_name     VARCHAR(80)  NOT NULL,
    owner_name       VARCHAR(80)  NOT NULL,
    contact_number   VARCHAR(40)  NOT NULL,
    business_address TEXT         NOT NULL,
    updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

-- 2. iPhone Products (iPhone 13 to iPhone 17)
CREATE TABLE IF NOT EXISTS products (
    id              VARCHAR(40)   PRIMARY KEY,
    model_name      VARCHAR(80)   NOT NULL,
    series_label    VARCHAR(100)  NOT NULL,
    category        VARCHAR(40)   NOT NULL, -- 'Latest Gen', 'Pro Series', 'Standard'
    base_price      DECIMAL(10,2) NOT NULL,
    release_year    INT           NOT NULL,
    tagline         VARCHAR(255)  NOT NULL,
    description     TEXT          NOT NULL,
    chip_spec       VARCHAR(120)  NOT NULL,
    display_spec    VARCHAR(120)  NOT NULL,
    camera_spec     VARCHAR(120)  NOT NULL,
    battery_spec    VARCHAR(120)  NOT NULL,
    material_spec   VARCHAR(120)  NOT NULL,
    camera_count    SMALLINT      NOT NULL DEFAULT 3,
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- 3. Storage Options per Product
CREATE TABLE IF NOT EXISTS product_storage_options (
    id              SERIAL PRIMARY KEY,
    product_id      VARCHAR(40)   NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    storage_label   VARCHAR(20)   NOT NULL,
    price_delta     DECIMAL(10,2) NOT NULL DEFAULT 0.00
);

-- 4. Available Color Finishes per Product
CREATE TABLE IF NOT EXISTS product_colors (
    id              SERIAL PRIMARY KEY,
    product_id      VARCHAR(40) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color_name      VARCHAR(60) NOT NULL,
    hex_code        VARCHAR(10) NOT NULL,
    frame_hex       VARCHAR(10) NOT NULL,
    back_hex        VARCHAR(10) NOT NULL,
    accent_hex      VARCHAR(10) NOT NULL
);

-- 5. Mobile Parts & 3D Technology Components (All 11 Parts)
CREATE TABLE IF NOT EXISTS mobile_parts (
    id                   VARCHAR(40)  PRIMARY KEY,
    part_index           VARCHAR(5)   NOT NULL,
    part_name            VARCHAR(120) NOT NULL,
    subsystem            VARCHAR(100) NOT NULL,
    short_description    TEXT         NOT NULL,
    function_explanation TEXT         NOT NULL,
    engineering_specs    TEXT         NOT NULL,
    explode_offset_x     DECIMAL(5,2) NOT NULL DEFAULT 0,
    explode_offset_y     DECIMAL(5,2) NOT NULL DEFAULT 0,
    explode_offset_z     DECIMAL(5,2) NOT NULL DEFAULT 0
);

-- 6. Persistent Shopping Cart Items (Per Browser Session)
CREATE TABLE IF NOT EXISTS cart_items (
    id              SERIAL PRIMARY KEY,
    session_id      VARCHAR(100)  NOT NULL,
    item_key        VARCHAR(160)  NOT NULL,
    product_id      VARCHAR(40)   NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    storage_label   VARCHAR(20)   NOT NULL,
    color_name      VARCHAR(60)   NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    quantity        INT           NOT NULL CHECK (quantity > 0),
    updated_at      TIMESTAMPTZ   DEFAULT NOW(),
    UNIQUE (session_id, item_key)
);

-- 7. Customer Orders
CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL PRIMARY KEY,
    session_id       VARCHAR(100)  NOT NULL,
    order_number     VARCHAR(30)   UNIQUE NOT NULL,
    customer_name    VARCHAR(120)  NOT NULL,
    customer_phone   VARCHAR(40)   NOT NULL,
    delivery_address TEXT          NOT NULL,
    payment_method   VARCHAR(20)   NOT NULL, -- 'card' or 'cod'
    total_amount     DECIMAL(10,2) NOT NULL CHECK (total_amount > 0),
    order_status     VARCHAR(30)   NOT NULL DEFAULT 'Confirmed',
    created_at       TIMESTAMPTZ   DEFAULT NOW()
);

-- 8. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INT           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      VARCHAR(40)   NOT NULL REFERENCES products(id),
    storage_label   VARCHAR(20)   NOT NULL,
    color_name      VARCHAR(60)   NOT NULL,
    unit_price      DECIMAL(10,2) NOT NULL,
    quantity        INT           NOT NULL CHECK (quantity > 0)
);

-- 9. Contact Us Inquiries
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id              SERIAL PRIMARY KEY,
    sender_name     VARCHAR(120) NOT NULL,
    sender_email    VARCHAR(160) NOT NULL,
    topic           VARCHAR(100) NOT NULL,
    message         TEXT         NOT NULL,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================================
-- SEED DATA (Idempotent - Safe to Re-run)
-- ============================================================================

INSERT INTO store_settings (id, website_name, company_name, owner_name, contact_number, business_address)
VALUES (
    1,
    'FMK Mobile Website',
    'FMK',
    'Faria (FARIA)',
    '+1 (800) 555-0199',
    'Suite 402, FMK Flagship Pavilion, Fifth Avenue, New York, NY'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (
    id, model_name, series_label, category, base_price, release_year,
    tagline, description, chip_spec, display_spec, camera_spec, battery_spec, material_spec, camera_count
) VALUES
(
    'iphone-17', 'iPhone 17', 'Flagship Pro Edition', 'Latest Gen', 1199.00, 2026,
    'Aerospace Titanium. Neural Photonics. Zero Compromise.',
    'Engineered with a vapor-chamber thermal core, 48MP periscope optical zoom, and an ultra-bright 120Hz LTPO OLED display encased in Grade-5 brushed titanium.',
    'A19 Pro Neural Silicon (2nm)', '6.7" ProMotion LTPO OLED · 3000 nits',
    '48MP Triple Optical + 6x Periscope Telephoto', '4,850 mAh Stacked Li-Ion · 45W MagSafe',
    'Grade-5 Brushed Titanium & Ceramic Shield', 3
),
(
    'iphone-16', 'iPhone 16', 'Titanium Pro Series', 'Pro Series', 999.00, 2025,
    'Precision Camera Control and Studio Spatial Audio.',
    'Built for creators and executives with hardware Camera Control, 4K 120fps Dolby Vision cinema capture, and an energy-dense silicon-carbon battery.',
    'A18 Pro 6-Core GPU', '6.3" Super Retina XDR · 120Hz',
    '48MP Fusion Triple Array + LiDAR', '4,420 mAh High-Density Cell · USB-C',
    'Micro-Blasted Titanium & Textured Matte Glass', 3
),
(
    'iphone-15', 'iPhone 15', 'Titanium Architecture', 'Pro Series', 849.00, 2024,
    'USB-C Studio Bandwidth Meets Contoured Titanium.',
    'Featuring a contoured aerospace frame, Dynamic Island telemetry, hardware-accelerated ray tracing, and 10Gbps USB-C external ProRes recording.',
    'A17 Pro 3nm Architecture', '6.1" Super Retina XDR · Dynamic Island',
    '48MP Main + 12MP Ultra Wide + 3x Optical', '3,877 mAh · 25W MagSafe Wireless',
    'Contoured Titanium & Color-Infused Glass', 3
),
(
    'iphone-14', 'iPhone 14', 'Essential Studio Line', 'Standard', 699.00, 2023,
    'Dual-Sensor Photonic Engine with All-Day Endurance.',
    'Refined surgical-grade chassis housing a fast-aperture dual camera array, Crash Detection sensors, and a calibrated OLED True Tone screen.',
    'A15 Bionic 5-Core GPU', '6.1" OLED Super Retina XDR · 1200 nits',
    '12MP Dual Photonic Engine + Action Mode', '3,279 mAh · Up to 20 hrs Video Playback',
    'Aerospace Aluminum & Ceramic Shield', 2
),
(
    'iphone-13', 'iPhone 13', 'Classic Precision Edition', 'Standard', 579.00, 2022,
    'Iconic Flat-Edge Silhouette with Cinematic Depth.',
    'A timeless flat-edge aluminum design delivering Cinematic Mode rack focus, sensor-shift optical stabilization, and dependable 5G connectivity.',
    'A15 Bionic Neural Engine', '6.1" Super Retina XDR · HDR10',
    '12MP Diagonal Dual Array + Sensor-Shift OIS', '3,227 mAh · Fast Charge 50% in 30 min',
    'Anodized Aluminum & Gorilla Ceramic Glass', 2
)
ON CONFLICT (id) DO NOTHING;

DELETE FROM product_storage_options WHERE product_id IN ('iphone-17', 'iphone-16', 'iphone-15', 'iphone-14', 'iphone-13');
INSERT INTO product_storage_options (product_id, storage_label, price_delta) VALUES
('iphone-17', '256GB', 0.00), ('iphone-17', '512GB', 200.00), ('iphone-17', '1TB', 400.00),
('iphone-16', '128GB', 0.00), ('iphone-16', '256GB', 100.00), ('iphone-16', '512GB', 300.00), ('iphone-16', '1TB', 500.00),
('iphone-15', '128GB', 0.00), ('iphone-15', '256GB', 100.00), ('iphone-15', '512GB', 300.00),
('iphone-14', '128GB', 0.00), ('iphone-14', '256GB', 100.00), ('iphone-14', '512GB', 300.00),
('iphone-13', '128GB', 0.00), ('iphone-13', '256GB', 100.00), ('iphone-13', '512GB', 250.00);

DELETE FROM product_colors WHERE product_id IN ('iphone-17', 'iphone-16', 'iphone-15', 'iphone-14', 'iphone-13');
INSERT INTO product_colors (product_id, color_name, hex_code, frame_hex, back_hex, accent_hex) VALUES
('iphone-17', 'Champagne Gold', '#D4AF37', '#C9A449', '#231E14', '#E5C158'),
('iphone-17', 'Obsidian Black', '#18181B', '#27272A', '#0F0F12', '#D4AF37'),
('iphone-17', 'Alabaster White', '#F4F4F0', '#D4D4D8', '#F5F5F4', '#C59B27'),
('iphone-17', 'Titanium Slate', '#52525B', '#71717A', '#27272A', '#D4AF37'),
('iphone-16', 'Obsidian Black', '#18181B', '#27272A', '#0F0F12', '#D4AF37'),
('iphone-16', 'Champagne Gold', '#D4AF37', '#C9A449', '#231E14', '#E5C158'),
('iphone-16', 'Alabaster White', '#F4F4F0', '#D4D4D8', '#F5F5F4', '#C59B27'),
('iphone-16', 'Titanium Slate', '#52525B', '#71717A', '#27272A', '#D4AF37'),
('iphone-15', 'Alabaster White', '#F4F4F0', '#D4D4D8', '#F5F5F4', '#C59B27'),
('iphone-15', 'Champagne Gold', '#D4AF37', '#C9A449', '#231E14', '#E5C158'),
('iphone-15', 'Obsidian Black', '#18181B', '#27272A', '#0F0F12', '#D4AF37'),
('iphone-14', 'Obsidian Black', '#18181B', '#27272A', '#0F0F12', '#D4AF37'),
('iphone-14', 'Alabaster White', '#F4F4F0', '#D4D4D8', '#F5F5F4', '#C59B27'),
('iphone-14', 'Champagne Gold', '#D4AF37', '#C9A449', '#231E14', '#E5C158'),
('iphone-13', 'Alabaster White', '#F4F4F0', '#D4D4D8', '#F5F5F4', '#C59B27'),
('iphone-13', 'Obsidian Black', '#18181B', '#27272A', '#0F0F12', '#D4AF37'),
('iphone-13', 'Champagne Gold', '#D4AF37', '#C9A449', '#231E14', '#E5C158');

INSERT INTO mobile_parts (
    id, part_index, part_name, subsystem, short_description, function_explanation,
    engineering_specs, explode_offset_x, explode_offset_y, explode_offset_z
) VALUES
('display', '01', 'Mobile Display and Touch Screen', 'Optical Interface Layer',
 'Edge-to-edge LTPO OLED panel bonded beneath Ceramic Shield glass and a capacitive multi-touch digitizer.',
 'Converts digital frame buffer signals into 120Hz adaptive HDR imagery while sensing 240Hz capacitive touch coordinates.',
 'LTPO Super Retina XDR | 1-120Hz ProMotion | 3000 nits | 240Hz Touch Sampling', 0.00, 0.00, 1.45),
('battery', '02', 'Battery', 'Electrochemical Power Cell',
 'High-density L-shaped lithium-ion power module paired with a copper-wound MagSafe inductive coil.',
 'Stores and regulates 3.88V DC energy while a Battery Management IC balances thermal load during fast charging.',
 '4,850 mAh Li-Ion | MagSafe 25W Coil | 45W USB-PD | Thermal NTC Monitoring', -0.35, -0.25, 0.45),
('camera', '03', 'Camera (Front and Back)', 'Computational Optics Array',
 'Triple-lens rear sapphire optical module with LiDAR scanner alongside the front TrueDepth camera.',
 'Captures photons onto sensor-shift stabilized CMOS sensors for depth mapping, 4K HDR capture, and Face ID.',
 '48MP Quad-Pixel Main | 6x Periscope | Sapphire Lenses | TrueDepth 3D Face ID', 0.35, 0.85, -1.35),
('motherboard', '04', 'Motherboard', 'Multi-Layer Logic PCB',
 '12-layer stacked high-density interconnect circuit board routing power, memory, RF, and display buses.',
 'Acts as the central nervous highway connecting SoC, LPDDR5X RAM, NVMe NAND storage, and 5G modem.',
 '12-Layer Gold HDI | Dual-Stacked PCB | RF Shielding | NVMe Flash Storage', 0.38, 0.25, 0.55),
('processor', '05', 'Processor', 'System-on-Chip (SoC)',
 'Gold-bonded 2nm/3nm flagship silicon die integrating CPU cores, ray-tracing GPU, and Neural Engine.',
 'Executes billions of instructions per second for OS responsiveness, AI inference, and 3D graphics.',
 '2nm/3nm Silicon Node | 6-Core CPU | 16-Core Neural Engine | Hardware Ray Tracing', 0.42, 0.32, 0.92),
('charging-port', '06', 'Charging Port', 'USB-C Power & Data I/O',
 'Precision-milled bottom USB-C receptacle with 24 gold-plated pins and waterproof silicone O-ring seal.',
 'Delivers up to 45W regulated power and negotiates 10Gbps USB 3 data streams and 4K DisplayPort output.',
 '24-Pin USB-C | 10Gbps Data | USB-PD 3.0 | IP68 Gasket Sealed', 0.00, -1.25, 0.15),
('speaker', '07', 'Speaker', 'Stereo Acoustic Drivers',
 'Dual-chamber bottom loudspeaker and top earpiece transducer filled with resonant acoustic foam beads.',
 'Converts amplified electrical waveforms into balanced stereo Spatial Audio with rich bass and voice clarity.',
 'Dual Stereo Drivers | Dolby Atmos Spatial | Acoustic Micro-Mesh | Smart Amp', 0.35, -1.18, 0.48),
('microphone', '08', 'Microphone', 'Studio MEMS Array',
 'Four studio-grade high-SNR MEMS acoustic capsules positioned at top, bottom, and rear camera plateau.',
 'Captures directional audio beams while running real-time ambient noise cancellation and wind filtering.',
 '4x Studio MEMS Mics | 72dB SNR | Wind Filtering | Spatial Audio Zoom', -0.36, -1.16, 0.42),
('frame', '09', 'Mobile Frame and Body', 'Titanium Structural Chassis',
 'CNC-machined Grade-5 titanium perimeter rail bonded to an aluminum thermal substructure and rear matte glass.',
 'Provides rigid drop protection, acts as integrated 5G/Wi-Fi antennas, and dissipates processor heat.',
 'Grade-5 Titanium | Aluminum Sub-Frame | IP68 Water Resistance | 5G Antennas', 0.00, 0.00, -0.75),
('sim-tray', '10', 'SIM Card Tray', 'Cellular Identity Slot',
 'Precision-anodized titanium drawer with recessed nano-SIM cradle and waterproof elastomer gasket.',
 'Secures the subscriber identity card against gold PCB contacts while maintaining a watertight IP68 seal.',
 'CNC Titanium Faceplate | IP68 Gasket | Dual eSIM + Nano-SIM | Spring-Eject', -0.95, -0.15, 0.00),
('buttons', '11', 'Power and Volume Buttons', 'Tactile Side Controls',
 'Precision-milled side power key, volume rockers, and customizable Action button on micro-dome switches.',
 'Translates crisp mechanical presses into sealed switch signals for sleep/wake, volume, and camera shutter.',
 'CNC Metallic Keycaps | Sealed Dome Switches | Action Key | 500K-Cycle Rated', 0.95, 0.22, 0.00)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_storage_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Catalog: Read-only for public visitors
DROP POLICY IF EXISTS "Public read products" ON products;
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read storage" ON product_storage_options;
CREATE POLICY "Public read storage" ON product_storage_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read colors" ON product_colors;
CREATE POLICY "Public read colors" ON product_colors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read parts" ON mobile_parts;
CREATE POLICY "Public read parts" ON mobile_parts FOR SELECT USING (true);

-- Store Settings: Read & inline update for record id = 1
DROP POLICY IF EXISTS "Public read settings" ON store_settings;
CREATE POLICY "Public read settings" ON store_settings FOR SELECT USING (id = 1);

DROP POLICY IF EXISTS "Public insert settings" ON store_settings;
CREATE POLICY "Public insert settings" ON store_settings FOR INSERT WITH CHECK (id = 1);

DROP POLICY IF EXISTS "Public update settings" ON store_settings;
CREATE POLICY "Public update settings" ON store_settings FOR UPDATE USING (id = 1) WITH CHECK (id = 1);

-- Cart Items: Full CRUD scoped to visitor session_id
DROP POLICY IF EXISTS "Session cart select" ON cart_items;
CREATE POLICY "Session cart select" ON cart_items FOR SELECT USING (char_length(session_id) > 8);

DROP POLICY IF EXISTS "Session cart insert" ON cart_items;
CREATE POLICY "Session cart insert" ON cart_items FOR INSERT WITH CHECK (char_length(session_id) > 8 AND quantity > 0);

DROP POLICY IF EXISTS "Session cart update" ON cart_items;
CREATE POLICY "Session cart update" ON cart_items FOR UPDATE USING (char_length(session_id) > 8) WITH CHECK (quantity > 0);

DROP POLICY IF EXISTS "Session cart delete" ON cart_items;
CREATE POLICY "Session cart delete" ON cart_items FOR DELETE USING (char_length(session_id) > 8);

-- Orders & Order Items: Insert, read, and delete/cancel for active session
DROP POLICY IF EXISTS "Session orders select" ON orders;
CREATE POLICY "Session orders select" ON orders FOR SELECT USING (char_length(session_id) > 8);

DROP POLICY IF EXISTS "Public insert orders" ON orders;
CREATE POLICY "Public insert orders" ON orders FOR INSERT WITH CHECK (
    char_length(session_id) > 8 AND char_length(customer_name) > 0 AND total_amount > 0
);

DROP POLICY IF EXISTS "Session orders update" ON orders;
CREATE POLICY "Session orders update" ON orders FOR UPDATE USING (char_length(session_id) > 8);

DROP POLICY IF EXISTS "Session orders delete" ON orders;
CREATE POLICY "Session orders delete" ON orders FOR DELETE USING (char_length(session_id) > 8);

DROP POLICY IF EXISTS "Session order_items select" ON order_items;
CREATE POLICY "Session order_items select" ON order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert order_items" ON order_items;
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (quantity > 0);

-- Contact Inquiries: Insert-only (protects customer emails & messages from public SELECT)
DROP POLICY IF EXISTS "Public insert inquiries" ON contact_inquiries;
CREATE POLICY "Public insert inquiries" ON contact_inquiries FOR INSERT WITH CHECK (
    char_length(sender_name) > 0 AND char_length(sender_email) > 3 AND char_length(message) > 0
);
