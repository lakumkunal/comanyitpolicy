const express = require('express');
const cors = require('cors');
const logger = require('../utils/logger');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const fs = require('fs'); // Import fs to use for file operations
const path = require('path'); // Import path to manage file paths

const app = express();
const port = 5000;
console.log('github desktop');
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'admin@1A',
    database: 'companyit'
});

// Log file path
const logFilePath = path.join(__dirname, '../log/log.txt'); // Ensure this path is correct

(async () => {
    try {
        // Promisify the connection
        await new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    logger('Database Connection', 'Error', 200, `Error connecting to the database: ${err.stack}`);
                    reject(err);
                } else {
                    logger('Database Connection', 'Success', 500, 'Connected to the database');
                    resolve();
                }
            });
        });
    } catch (err) {
        console.error('Failed to connect to the database');
    }
})();

// Helper function for asynchronous queries
const queryAsync = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

// POST endpoint for logging
app.post('/api/log', (req, res) => {
    const { methodName, messageType, statusCode, message, timeStamp } = req.body;
    const logMessage = `[${timeStamp}] - [${methodName}] [${messageType}] [${statusCode}] ${message}\n`;

    // Write the log message to the log.txt file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
            return res.status(500).send('Failed to write log');
        }
        res.status(200).send('Log saved successfully');
    });
});

// Example endpoint
app.get('/api/example', (req, res) => {
    try {
        logger('GET /api/example', 'Success', 200, 'Operation completed successfully');
        res.status(200).json({ message: 'Operation successful' });
    } catch (error) {
        logger('GET /api/example', 'Error', 500, error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get all company IT policies
app.get('/api/getcompanyitpolicy', async (req, res) => {
    const getquery = 'SELECT * FROM tblcompanyit ORDER BY id DESC';
    try {
        // Execute the query asynchronously
        const results = await queryAsync(getquery);

        // Log success with appropriate details
        logger('GET /api/getcompanyitpolicy', 'Success', 200, 'Policies retrieved successfully');

        // Respond with the retrieved policies
        res.status(200).json(results);
    } catch (err) {
        // Log error details
        logger('GET /api/getcompanyitpolicy', 'Error', 500, `Database query error: ${err.message}`);

        // Respond with error message
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get a company IT policy by ID
app.get('/api/getcompanyitpolicy/:id', async (req, res) => {
    const id = req.params.id;

    try {
        logger('GET /api/getcompanyitpolicy/:id', 'Info', 200, `Fetching policy with ID: ${id}`);

        const getquerybyid = 'SELECT * FROM tblcompanyit WHERE id = ?';
        const results = await queryAsync(getquerybyid, [id]);

        if (results.length === 0) {
            logger('GET /api/getcompanyitpolicy/:id', 'Error', 404, 'Policy not found');
            return res.status(404).json({ message: 'Policy not found' });
        }

        logger('GET /api/getcompanyitpolicy/:id', 'Success', 200, 'Policy retrieved successfully');
        res.status(200).json(results[0]);

    } catch (error) {
        logger('GET /api/getcompanyitpolicy/:id', 'Error', 500, error.message);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to post a new company IT policy
app.post('/api/postcompanyitpolicy', async (req, res) => {
    const { policyname, sessiontimeout, passwordattempts, passwordneverexpires, passwordchangeduration, passwordexpirenotification, status } = req.body;

    try {
        logger('POST /api/postcompanyitpolicy', 'Info', 200, 'Received data for creating a policy');

        const checkQuery = 'SELECT * FROM tblcompanyit WHERE policyname = ?';
        const checkResults = await queryAsync(checkQuery, [policyname]);

        if (checkResults.length > 0) {
            logger('POST /api/postcompanyitpolicy', 'Error', 400, 'Policy name already exists');
            return res.status(400).json({ error: 'Policy name already exists' });
        }

        const postquery = `
            INSERT INTO tblcompanyit (policyname, sessiontimeout, passwordattempts, passwordneverexpires, passwordchangeduration, passwordexpirenotification, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const results = await queryAsync(postquery, [policyname, sessiontimeout, passwordattempts, passwordneverexpires, passwordchangeduration, passwordexpirenotification, status]);

        logger('POST /api/postcompanyitpolicy', 'Success', 200, 'Policy inserted successfully');
        res.status(200).json(results);
    } catch (error) {
        logger('POST /api/postcompanyitpolicy', 'Error', 500, error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to edit a policy by ID
app.put('/api/EditPolicy/:id', async (req, res) => {
    const policyId = req.params.id;
    const { policyname, sessiontimeout, passwordattempts, passwordneverexpires, passwordchangeduration, passwordexpirenotification, status } = req.body;

    const changeduration = passwordneverexpires ? null : passwordchangeduration;
    const expireNotification = passwordneverexpires ? null : passwordexpirenotification;

    try {
        logger('PUT /api/EditPolicy/:id', 'Info', 200, `Updating policy ${policyname}`);

        const query = `
          UPDATE tblcompanyit
          SET policyname = ?, sessiontimeout = ?, passwordattempts = ?, passwordneverexpires = ?, passwordchangeduration = ?, passwordexpirenotification = ?, status = ?
          WHERE id = ?
        `;

        const result = await queryAsync(query, [policyname, sessiontimeout, passwordattempts, passwordneverexpires ? 1 : 0, changeduration, expireNotification, status, policyId]);

        logger('PUT /api/EditPolicy/:id', 'Success', 200, `Policy ${policyname} updated successfully`);
        res.json({ message: 'Policy updated successfully' });
    } catch (error) {
        logger('PUT /api/EditPolicy/:id', 'Error', 500, error.message);
        res.status(500).json({ error: 'Error updating policy' });
    }
});

// Endpoint to suspend a policy by ID
app.post('/api/suspendPolicy/:id', async (req, res) => {
    const id = req.params.id;
    const { policyname } = req.body; // You can retrieve other data if needed

    try {
        logger('POST /api/suspendPolicy/:id', 'Info', 200, `Suspending policy ${policyname}.`);

        const updatequery = 'UPDATE tblcompanyit SET status = ? WHERE id = ?';
        const results = await queryAsync(updatequery, [3, id]);

        logger('POST /api/suspendPolicy/:id', 'Success', 200, `Policy ${policyname} suspended.`);
        res.status(200).json(results);
    } catch (error) {
        logger('POST /api/suspendPolicy/:id', 'Error', 500, error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Start the server
app.listen(port, () => {
    logger('Server Start', 'Success', 200, `Server running on port ${port}`);
    console.log(`Backend running at the port http://localhost:${port}`);
});
