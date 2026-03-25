const pool = require('../config/db');

// POST create a complaint (user)
const createComplaint = async (req, res) => {
  const { delivery_id, type, description } = req.body;

  if (!type || !description) {
    return res.status(400).json({ message: 'type and description are required' });
  }

  try {
    // If delivery_id provided, verify it belongs to the user
    if (delivery_id) {
      const delivery = await pool.query(
        'SELECT id FROM deliveries WHERE id = $1 AND user_id = $2',
        [delivery_id, req.user.id]
      );
      if (delivery.rows.length === 0) {
        return res.status(404).json({ message: 'Delivery not found or does not belong to you' });
      }
    }

    const result = await pool.query(
      `INSERT INTO complaints (user_id, delivery_id, type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, delivery_id || null, type, description]
    );

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all complaints for the logged-in user
const getUserComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, d.pickup_address, d.delivery_address
       FROM complaints c
       LEFT JOIN deliveries d ON c.delivery_id = d.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json({ complaints: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all complaints (admin only)
const getAllComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              u.name AS user_name,
              u.email AS user_email,
              d.pickup_address,
              d.delivery_address
       FROM complaints c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN deliveries d ON c.delivery_id = d.id
       ORDER BY c.created_at DESC`
    );

    res.json({ complaints: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update complaint status and optionally add admin response (admin only)
const updateComplaintStatus = async (req, res) => {
  const { status, admin_response } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE complaints
       SET status = $1,
           admin_response = COALESCE($2, admin_response)
       WHERE id = $3
       RETURNING *`,
      [status, admin_response || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({
      message: 'Complaint status updated',
      complaint: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  updateComplaintStatus
};
