const pool = require('../config/db');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const DAMAGE_SYSTEM_PROMPT = `You are an expert damage assessment specialist for a delivery company. Analyze the provided images of a damaged package and any invoice. Determine: 1) Whether the damage was caused by the delivery service (poor handling, improper packaging by driver) or a product defect (pre-existing damage, manufacturing fault). 2) Estimate refund amount based on visible damage severity and invoice value. Respond in JSON format: { "verdict": "delivery_fault" | "product_defect" | "unclear", "confidence": 0-100, "analysis": "detailed explanation", "estimated_refund_percentage": 0-100, "recommendations": "what should happen next" }`;

// POST create a damage claim
const createDamageClaim = async (req, res) => {
  const { delivery_id, description } = req.body;
  const files = req.files || [];

  if (!delivery_id || !description) {
    return res.status(400).json({ message: 'delivery_id and description are required' });
  }

  if (files.length === 0) {
    return res.status(400).json({ message: 'At least one image is required' });
  }

  try {
    // Verify delivery belongs to user
    const delivery = await pool.query(
      'SELECT * FROM deliveries WHERE id = $1 AND user_id = $2',
      [delivery_id, req.user.id]
    );

    if (delivery.rows.length === 0) {
      return res.status(404).json({ message: 'Delivery not found or does not belong to you' });
    }

    // Convert images to base64 for Claude vision
    const imageContent = files.map((f) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: f.mimetype,
        data: f.buffer.toString('base64')
      }
    }));

    // Add user description as text
    const userContent = [
      ...imageContent,
      {
        type: 'text',
        text: `Package damage description from customer: ${description}\nDelivery ID: ${delivery_id}\n\nPlease analyze the images and provide your damage assessment in the JSON format specified.`
      }
    ];

    // Call Claude with vision
    let aiAnalysis = null;
    let aiVerdict = null;
    let estimatedRefundPercentage = 0;

    try {
      const aiResponse = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: DAMAGE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }]
      });

      const rawText = aiResponse.content[0].text;
      aiAnalysis = rawText;

      // Try to parse the JSON response
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiVerdict = parsed.verdict || 'unclear';
          estimatedRefundPercentage = parsed.estimated_refund_percentage || 0;
        }
      } catch (parseErr) {
        console.error('AI response JSON parse error:', parseErr.message);
        aiVerdict = 'unclear';
      }
    } catch (aiErr) {
      console.error('AI analysis error:', aiErr.message);
      aiAnalysis = 'AI analysis unavailable';
      aiVerdict = 'unclear';
    }

    // Store image filenames or identifiers (using original names from multer)
    const damageImageNames = files.map((f, i) => f.originalname || `image_${i + 1}`);
    const invoiceImageName = damageImageNames[damageImageNames.length - 1] || null;

    // Estimated refund: if we had an invoice value we would compute it;
    // here we store estimated_refund_percentage as the refund until an invoice value is known
    const estimatedRefund = estimatedRefundPercentage;

    const result = await pool.query(
      `INSERT INTO damage_claims
         (user_id, delivery_id, description, damage_images, invoice_image, ai_analysis, ai_verdict, estimated_refund)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        delivery_id,
        description,
        damageImageNames,
        invoiceImageName,
        aiAnalysis,
        aiVerdict,
        estimatedRefund
      ]
    );

    res.status(201).json({
      message: 'Damage claim submitted successfully',
      claim: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all damage claims for the logged-in user
const getUserDamageClaims = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dc.*, d.pickup_address, d.delivery_address, d.status AS delivery_status
       FROM damage_claims dc
       LEFT JOIN deliveries d ON dc.delivery_id = d.id
       WHERE dc.user_id = $1
       ORDER BY dc.created_at DESC`,
      [req.user.id]
    );

    res.json({ claims: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all damage claims (admin only)
const getAllDamageClaims = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT dc.*,
              u.name AS user_name,
              u.email AS user_email,
              d.pickup_address,
              d.delivery_address
       FROM damage_claims dc
       LEFT JOIN users u ON dc.user_id = u.id
       LEFT JOIN deliveries d ON dc.delivery_id = d.id
       ORDER BY dc.created_at DESC`
    );

    res.json({ claims: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT admin decision on a damage claim
const updateDamageClaimDecision = async (req, res) => {
  const { admin_decision, admin_note } = req.body;
  const { id } = req.params;

  if (!admin_decision || !['approved', 'declined'].includes(admin_decision)) {
    return res.status(400).json({ message: 'admin_decision must be "approved" or "declined"' });
  }

  try {
    const result = await pool.query(
      `UPDATE damage_claims
       SET admin_decision = $1,
           admin_note = COALESCE($2, admin_note),
           status = $1
       WHERE id = $3
       RETURNING *`,
      [admin_decision, admin_note || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Damage claim not found' });
    }

    res.json({
      message: 'Damage claim decision updated',
      claim: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createDamageClaim,
  getUserDamageClaims,
  getAllDamageClaims,
  updateDamageClaimDecision
};
