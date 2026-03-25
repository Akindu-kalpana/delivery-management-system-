const pool = require('../config/db');

// Determine loyalty level based on total_earned
const getLevel = (totalEarned) => {
  if (totalEarned >= 1000) return 'platinum';
  if (totalEarned >= 500)  return 'gold';
  if (totalEarned >= 100)  return 'silver';
  return 'bronze';
};

// Internal function: award points to a user
const awardPoints = async (userId, points, type, description, deliveryId = null) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Upsert loyalty_points row
    const upsertResult = await client.query(
      `INSERT INTO loyalty_points (user_id, points, total_earned, level, updated_at)
       VALUES ($1, $2, $2, $3, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET points = loyalty_points.points + $2,
             total_earned = loyalty_points.total_earned + $2,
             level = $3,
             updated_at = NOW()
       RETURNING *`,
      [userId, points, 'bronze'] // level will be recalculated below
    );

    const newTotalEarned = upsertResult.rows[0].total_earned;
    const newLevel = getLevel(newTotalEarned);

    // Update level to the correct value
    await client.query(
      'UPDATE loyalty_points SET level = $1 WHERE user_id = $2',
      [newLevel, userId]
    );

    // Insert transaction record
    await client.query(
      `INSERT INTO loyalty_transactions (user_id, points, type, description, delivery_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, points, type, description, deliveryId]
    );

    await client.query('COMMIT');

    return { points: upsertResult.rows[0].points + points, total_earned: newTotalEarned, level: newLevel };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// GET loyalty info for logged-in user
const getLoyaltyInfo = async (req, res) => {
  try {
    // Get points summary
    const pointsResult = await pool.query(
      `SELECT * FROM loyalty_points WHERE user_id = $1`,
      [req.user.id]
    );

    // Get transaction history
    const transactionsResult = await pool.query(
      `SELECT lt.*, d.pickup_address, d.delivery_address
       FROM loyalty_transactions lt
       LEFT JOIN deliveries d ON lt.delivery_id = d.id
       WHERE lt.user_id = $1
       ORDER BY lt.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    const loyalty = pointsResult.rows[0] || {
      user_id: req.user.id,
      points: 0,
      total_earned: 0,
      level: 'bronze'
    };

    res.json({
      loyalty,
      transactions: transactionsResult.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST redeem points for a discount
const redeemPoints = async (req, res) => {
  const { points_to_redeem } = req.body;

  if (!points_to_redeem || points_to_redeem <= 0) {
    return res.status(400).json({ message: 'points_to_redeem must be a positive number' });
  }

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // Get current points with row lock
    const pointsResult = await dbClient.query(
      'SELECT * FROM loyalty_points WHERE user_id = $1 FOR UPDATE',
      [req.user.id]
    );

    if (pointsResult.rows.length === 0 || pointsResult.rows[0].points < points_to_redeem) {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient points' });
    }

    const currentPoints = pointsResult.rows[0].points;
    const newPoints = currentPoints - points_to_redeem;
    const discountAmount = points_to_redeem * 0.05; // 1 point = €0.05

    // Deduct points
    await dbClient.query(
      `UPDATE loyalty_points
       SET points = $1, updated_at = NOW()
       WHERE user_id = $2`,
      [newPoints, req.user.id]
    );

    // Record redemption transaction (negative points)
    await dbClient.query(
      `INSERT INTO loyalty_transactions (user_id, points, type, description)
       VALUES ($1, $2, 'redemption', $3)`,
      [req.user.id, -points_to_redeem, `Redeemed ${points_to_redeem} points for €${discountAmount.toFixed(2)} discount`]
    );

    await dbClient.query('COMMIT');

    res.json({
      message: 'Points redeemed successfully',
      points_redeemed: points_to_redeem,
      discount_amount: discountAmount,
      remaining_points: newPoints
    });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    dbClient.release();
  }
};

module.exports = {
  getLoyaltyInfo,
  awardPoints,
  redeemPoints
};
