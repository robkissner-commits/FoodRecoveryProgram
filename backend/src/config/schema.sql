-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS recovery_reports CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS partners CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'reporter', 'driver', 'partner');
CREATE TYPE event_status AS ENUM ('scheduled', 'assigned', 'reported', 'completed', 'cancelled');
CREATE TYPE recovery_status AS ENUM ('pending', 'assigned', 'picked_up', 'delivered', 'cancelled');
CREATE TYPE need_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE delivery_status AS ENUM ('pending', 'accepted', 'picked_up', 'delivered', 'cancelled');

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Partners table
CREATE TABLE partners (
  id SERIAL PRIMARY KEY,
  organization_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(255),
  operating_hours TEXT,
  food_preferences TEXT,
  current_need_level need_level DEFAULT 'medium',
  delivery_instructions TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  expected_attendees INTEGER,
  food_type VARCHAR(255),
  catering_company VARCHAR(255),
  reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status event_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recovery Reports table
CREATE TABLE recovery_reports (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  reporter_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  has_food BOOLEAN NOT NULL,
  food_quantity VARCHAR(100),
  food_description TEXT,
  photo_urls TEXT[],
  notes TEXT,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status recovery_status DEFAULT 'pending'
);

-- Deliveries table
CREATE TABLE deliveries (
  id SERIAL PRIMARY KEY,
  recovery_report_id INTEGER REFERENCES recovery_reports(id) ON DELETE CASCADE,
  driver_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  partner_id INTEGER REFERENCES partners(id) ON DELETE SET NULL,
  pickup_time TIMESTAMP,
  delivery_time TIMESTAMP,
  status delivery_status DEFAULT 'pending',
  pickup_photo_url TEXT,
  delivery_photo_url TEXT,
  issues TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  related_id INTEGER,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_reporter_id ON events(reporter_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_recovery_reports_event_id ON recovery_reports(event_id);
CREATE INDEX idx_recovery_reports_status ON recovery_reports(status);
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_partner_id ON deliveries(partner_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
