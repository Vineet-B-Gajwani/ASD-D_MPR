-- Create Database
CREATE DATABASE IF NOT EXISTS logistics_db;
USE logistics_db;

-- 1. Customer Table
CREATE TABLE IF NOT EXISTS Customer (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    phone_no VARCHAR(15)
);

-- 2. Shipment Table
CREATE TABLE IF NOT EXISTS Shipment (
    shipment_id INT PRIMARY KEY AUTO_INCREMENT,
    weight FLOAT NOT NULL,
    shipping_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES Customer(user_id) ON DELETE CASCADE
);

-- 3. Tracking_Event Table
CREATE TABLE IF NOT EXISTS Tracking_Event (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    event_time DATETIME NOT NULL,
    status_update VARCHAR(100) NOT NULL,
    shipment_id INT,
    FOREIGN KEY (shipment_id) REFERENCES Shipment(shipment_id) ON DELETE CASCADE
);

-- 4. Location Table
CREATE TABLE IF NOT EXISTS Location (
    location_id INT PRIMARY KEY AUTO_INCREMENT,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL
);

-- Shipment_Location Mapping Table (Many-to-Many relationship handler)
CREATE TABLE IF NOT EXISTS Shipment_Location (
    shipment_id INT,
    location_id INT,
    PRIMARY KEY (shipment_id, location_id),
    FOREIGN KEY (shipment_id) REFERENCES Shipment(shipment_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES Location(location_id) ON DELETE CASCADE
);

-- 5. Vehicle Table
CREATE TABLE IF NOT EXISTS Vehicle (
    vehicle_no VARCHAR(20) PRIMARY KEY,
    vehicle_type VARCHAR(20) NOT NULL,
    capacity INT NOT NULL
);

-- 6. Vehicle Specialization Tables
CREATE TABLE IF NOT EXISTS Truck (
    vehicle_no VARCHAR(20) PRIMARY KEY,
    line_no VARCHAR(20),
    driver_name VARCHAR(50),
    FOREIGN KEY (vehicle_no) REFERENCES Vehicle(vehicle_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Ship (
    vehicle_no VARCHAR(20) PRIMARY KEY,
    ship_name VARCHAR(50),
    FOREIGN KEY (vehicle_no) REFERENCES Vehicle(vehicle_no) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Aeroplane (
    vehicle_no VARCHAR(20) PRIMARY KEY,
    airline_name VARCHAR(50),
    flight_no VARCHAR(20),
    FOREIGN KEY (vehicle_no) REFERENCES Vehicle(vehicle_no) ON DELETE CASCADE
);

-- Shipment_Vehicle Mapping Table (Tracking which shipment is on which vehicle)
CREATE TABLE IF NOT EXISTS Shipment_Vehicle (
    shipment_id INT,
    vehicle_no VARCHAR(20),
    PRIMARY KEY (shipment_id, vehicle_no),
    FOREIGN KEY (shipment_id) REFERENCES Shipment(shipment_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_no) REFERENCES Vehicle(vehicle_no) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------------
-- SAMPLE DATA INSERTION
-- -----------------------------------------------------------------------------------

-- Insert Customers
INSERT INTO Customer (name, address, phone_no) VALUES 
('Alice Smith', '123 Ocean Drive, Miami, FL', '555-0101'),
('Bob Johnson', '456 Maple Street, Seattle, WA', '555-0202'),
('Global Trade Inc.', '789 Business Parkway, NY', '555-0303');

-- Insert Shipments
INSERT INTO Shipment (weight, shipping_date, status, user_id) VALUES 
(15.5, '2026-03-20', 'In Transit', 1),
(1200.0, '2026-03-24', 'Pending', 3),
(2.0, '2026-03-15', 'Delivered', 2);

-- Insert Tracking Events
INSERT INTO Tracking_Event (event_time, status_update, shipment_id) VALUES 
('2026-03-20 08:00:00', 'Shipment Picked Up', 1),
('2026-03-21 14:30:00', 'In Transit', 1),
('2026-03-24 09:15:00', 'Pending', 2),
('2026-03-15 10:00:00', 'Shipment Picked Up', 3),
('2026-03-16 11:20:00', 'In Transit', 3),
('2026-03-17 16:45:00', 'Delivered', 3);

-- Insert Locations
INSERT INTO Location (city, country) VALUES 
('Miami', 'USA'),
('Seattle', 'USA'),
('New York', 'USA'),
('London', 'UK'),
('Tokyo', 'Japan');

-- Insert Vehicles
INSERT INTO Vehicle (vehicle_no, vehicle_type, capacity) VALUES 
('TRK-1001', 'Truck', 5000),
('SHP-2001', 'Ship', 5000000),
('AER-3001', 'Aeroplane', 20000);

-- Insert Vehicle Specializations
INSERT INTO Truck (vehicle_no, line_no, driver_name) VALUES ('TRK-1001', 'L-55', 'John Davis');
INSERT INTO Ship (vehicle_no, ship_name) VALUES ('SHP-2001', 'Ocean Horizon');
INSERT INTO Aeroplane (vehicle_no, airline_name, flight_no) VALUES ('AER-3001', 'Sky Freight', 'SF-889');

-- Insert Relationships
INSERT INTO Shipment_Location (shipment_id, location_id) VALUES (1, 1), (1, 4), (2, 3), (2, 5), (3, 2);
INSERT INTO Shipment_Vehicle (shipment_id, vehicle_no) VALUES (1, 'AER-3001'), (2, 'SHP-2001'), (3, 'TRK-1001');
