const pool = require('./db');
const fs = require('fs');
const path = require('path');

const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

pool.query(sql, (err, res) => {
  if (err) {
    console.error('Error creating tables:', err.message);
  } else {
    console.log('Tables created successfully');
  }
  process.exit();
});
