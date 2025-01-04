const fs = require('fs');
const pool = require('./db');

const schema = fs.readFileSync('./backend/models/schema.sql', 'utf-8');

pool.query(schema)
  .then(() => console.log('Schema applied successfully!'))
  .catch(err => console.error('Error applying schema:', err))
  .finally(() => pool.end());
