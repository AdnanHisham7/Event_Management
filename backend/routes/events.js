const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Get all events
router.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM events');
    res.json(result.rows);
});

// Add an event with conflict detection
router.post('/', async (req, res) => {
    const { event_name, description, date, start_time, end_time } = req.body;

    const conflictQuery = `
        SELECT * FROM events
        WHERE date = $1
          AND (
                (start_time BETWEEN $2 AND $3)
                OR 
                (end_time BETWEEN $2 AND $3)
                OR 
                ($2 BETWEEN start_time AND end_time)
              )
    `;
    const conflicts = await pool.query(conflictQuery, [date, start_time, end_time]);

    if (conflicts.rows.length > 0) {
        return res.status(409).json({ message: 'Time conflict detected', conflicts: conflicts.rows });
    }

    const insertQuery = `
        INSERT INTO events (event_name, description, date, start_time, end_time)
        VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const result = await pool.query(insertQuery, [event_name, description, date, start_time, end_time]);
    res.status(201).json(result.rows[0]);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;

    const query = 'SELECT * FROM events WHERE event_id = $1';
    try {
        const result = await pool.query(query, [id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);  // Send the event data as JSON
        } else {
            res.status(404).send('Event not found');
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).send('Server error');
    }
});



router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { event_name, date, start_time, end_time } = req.body;

    const query = `
        UPDATE events
        SET event_name = $1, date = $2, start_time = $3, end_time = $4
        WHERE event_id = $5
        RETURNING *;
    `;
    const values = [event_name, date, start_time, end_time, id];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);  // Return updated event
        } else {
            res.status(404).send('Event not found');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).send('Server error');
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    // SQL query to delete the event
    const query = 'DELETE FROM events WHERE event_id = $1 RETURNING *';
    try {
        const result = await pool.query(query, [id]);

        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Event deleted successfully' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
