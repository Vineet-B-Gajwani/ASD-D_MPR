# Global Logistics & Tracking System

A full-stack web application designed for managing and tracking international logistics and shipments. Built cleanly using Node.js, Express, MySQL, and vanilla HTML/CSS/JS.

## Features
- **Clean Premium UI**: A highly responsive, single-page application experience with a modern white and blue aesthetic.
- **Customer Management**: Add and manage shipping customers.
- **Shipment Management**: Create shipments associated with customers alongside shipping dates and weights.
- **Real-Time Tracking**: Track individual shipments by ID to view timeline updates and change statuses.
- **Global Overview**: View all existing shipments in a dynamic data table with quick tracking actions.

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla ES6+), Google Fonts (Inter)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Tooling**: dotenv, cors, mysql2

---

## Instructions to Run Locally

### 1. Database Setup (MySQL)
1. Ensure you have **MySQL Server** installed and running on your machine.
2. Open your MySQL client (e.g., MySQL Workbench, phpMyAdmin, or CLI).
3. Execute the SQL script provided in `database/schema.sql`. This script will:
   - Create the `logistics_db` database.
   - Construct all the necessary tables (`Customer`, `Shipment`, `Tracking_Event`, `Location`, `Vehicle`, etc.) with properly defined Primary and Foreign Key constraints.
   - Insert sample data for instant testing.

### 2. Backend Setup
1. Open a terminal in the project root folder (`DBMS_MPR`).
2. Verify dependencies are installed. (A `node_modules` folder should be present). If not, run:
   ```bash
   npm install
   ```
3. Open the `.env` file and configure your database credentials. Ensure the `DB_PASSWORD` matches your local MySQL `root` user password.
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=logistics_db
   PORT=3000
   ```

### 3. Running the Server
1. Start the backend Node server by running:
   ```bash
   npm start
   ```
2. You should see the message: `Server is running on http://localhost:3000` and `Connected to MySQL Database!`.

### 4. Viewing the Application
1. Open your web browser.
2. Navigate to `http://localhost:3000`. 
3. The Express server serves the frontend files in the `public` directory automatically. You can now use the full application!

---

## ER Diagram Mapping
- **Customer**: `user_id`, `name`, `address`, `phone_no`.
- **Shipment**: `shipment_id`, `weight`, `shipping_date`, `status` + FK `user_id`.
- **Tracking_Event**: `event_id`, `event_time`, `status_update` + FK `shipment_id`.
- **Location**: `location_id`, `city`, `country`.
- **Vehicle**: `vehicle_no`, `vehicle_type`, `capacity`.
- **Specializations**: `Truck`, `Ship`, `Aeroplane` reference `Vehicle`.
