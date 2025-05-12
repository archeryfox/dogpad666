-- Create Users table
CREATE TABLE IF NOT EXISTS "User" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Venues table
CREATE TABLE IF NOT EXISTS "Venue" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    capacity INTEGER,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Events table
CREATE TABLE IF NOT EXISTS "Event" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date TIMESTAMP NOT NULL,
    organizerId INTEGER REFERENCES "User"(id),
    venueId INTEGER REFERENCES "Venue"(id),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create EventParticipants table
CREATE TABLE IF NOT EXISTS "EventParticipant" (
    id SERIAL PRIMARY KEY,
    eventId INTEGER REFERENCES "Event"(id),
    userId INTEGER REFERENCES "User"(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(eventId, userId)
);

-- Insert sample users
INSERT INTO "User" (email, password, firstName, lastName, role) VALUES
('admin@example.com', '$2b$10$example_hash', 'Admin', 'User', 'ADMIN'),
('user@example.com', '$2b$10$example_hash', 'Regular', 'User', 'USER');

-- Insert sample venues
INSERT INTO "Venue" (name, address, capacity, description) VALUES
('Main Conference Hall', '123 Main St', 500, 'Large conference hall with modern equipment'),
('Meeting Room A', '456 Business Ave', 50, 'Small meeting room for team discussions'),
('Exhibition Center', '789 Expo St', 1000, 'Large space for exhibitions and events');

-- Insert sample events
INSERT INTO "Event" (title, description, date, organizerId, venueId) VALUES
('Tech Conference 2024', 'Annual technology conference with industry leaders', '2024-11-10 23:45:53+03', 1, 1),
('Team Building', 'Team building event for company employees', '2024-12-15 14:00:00+03', 1, 2),
('Product Launch', 'New product launch event', '2024-12-20 18:00:00+03', 1, 3);

-- Insert sample event participants
INSERT INTO "EventParticipant" (eventId, userId, status) VALUES
(1, 2, 'CONFIRMED'),
(2, 2, 'PENDING'),
(3, 2, 'CONFIRMED'); 