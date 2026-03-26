const pool = require('../config/db');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// POST create a complaint with optional images — Claude Vision reviews it
const createComplaint = async (req, res) => {
  const { delivery_id, type, description } = req.body;

  if (!type || !description) {
    return res.status(400).json({ message: 'type and description are required' });
  }

  try {
    // Verify delivery belongs to user if provided
    if (delivery_id) {
      const delivery = await pool.query(
        'SELECT id FROM deliveries WHERE id = $1 AND user_id = $2',
        [delivery_id, req.user.id]
      );
      if (delivery.rows.length === 0) {
        return res.status(404).json({ message: 'Delivery not found or does not belong to you' });
      }
    }

    // Process uploaded images (multer stores in req.files as memory buffers)
    const images = req.files || [];
    const imageBase64List = images.map(f => ({
      data: f.buffer.toString('base64'),
      mediaType: f.mimetype,
    }));

    // Store image count info (we don't save actual files, just the base64 in Claude analysis)
    const imagePaths = images.length > 0 ? JSON.stringify(images.map(f => f.originalname)) : null;

    // --- Claude Vision Analysis ---
    let claudeReview = null;
    let refundRecommended = false;
    let refundAmount = 0;

    const policyText = `
NKR Delivery Refund Policy:
- Damaged goods (with photo evidence): 50% to 100% refund based on damage severity
- Lost package (confirmed): 100% refund
- Late delivery (confirmed): 10% to 30% refund based on delay duration
- Wrong address (driver error confirmed): 100% refund
- Wrong address (customer error): No refund
- Other issues with clear evidence: case by case, up to 50%
- Without supporting photo evidence: No refund for damage/loss claims; 10% max for others
Standard delivery value assumed at €50 if no order amount is available.
Refund amounts should be calculated as a percentage of the delivery fee (€50 base).
`;

    const complaintTypes = {
      late_delivery: 'Late Delivery',
      damage: 'Package Damage',
      lost_package: 'Lost Package',
      wrong_address: 'Wrong Address',
      other: 'Other',
    };

    const userMessage = `
You are an AI claims reviewer for NKR Delivery. A customer has filed a complaint.

Complaint Type: ${complaintTypes[type] || type}
Customer Description: ${description}
Number of Evidence Photos Provided: ${images.length}

${policyText}

${images.length > 0 ? 'Please carefully examine the attached photos as evidence for this complaint.' : 'No photos were provided.'}

Based on the complaint type, description, ${images.length > 0 ? 'and the photo evidence' : 'and lack of photo evidence'}, please:
1. Assess whether the complaint is valid and supported by evidence
2. Determine if a refund is warranted according to the policy above
3. If a refund is warranted, specify the exact amount in euros (based on the €50 base delivery value)
4. Provide a clear, professional explanation of your decision

Respond in this exact JSON format:
{
  "valid": true/false,
  "refund_recommended": true/false,
  "refund_amount": <number in euros, 0 if no refund>,
  "summary": "<2-3 sentence professional summary of your assessment>",
  "reason": "<detailed reason for your decision referencing the policy>"
}
`;

    try {
      const messageContent = [];

      // Add images first if present
      for (const img of imageBase64List) {
        messageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mediaType,
            data: img.data,
          },
        });
      }

      // Add text prompt
      messageContent.push({ type: 'text', text: userMessage });

      const claudeResponse = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: messageContent }],
      });

      const rawText = claudeResponse.content[0].text.trim();
      // Extract JSON from response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        refundRecommended = parsed.refund_recommended === true;
        refundAmount = parseFloat(parsed.refund_amount) || 0;
        claudeReview = JSON.stringify({
          valid: parsed.valid,
          refund_recommended: refundRecommended,
          refund_amount: refundAmount,
          summary: parsed.summary,
          reason: parsed.reason,
        });
      } else {
        claudeReview = JSON.stringify({ summary: rawText, refund_recommended: false, refund_amount: 0 });
      }
    } catch (aiErr) {
      console.error('Claude Vision error:', aiErr.message);
      claudeReview = JSON.stringify({ summary: 'Automated review unavailable. Manual review required.', refund_recommended: false, refund_amount: 0 });
    }

    // Save complaint
    const result = await pool.query(
      `INSERT INTO complaints (user_id, delivery_id, type, description, image_paths, claude_review, refund_recommended, refund_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, delivery_id || null, type, description, imagePaths, claudeReview, refundRecommended, refundAmount]
    );

    const complaint = result.rows[0];

    // If Claude recommends a refund, create a refund request (invoice) for admin
    let refundRequest = null;
    if (refundRecommended && refundAmount > 0) {
      const rr = await pool.query(
        `INSERT INTO refund_requests (complaint_id, user_id, amount, claude_analysis, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [complaint.id, req.user.id, refundAmount, claudeReview]
      );
      refundRequest = rr.rows[0];
    }

    const reviewParsed = claudeReview ? JSON.parse(claudeReview) : null;

    res.status(201).json({
      message: 'Complaint submitted successfully',
      complaint,
      claude_review: reviewParsed,
      refund_request: refundRequest,
    });
  } catch (err) {
    console.error('createComplaint error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET all complaints for the logged-in user
const getUserComplaints = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, d.pickup_address, d.delivery_address,
              rr.id as refund_request_id, rr.status as refund_status, rr.amount as refund_amount_req
       FROM complaints c
       LEFT JOIN deliveries d ON c.delivery_id = d.id
       LEFT JOIN refund_requests rr ON rr.complaint_id = c.id
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
              u.name AS user_name, u.email AS user_email,
              d.pickup_address, d.delivery_address
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

// GET all refund requests (admin only)
const getAllRefundRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT rr.*,
              u.name AS user_name, u.email AS user_email,
              c.type AS complaint_type, c.description AS complaint_description,
              c.image_paths, c.delivery_id
       FROM refund_requests rr
       LEFT JOIN users u ON rr.user_id = u.id
       LEFT JOIN complaints c ON rr.complaint_id = c.id
       ORDER BY rr.created_at DESC`
    );
    res.json({ refund_requests: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT approve or decline a refund request (admin only)
const updateRefundRequest = async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  if (!['approved', 'declined'].includes(status)) {
    return res.status(400).json({ message: 'status must be approved or declined' });
  }

  try {
    const result = await pool.query(
      `UPDATE refund_requests
       SET status = $1, admin_notes = $2
       WHERE id = $3
       RETURNING *`,
      [status, admin_notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Refund request not found' });
    }

    // Also update the complaint status
    const rr = result.rows[0];
    await pool.query(
      `UPDATE complaints SET status = $1 WHERE id = $2`,
      [status === 'approved' ? 'resolved' : 'closed', rr.complaint_id]
    );

    res.json({ message: `Refund request ${status}`, refund_request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update complaint status (admin only)
const updateComplaintStatus = async (req, res) => {
  const { status, admin_response } = req.body;
  const { id } = req.params;

  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }

  try {
    const result = await pool.query(
      `UPDATE complaints SET status = $1, admin_response = COALESCE($2, admin_response) WHERE id = $3 RETURNING *`,
      [status, admin_response || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Complaint status updated', complaint: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  getAllRefundRequests,
  updateRefundRequest,
  updateComplaintStatus,
};
