const pool = require('./db');

async function runMigration() {
  try {
    await pool.query(`
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS image_paths TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS claude_review TEXT;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS refund_recommended BOOLEAN DEFAULT FALSE;
      ALTER TABLE complaints ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0;
    `);
    console.log('complaints table updated');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS refund_requests (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER REFERENCES complaints(id),
        user_id INTEGER REFERENCES users(id),
        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        claude_analysis TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('refund_requests table created');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
