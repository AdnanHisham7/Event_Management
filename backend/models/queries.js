// const pool = require('./db');

// // Update event by ID
// const updateEventById = async (id, { event_name, description, date, start_time, end_time }) => {
//     const query = `
//         UPDATE events
//         SET 
//             event_name = $1,
//             description = $2,
//             date = $3,
//             start_time = $4,
//             end_time = $5
//         WHERE event_id = $6
//         RETURNING *;
//     `;
//     const values = [event_name, description, date, start_time, end_time, id];
//     const result = await pool.query(query, values);
//     return result.rows[0];
// };

// module.exports = { updateEventById };
