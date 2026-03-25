const pool = require('../config/db');
const Anthropic = require('@anthropic-ai/sdk');
const { awardPoints } = require('./loyalty');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const BULK_SYSTEM_PROMPT = `You are a data extraction specialist. Extract delivery information from the provided data. Each delivery needs: sender_name, sender_phone, pickup_address, receiver_name, receiver_phone, delivery_address, package_description (optional), delivery_option (standard/express/same_day, default standard), package_size (xs/small/medium/large/xl, default medium). Return ONLY valid JSON array: [{...}, {...}]`;

// POST process a bulk order (extract deliveries from raw content)
const processBulkOrder = async (req, res) => {
  const { raw_content, filename } = req.body;

  // If a file was uploaded, use its text content
  let content = raw_content;
  if (!content && req.file) {
    content = req.file.buffer.toString('utf-8');
  }

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ message: 'raw_content or file is required' });
  }

  try {
    // Call Claude with extended thinking
    const aiResponse = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      thinking: { type: 'enabled', budget_tokens: 10000 },
      system: BULK_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: content }]
    });

    // Get text content only (skip thinking blocks)
    const textBlock = aiResponse.content.find((b) => b.type === 'text');

    if (!textBlock) {
      return res.status(500).json({ message: 'AI did not return usable content' });
    }

    let extractedDeliveries = [];
    try {
      // Extract JSON array from text
      const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        extractedDeliveries = JSON.parse(jsonMatch[0]);
      } else {
        extractedDeliveries = JSON.parse(textBlock.text);
      }
    } catch (parseErr) {
      return res.status(500).json({
        message: 'Failed to parse AI response as JSON',
        raw_response: textBlock.text
      });
    }

    // Store in bulk_orders table
    const result = await pool.query(
      `INSERT INTO bulk_orders (user_id, filename, raw_content, extracted_deliveries, status)
       VALUES ($1, $2, $3, $4, 'ready')
       RETURNING *`,
      [
        req.user.id,
        filename || (req.file ? req.file.originalname : 'bulk_upload'),
        content,
        JSON.stringify(extractedDeliveries)
      ]
    );

    res.status(201).json({
      message: 'Bulk order processed successfully',
      bulk_order: result.rows[0],
      extracted_deliveries: extractedDeliveries,
      count: extractedDeliveries.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST confirm a bulk order (create all deliveries)
const confirmBulkOrder = async (req, res) => {
  const { bulk_order_id, deliveries } = req.body;

  if (!bulk_order_id || !Array.isArray(deliveries) || deliveries.length === 0) {
    return res.status(400).json({ message: 'bulk_order_id and deliveries array are required' });
  }

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // Verify bulk order belongs to user
    const bulkOrder = await dbClient.query(
      'SELECT * FROM bulk_orders WHERE id = $1 AND user_id = $2',
      [bulk_order_id, req.user.id]
    );

    if (bulkOrder.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ message: 'Bulk order not found or does not belong to you' });
    }

    if (bulkOrder.rows[0].status === 'confirmed') {
      await dbClient.query('ROLLBACK');
      return res.status(400).json({ message: 'Bulk order has already been confirmed' });
    }

    const createdDeliveries = [];

    for (const delivery of deliveries) {
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
        package_weight,
        estimated_price
      } = delivery;

      // Validate required fields
      if (!sender_name || !sender_phone || !pickup_address || !receiver_name || !receiver_phone || !delivery_address) {
        continue; // skip invalid deliveries
      }

      const newDelivery = await dbClient.query(
        `INSERT INTO deliveries
           (sender_name, sender_phone, pickup_address, receiver_name, receiver_phone,
            delivery_address, package_description, delivery_option, package_size,
            package_weight, estimated_price, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          sender_name, sender_phone, pickup_address,
          receiver_name, receiver_phone, delivery_address,
          package_description || null, delivery_option, package_size,
          package_weight || 1, estimated_price || null, req.user.id
        ]
      );

      createdDeliveries.push(newDelivery.rows[0]);
    }

    // Update bulk order status to confirmed
    await dbClient.query(
      `UPDATE bulk_orders
       SET status = 'confirmed', confirmed_at = NOW()
       WHERE id = $1`,
      [bulk_order_id]
    );

    await dbClient.query('COMMIT');

    // Award loyalty points: 10 per confirmed delivery (outside transaction)
    try {
      if (createdDeliveries.length > 0) {
        await awardPoints(
          req.user.id,
          createdDeliveries.length * 10,
          'bulk_order',
          `Bulk order confirmed: ${createdDeliveries.length} deliveries booked`,
          null
        );
      }
    } catch (loyaltyErr) {
      console.error('Loyalty points award error:', loyaltyErr.message);
    }

    res.json({
      message: `Bulk order confirmed. ${createdDeliveries.length} deliveries created.`,
      deliveries: createdDeliveries,
      loyalty_points_awarded: createdDeliveries.length * 10
    });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    dbClient.release();
  }
};

// GET all bulk orders for the logged-in user
const getUserBulkOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, filename, status, confirmed_at, created_at,
              jsonb_array_length(extracted_deliveries) AS delivery_count
       FROM bulk_orders
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ bulk_orders: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  processBulkOrder,
  confirmBulkOrder,
  getUserBulkOrders
};
