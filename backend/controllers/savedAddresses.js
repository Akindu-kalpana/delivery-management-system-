const pool = require('../config/db');

// GET all saved addresses for the logged-in user
const getSavedAddresses = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM saved_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ addresses: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST create a new saved address
const createSavedAddress = async (req, res) => {
  const { label, address, is_default = false } = req.body;

  if (!label || !address) {
    return res.status(400).json({ message: 'label and address are required' });
  }

  try {
    // If this is default, unset all other defaults first
    if (is_default) {
      await pool.query(
        'UPDATE saved_addresses SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await pool.query(
      `INSERT INTO saved_addresses (user_id, label, address, is_default)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, label, address, is_default]
    );

    res.status(201).json({
      message: 'Address saved successfully',
      address: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update a saved address
const updateSavedAddress = async (req, res) => {
  const { label, address, is_default } = req.body;
  const { id } = req.params;

  try {
    // Verify ownership
    const existing = await pool.query(
      'SELECT * FROM saved_addresses WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // If setting as default, unset others first
    if (is_default) {
      await pool.query(
        'UPDATE saved_addresses SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await pool.query(
      `UPDATE saved_addresses
       SET label = COALESCE($1, label),
           address = COALESCE($2, address),
           is_default = COALESCE($3, is_default)
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [label, address, is_default, id, req.user.id]
    );

    res.json({
      message: 'Address updated successfully',
      address: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE a saved address
const deleteSavedAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM saved_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getSavedAddresses,
  createSavedAddress,
  updateSavedAddress,
  deleteSavedAddress
};
