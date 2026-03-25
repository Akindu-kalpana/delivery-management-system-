const pool = require('../config/db');

// GET dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      deliveryStats,
      userStats,
      revenueResult,
      complaintResult,
      damageResult
    ] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) AS total_deliveries,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending,
          COUNT(*) FILTER (WHERE status = 'in_transit') AS in_transit,
          COUNT(*) FILTER (WHERE status = 'delivered') AS delivered
        FROM deliveries
      `),
      pool.query(`
        SELECT
          COUNT(*) AS total_users,
          COUNT(*) FILTER (WHERE role = 'driver') AS total_drivers
        FROM users
      `),
      pool.query(`
        SELECT COALESCE(SUM(estimated_price), 0) AS total_revenue
        FROM deliveries
        WHERE status = 'delivered'
      `),
      pool.query(`
        SELECT COUNT(*) AS open_complaints
        FROM complaints
        WHERE status = 'open'
      `),
      pool.query(`
        SELECT COUNT(*) AS pending_damage_claims
        FROM damage_claims
        WHERE status = 'pending'
      `)
    ]);

    const ds = deliveryStats.rows[0];
    const us = userStats.rows[0];

    res.json({
      total_deliveries: parseInt(ds.total_deliveries),
      pending: parseInt(ds.pending),
      in_transit: parseInt(ds.in_transit),
      delivered: parseInt(ds.delivered),
      total_users: parseInt(us.total_users),
      total_drivers: parseInt(us.total_drivers),
      total_revenue: parseFloat(revenueResult.rows[0].total_revenue),
      open_complaints: parseInt(complaintResult.rows[0].open_complaints),
      pending_damage_claims: parseInt(damageResult.rows[0].pending_damage_claims)
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all users with delivery counts
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(d.id) AS delivery_count
      FROM users u
      LEFT JOIN deliveries d ON d.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update user role
const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const { id } = req.params;

  const validRoles = ['user', 'driver', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: `role must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET driver statistics with delivery counts and completion rates
const getDriverStats = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email,
             COUNT(d.id) AS total_assigned,
             COUNT(d.id) FILTER (WHERE d.status = 'delivered') AS completed,
             COUNT(d.id) FILTER (WHERE d.status = 'in_transit') AS in_transit,
             COUNT(d.id) FILTER (WHERE d.status = 'pending') AS pending,
             CASE
               WHEN COUNT(d.id) > 0
               THEN ROUND(COUNT(d.id) FILTER (WHERE d.status = 'delivered') * 100.0 / COUNT(d.id), 2)
               ELSE 0
             END AS completion_rate
      FROM users u
      LEFT JOIN deliveries d ON d.driver_id = u.id
      WHERE u.role = 'driver'
      GROUP BY u.id
      ORDER BY completed DESC
    `);

    res.json({ drivers: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT assign a driver to a delivery
const assignDriver = async (req, res) => {
  const { driver_id } = req.body;
  const { id } = req.params;

  if (!driver_id) {
    return res.status(400).json({ message: 'driver_id is required' });
  }

  try {
    // Verify driver exists and has driver role
    const driverCheck = await pool.query(
      'SELECT id, name FROM users WHERE id = $1 AND role = $2',
      [driver_id, 'driver']
    );

    if (driverCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    const result = await pool.query(
      `UPDATE deliveries
       SET driver_id = $1, status = 'in_transit', updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [driver_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json({
      message: `Driver ${driverCheck.rows[0].name} assigned successfully`,
      delivery: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET monthly delivery analytics for the last 6 months
const getAnalytics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending,
        COUNT(*) FILTER (WHERE status = 'in_transit') AS in_transit,
        COALESCE(SUM(estimated_price) FILTER (WHERE status = 'delivered'), 0) AS revenue
      FROM deliveries
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `);

    res.json({ analytics: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  getDriverStats,
  assignDriver,
  getAnalytics
};
