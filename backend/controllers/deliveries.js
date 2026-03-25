const pool = require('../config/db');
const { awardPoints } = require('./loyalty');

// Create a new delivery
const createDelivery = async (req, res) => {
  const {
    sender_name,
    sender_phone,
    pickup_address,
    receiver_name,
    receiver_phone,
    delivery_address,
    package_description,
    delivery_option = 'standard',
    package_size = 'medium',
    package_weight = 1,
    estimated_price,
    driver_instructions
  } = req.body;

  try {
    const newDelivery = await pool.query(
      `INSERT INTO deliveries
        (sender_name, sender_phone, pickup_address, receiver_name, receiver_phone,
         delivery_address, package_description, delivery_option, package_size,
         package_weight, estimated_price, driver_instructions, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        sender_name, sender_phone, pickup_address,
        receiver_name, receiver_phone, delivery_address,
        package_description || null, delivery_option, package_size,
        package_weight, estimated_price || null, driver_instructions || null,
        req.user.id
      ]
    );

    // Award 10 loyalty points for booking a delivery
    try {
      await awardPoints(
        req.user.id,
        10,
        'delivery_booked',
        `Delivery #${newDelivery.rows[0].id} booked`,
        newDelivery.rows[0].id
      );
    } catch (loyaltyErr) {
      console.error('Loyalty points award error:', loyaltyErr.message);
    }

    res.status(201).json({
      message: 'Delivery booked successfully',
      delivery: newDelivery.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get deliveries for logged-in user
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

// Get single delivery by id (auth required)
const getDeliveryById = async (req, res) => {
  try {
    const delivery = await pool.query(
      `SELECT d.*, u.name AS user_name, dr.name AS driver_name
       FROM deliveries d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN users dr ON d.driver_id = dr.id
       WHERE d.id = $1`,
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
      `SELECT d.*, u.name AS user_name, u.phone AS user_phone
       FROM deliveries d
       LEFT JOIN users u ON d.user_id = u.id
       WHERE d.driver_id = $1
       ORDER BY d.created_at DESC`,
      [req.user.id]
    );

    res.json({ deliveries: deliveries.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all deliveries for admin
const getAllDeliveries = async (_req, res) => {
  try {
    const deliveries = await pool.query(
      `SELECT d.*,
              u.name AS user_name,
              u.email AS user_email,
              dr.name AS driver_name
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

// Update delivery status (driver and admin)
const updateDeliveryStatus = async (req, res) => {
  const { status, driver_id } = req.body;

  try {
    const updated = await pool.query(
      `UPDATE deliveries
       SET status = $1, driver_id = COALESCE($2, driver_id), updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, driver_id || null, req.params.id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    // Award loyalty points when delivery is completed
    if (status === 'delivered' && updated.rows[0].user_id) {
      try {
        await awardPoints(
          updated.rows[0].user_id,
          20,
          'delivery_completed',
          `Delivery #${updated.rows[0].id} completed`,
          updated.rows[0].id
        );
      } catch (loyaltyErr) {
        console.error('Loyalty points award error:', loyaltyErr.message);
      }
    }

    res.json({
      message: 'Delivery status updated',
      delivery: updated.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update driver instructions (user can update for pending/in_transit deliveries)
const updateDriverInstructions = async (req, res) => {
  const { driver_instructions } = req.body;
  const { id } = req.params;

  if (driver_instructions === undefined) {
    return res.status(400).json({ message: 'driver_instructions is required' });
  }

  try {
    // Verify ownership and status
    const delivery = await pool.query(
      `SELECT * FROM deliveries WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (delivery.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found or does not belong to you' });
    }

    const allowedStatuses = ['pending', 'in_transit', 'picked_up'];
    if (!allowedStatuses.includes(delivery.rows[0].status)) {
      return res.status(400).json({
        message: `Cannot update instructions for a delivery with status: ${delivery.rows[0].status}`
      });
    }

    const updated = await pool.query(
      `UPDATE deliveries
       SET driver_instructions = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [driver_instructions, id]
    );

    res.json({
      message: 'Driver instructions updated',
      delivery: updated.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET public delivery tracking (no auth required)
const getPublicDelivery = async (req, res) => {
  try {
    const delivery = await pool.query(
      `SELECT id, sender_name, receiver_name, pickup_address, delivery_address,
              status, delivery_option, package_size, created_at, updated_at
       FROM deliveries
       WHERE id = $1`,
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

// GET invoice data for a delivery (auth required, owner or admin)
const generateInvoiceData = async (req, res) => {
  try {
    const delivery = await pool.query(
      `SELECT d.*,
              u.name AS user_name,
              u.email AS user_email,
              dr.name AS driver_name
       FROM deliveries d
       LEFT JOIN users u ON d.user_id = u.id
       LEFT JOIN users dr ON d.driver_id = dr.id
       WHERE d.id = $1`,
      [req.params.id]
    );

    if (delivery.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    const d = delivery.rows[0];

    // Allow owner or admin
    if (d.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      invoice: {
        invoice_number: `NKR-${String(d.id).padStart(6, '0')}`,
        issued_date: new Date().toISOString().split('T')[0],
        delivery_id: d.id,
        status: d.status,
        customer: {
          name: d.user_name,
          email: d.user_email
        },
        sender: {
          name: d.sender_name,
          phone: d.sender_phone,
          address: d.pickup_address
        },
        receiver: {
          name: d.receiver_name,
          phone: d.receiver_phone,
          address: d.delivery_address
        },
        package: {
          description: d.package_description,
          size: d.package_size,
          weight_kg: d.package_weight,
          delivery_option: d.delivery_option
        },
        pricing: {
          estimated_price: d.estimated_price,
          currency: 'EUR'
        },
        driver: d.driver_name,
        created_at: d.created_at,
        updated_at: d.updated_at
      }
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
  updateDeliveryStatus,
  updateDriverInstructions,
  getPublicDelivery,
  generateInvoiceData
};
