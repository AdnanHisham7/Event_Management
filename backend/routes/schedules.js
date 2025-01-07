const express = require("express");
const router = express.Router();
const pool = require("../models/db");

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        e.event_id,
        e.event_name,
        e.date,
        e.start_time,
        e.end_time,
        p.participant_id,
        p.name AS participant_name,
        p.email AS participant_email
      FROM events e
      LEFT JOIN event_participants ep ON e.event_id = ep.event_id
      LEFT JOIN participants p ON ep.participant_id = p.participant_id
      ORDER BY e.date, e.start_time
    `);

    // Group the participants by event
    const schedules = result.rows.reduce((acc, row) => {
      const { event_id, event_name, date, start_time, end_time, participant_id, participant_name, participant_email } = row;
      if (!acc[event_id]) {
        acc[event_id] = {
          event_id,
          event_name,
          date,
          start_time,
          end_time,
          participants: [],
        };
      }
      if (participant_id) {
        acc[event_id].participants.push({
          participant_id,
          participant_name,
          participant_email,
        });
      }
      return acc;
    }, {});

    // Return the schedules as an array of events
    res.json(Object.values(schedules));
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new schedule (event with participants)
router.post('/', async (req, res) => {
  const { event_name, date, start_time, end_time, participant_ids } = req.body;

  try {
    // Insert new event into the events table
    const eventResult = await pool.query(`
      INSERT INTO events (event_name, date, start_time, end_time)
      VALUES ($1, $2, $3, $4) RETURNING event_id
    `, [event_name, date, start_time, end_time]);

    const event_id = eventResult.rows[0].event_id;

    // Insert event-participant relationships into the event_participants table
    const participantInsertPromises = participant_ids.map(participant_id => {
      return pool.query(`
        INSERT INTO event_participants (event_id, participant_id)
        VALUES ($1, $2)
      `, [event_id, participant_id]);
    });

    await Promise.all(participantInsertPromises);

    res.status(201).json({
      message: 'Event and participants created successfully',
      event_id,
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
