
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,             -- Hashed password
  role TEXT CHECK(role IN ('organizer', 'attendee')) NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_accounts (
    email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL,
    user_id  INT, --the user that the email account belongs to
    FOREIGN KEY (user_id) REFERENCES users(user_id)
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
  userId INTEGER NOT NULL,
  eventId INTEGER NOT NULL,
  attendee_name TEXT NOT NULL,
  ticket_type TEXT CHECK(ticket_type IN ('general', 'vip')) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  bookedAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(user_id),
  FOREIGN KEY (eventId) REFERENCES events(event_id)
);

-- Insert default data (if necessary here)

-- Set up three users
INSERT INTO users ('user_name', 'email', 'password', 'role', 'createdAt') VALUES ('Gui Fernandes', 'gui.fernandes@example.com', 'hashed_password', 'organizer', '2023-01-01T00:00:00Z');
INSERT INTO users ('user_name', 'email', 'password', 'role', 'createdAt') VALUES ('sushi', 'sushi@example.com', 'hashed_password', 'attendee', '2023-01-01T00:00:00Z');
-- INSERT INTO users ('user_name', 'email', 'password', 'role', 'createdAt') VALUES ('Dianne Dean', 'dianne.dean@example.com', 'hashed_password', 'attendee', '2023-01-01T00:00:00Z');
-- INSERT INTO users ('user_name', 'email', 'password', 'role', 'createdAt') VALUES ('Harry Hilbert', 'harry.hilbert@example.com', 'hashed_password', 'attendee', '2023-01-01T00:00:00Z');

-- Give Simon two email addresses and Diane one, but Harry has none
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@gmail.com', 1); 
-- INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@hotmail.com', 1); 
-- INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('dianne@yahoo.co.uk', 2); 

COMMIT;

