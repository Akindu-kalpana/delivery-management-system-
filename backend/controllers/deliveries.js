const pool = require('../config/db');

// Create a new delivery
const createDelivery = async (req, res) => {
  const {
    sender_name,
    sender_phone,
    pickup_address,
    receiver_name,
    receiver_phone,
    delivery_address,
    package_description
  } = req.body;

  try {
    const newDelivery = await pool.query(
      `INSERT INTO deliveries 
      (sender_name, sender_phone, pickup_address, receiver_name, receiver_phone, delivery_address, package_description, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [sender_name, sender_phone, pickup_address, receiver_name, receiver_phone, delivery_address, package_description, req.user.id]
    );

    res.status(201).json({
      message: 'Delivery booked successfully',
      delivery: newDelivery.rows[0]
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get deliveries for logged in user
const getUserDeliveries = async (req, res) => {
  try {
    const deliveries = await pool.query(
      'SELECT * FROM deliveries WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ deliveries: deliveries.rows });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get single delivery by id
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await pool.query(
      'SELECT * FROM deliveries WHERE id = $1',
      [req.params.id]
    );

    if (delivery.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json({ delivery: delivery.rows[0] });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get deliveries assigned to driver
const getDriverDeliveries = async (req, res) => {
  try {
    const deliveries = await pool.query(
      'SELECT * FROM deliveries WHERE driver_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({ deliveries: deliveries.rows });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all deliveries for admin
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await pool.query(
      `SELECT d.*, 
        u.name as user_name, 
        u.email as user_email,
        dr.name as driver_name
       FROM deliveries d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN users dr ON d.driver_id = dr.id
       ORDER BY d.created_at DESC`
    );

    res.json({ deliveries: deliveries.rows });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  const { status, driver_id } = req.body;

  try {
    const updated = await pool.query(
      `UPDATE deliveries 
       SET status = $1, driver_id = $2, updated_at = NOW() 
       WHERE id = $3 
       RETURNING *`,
      [status, driver_id, req.params.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json({
      message: 'Delivery status updated',
      delivery: updated.rows[0]
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createDelivery,
  getUserDeliveries,
  getDeliveryById,
  getDriverDeliveries,
  getAllDeliveries,
  updateDeliveryStatus
};