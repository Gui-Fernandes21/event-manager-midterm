
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,             -- Hashed password
  role TEXT CHECK(role IN ('organizer', 'attendee', 'admin')) NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,             -- ISO datetime string
  createdAt TEXT NOT NULL,        -- ISO timestamp
  publishedAt TEXT,               -- Nullable
  status TEXT CHECK(status IN ('draft', 'published')) NOT NULL,
  tickets_general INTEGER DEFAULT 0,
  tickets_vip INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- userId INTEGER NOT NULL,
  eventId INTEGER NOT NULL,
  attendee_name TEXT NOT NULL,
  ticket_type TEXT CHECK(ticket_type IN ('general', 'vip')) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  bookedAt TEXT NOT NULL,
  -- FOREIGN KEY (userId) REFERENCES users(user_id),
  FOREIGN KEY (eventId) REFERENCES events(event_id)
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_name TEXT NOT NULL DEFAULT 'EventFlow Manager',
  site_description TEXT DEFAULT 'Professional event management for all your needs',
  default_general_tickets INTEGER DEFAULT 50,
  default_vip_tickets INTEGER DEFAULT 10,
  contact_email TEXT,
  contact_phone TEXT,
  booking_instructions TEXT DEFAULT 'Please review the event details carefully before booking. Bring a valid ID to the event.',
  require_booking_notes BOOLEAN DEFAULT 0,
  show_remaining_tickets BOOLEAN DEFAULT 1,
  updated_at TEXT NOT NULL
);

-- Insert default data (if necessary here)

-- Set up three users
-- INSERT INTO users ('user_name', 'email', 'password', 'role', 'createdAt') VALUES ('Gui Fernandes', 'gui.fernandes@example.com', 'hashed_password', 'organizer', '2023-01-01T00:00:00Z');
-- INSERT INTO users ('user_name', 'email', 'password', 'role', 'createdAt') VALUES ('sushi', 'sushi@example.com', 'hashed_password', 'attendee', '2023-01-01T00:00:00Z');

-- Insert default site settings
INSERT INTO site_settings ('site_name', 'site_description', 'default_general_tickets', 'default_vip_tickets', 'contact_email', 'contact_phone', 'booking_instructions', 'require_booking_notes', 'show_remaining_tickets', 'updated_at') 
VALUES ('EventFlow Manager', 'Professional event management for all your needs', 50, 10, 'contact@eventflow.com', '+1 (555) 123-4567', 'Please review the event details carefully before booking. Bring a valid ID to the event.', 0, 1, datetime('now'));

COMMIT;

