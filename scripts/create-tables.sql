-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS sms_logs CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  arv DECIMAL(12,2) NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3,1) NOT NULL,
  square_feet INTEGER NOT NULL,
  lot_size DECIMAL(10,2),
  year_built INTEGER,
  property_type VARCHAR(50) NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'available', 'auction', 'sold')),
  slug VARCHAR(500) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  property_address VARCHAR(500) NOT NULL,
  bid_amount DECIMAL(12,2) NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS Logs table
CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'notification' CHECK (message_type IN ('notification', 'alert', 'reminder', 'marketing')),
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_created_at ON properties(created_at);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_zip_code ON properties(zip_code);
CREATE INDEX idx_bids_status ON bids(status);
CREATE INDEX idx_bids_property_id ON bids(property_id);
CREATE INDEX idx_bids_submitted_at ON bids(submitted_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sms_logs_sent_at ON sms_logs(sent_at);

-- Insert sample admin users
INSERT INTO users (email, name, role, is_active) VALUES
  ('admin@azdealhub.com', 'Admin User', 'admin', true),
  ('superadmin@azdealhub.com', 'Super Admin', 'super_admin', true),
  ('user@azdealhub.com', 'Regular User', 'user', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample properties
INSERT INTO properties (
  address, city, state, zip_code, price, arv, bedrooms, bathrooms, 
  square_feet, lot_size, year_built, property_type, description, 
  status, slug, created_by
) VALUES
  (
    '1234 Desert View Dr', 'Phoenix', 'AZ', '85001', 185000.00, 275000.00,
    3, 2.0, 1850, 0.25, 1995, 'Single Family',
    'Beautiful desert home with mountain views and updated kitchen.',
    'available', 'desert-view-dr-phoenix-85001',
    (SELECT id FROM users WHERE email = 'admin@azdealhub.com' LIMIT 1)
  ),
  (
    '5678 Cactus Lane', 'Tucson', 'AZ', '85701', 145000.00, 220000.00,
    2, 1.5, 1200, 0.18, 1988, 'Townhouse',
    'Cozy townhouse in quiet neighborhood, perfect for first-time buyers.',
    'pending', 'cactus-lane-tucson-85701',
    (SELECT id FROM users WHERE email = 'user@azdealhub.com' LIMIT 1)
  ),
  (
    '9012 Sunset Blvd', 'Scottsdale', 'AZ', '85251', 320000.00, 450000.00,
    4, 3.0, 2800, 0.35, 2005, 'Single Family',
    'Luxury home with pool and spa in prestigious Scottsdale location.',
    'auction', 'sunset-blvd-scottsdale-85251',
    (SELECT id FROM users WHERE email = 'admin@azdealhub.com' LIMIT 1)
  ),
  (
    '3456 Mountain Ridge Rd', 'Mesa', 'AZ', '85202', 225000.00, 320000.00,
    3, 2.5, 2100, 0.28, 2000, 'Single Family',
    'Modern home with open floor plan and desert landscaping.',
    'available', 'mountain-ridge-rd-mesa-85202',
    (SELECT id FROM users WHERE email = 'admin@azdealhub.com' LIMIT 1)
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert sample bids
INSERT INTO bids (
  property_id, property_address, bid_amount, confidence, status, submitted_by
) VALUES
  (
    (SELECT id FROM properties WHERE address = '1234 Desert View Dr' LIMIT 1),
    '1234 Desert View Dr, Phoenix, AZ 85001',
    190000.00, 85, 'pending',
    (SELECT id FROM users WHERE email = 'user@azdealhub.com' LIMIT 1)
  ),
  (
    (SELECT id FROM properties WHERE address = '9012 Sunset Blvd' LIMIT 1),
    '9012 Sunset Blvd, Scottsdale, AZ 85251',
    335000.00, 92, 'approved',
    (SELECT id FROM users WHERE email = 'user@azdealhub.com' LIMIT 1)
  ),
  (
    (SELECT id FROM properties WHERE address = '3456 Mountain Ridge Rd' LIMIT 1),
    '3456 Mountain Ridge Rd, Mesa, AZ 85202',
    240000.00, 78, 'pending',
    (SELECT id FROM users WHERE email = 'user@azdealhub.com' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- Insert sample SMS logs
INSERT INTO sms_logs (to_number, message, message_type, status) VALUES
  ('+14805551234', 'Your property submission has been approved!', 'notification', 'delivered'),
  ('+14805559876', 'New auction starting for property in Scottsdale', 'alert', 'sent'),
  ('+14805555555', 'Reminder: Auction ends in 1 hour', 'reminder', 'delivered'),
  ('+14805551111', 'Welcome to AZ Deal Hub! Your account is now active.', 'notification', 'delivered'),
  ('+14805552222', 'Property price updated for 1234 Desert View Dr', 'notification', 'sent');

-- Verify tables were created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('users', 'properties', 'bids', 'sms_logs')
ORDER BY table_name, ordinal_position;