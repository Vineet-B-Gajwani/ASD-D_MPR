require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MySQL Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'logistics_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB Connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL Database!');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err);
    });

// -----------------------------------------------------------------
// REST APIs
// -----------------------------------------------------------------

// 1. POST /customer
app.post('/api/customer', async (req, res) => {
    try {
        const { name, address, phone_no } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Customer (name, address, phone_no) VALUES (?, ?, ?)',
            [name, address, phone_no]
        );
        res.status(201).json({ message: 'Customer added successfully', user_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add customer' });
    }
});

// 2. POST /shipment
app.post('/api/shipment', async (req, res) => {
    try {
        const { weight, shipping_date, status, user_id } = req.body;
        const [result] = await pool.query(
            'INSERT INTO Shipment (weight, shipping_date, status, user_id) VALUES (?, ?, ?, ?)',
            [weight, shipping_date, status, user_id]
        );
        res.status(201).json({ message: 'Shipment created successfully', shipment_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create shipment' });
    }
});

// 3. POST /tracking
app.post('/api/tracking', async (req, res) => {
    try {
        const { shipment_id, status_update } = req.body;

        // Insert tracking event
        await pool.query(
            'INSERT INTO Tracking_Event (event_time, status_update, shipment_id) VALUES (NOW(), ?, ?)',
            [status_update, shipment_id]
        );

        // Update shipment status as well
        await pool.query(
            'UPDATE Shipment SET status = ? WHERE shipment_id = ?',
            [status_update, shipment_id]
        );

        res.status(201).json({ message: 'Tracking event added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add tracking event' });
    }
});

// 4. GET /shipment/:id
app.get('/api/shipment/:id', async (req, res) => {
    try {
        const shipmentId = req.params.id;

        // Get shipment details with customer info
        const [shipmentRows] = await pool.query(`
            SELECT s.*, c.name as customer_name, c.phone_no 
            FROM Shipment s
            JOIN Customer c ON s.user_id = c.user_id
            WHERE s.shipment_id = ?
        `, [shipmentId]);

        if (shipmentRows.length === 0) {
            return res.status(404).json({ error: 'Shipment not found' });
        }

        // Get tracking events for this shipment
        const [trackingRows] = await pool.query(`
            SELECT * FROM Tracking_Event 
            WHERE shipment_id = ? 
            ORDER BY event_time DESC
        `, [shipmentId]);

        res.json({
            shipment: shipmentRows[0],
            events: trackingRows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch shipment' });
    }
});

// 5. GET /shipments
app.get('/api/shipments', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.shipment_id, s.weight, s.shipping_date, s.status, c.name as customer_name
            FROM Shipment s
            JOIN Customer c ON s.user_id = c.user_id
            ORDER BY s.shipment_id DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch shipments' });
    }
});

// GET /customers (Helper API for dropdowns)
app.get('/api/customers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT user_id, name FROM Customer ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
