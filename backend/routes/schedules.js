const express = require("express");
const router = express.Router();
const pool = require("../models/db");


// get all the scheduled events
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


// Assign participants to already scheduled event
router.post('/:event_id/participants', async (req, res) => {
    const { event_id } = req.params;
  const { participant_ids } = req.body;

  if (!participant_ids || !Array.isArray(participant_ids)) {
    return res.status(400).json({ error: 'Participant IDs are required and must be an array.' });
  }

  try {
    // Validate if the event exists
    const eventCheck = await pool.query('SELECT * FROM events WHERE event_id = $1', [event_id]);
    if (eventCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Insert participants into event_participants table
    const queries = participant_ids.map(async participant_id => {
      const participantCheck = await pool.query('SELECT * FROM participants WHERE participant_id = $1', [participant_id]);

      if (participantCheck.rowCount === 0) {
        throw new Error(`Participant with ID ${participant_id} does not exist.`);
      }

      return pool.query(
        'INSERT INTO event_participants (event_id, participant_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [event_id, participant_id]
      );
    });

    await Promise.all(queries);

    res.status(200).json({ message: 'Participants added successfully.' });
  } catch (error) {
    console.error('Error adding participants:', error.message);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
  });

module.exports = router;
