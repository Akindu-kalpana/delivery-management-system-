const Anthropic = require('@anthropic-ai/sdk');
const pool = require('../config/db');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

const SYSTEM_PROMPT = `You are Alex, a friendly and professional AI customer service agent for NKR Delivery (Nopeiden Kuljetusten Ritarit AY), a Finnish delivery company.

You can help with:
1. BOOKING: Collect delivery information and book deliveries
   Required: sender_name, sender_phone, pickup_address, receiver_name, receiver_phone, delivery_address
   Optional: package_description, delivery_option (standard/express/same_day), package_size (xs/small/medium/large/xl)

2. TRACKING: Help users check their delivery status
   - If the user provides a delivery ID, acknowledge it and let them know you can look it up

3. COMPLAINTS: Help users file complaints
   - Collect: delivery_id (if applicable), complaint type (late_delivery/damage/lost_package/wrong_address/other), and a description

4. GENERAL INFO: Answer questions about services, pricing, company
   - Standard delivery: from €4.99, typically 2-3 business days
   - Express delivery: from €9.99, next business day
   - Same-day delivery: from €19.99, delivered same day (order before 12:00)
   - Package sizes: XS (under 1kg), Small (1-5kg), Medium (5-15kg), Large (15-30kg), XL (30kg+)
   - Operating areas: Finland (nationwide)
   - Contact: support@nkrdelivery.fi | +358 10 123 4567
   - Business hours: Mon-Fri 08:00-18:00, Sat 09:00-14:00

When booking is complete (you have all required fields), output this block at the end of your message:
BOOKING_COMPLETE:
{ "sender_name":"","sender_phone":"","pickup_address":"","receiver_name":"","receiver_phone":"","delivery_address":"","package_description":"","delivery_option":"standard","package_size":"medium" }

When user wants to file a complaint, output this block at the end of your message:
COMPLAINT_INTENT:
{ "delivery_id": null, "type": "late_delivery|damage|lost_package|wrong_address|other", "description": "..." }

IMPORTANT RULES:
- Detect the user's language and respond in the SAME language (English, Finnish, Russian, or Swedish)
- Finnish: respond in Finnish. Russian: respond in Russian. Swedish: respond in Swedish.
- Be warm, helpful, and solution-oriented
- Ask one or two questions at a time — never overwhelm the user
- If the user seems frustrated, be extra empathetic and apologetic
- For bookings: ask for required fields one step at a time, confirm details before outputting BOOKING_COMPLETE
- Never invent tracking data — only reference delivery IDs the user provides`;

const chat = async (req, res) => {
  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ message: 'messages array is required' });
  }

  try {
    // If context includes a delivery_id, optionally fetch its status to provide accurate info
    let contextNote = '';
    if (context && context.delivery_id) {
      try {
        const deliveryResult = await pool.query(
          `SELECT id, sender_name, receiver_name, status, delivery_option, created_at, updated_at
           FROM deliveries WHERE id = $1`,
          [context.delivery_id]
        );
        if (deliveryResult.rows.length > 0) {
          const d = deliveryResult.rows[0];
          contextNote = `\n\n[SYSTEM CONTEXT - DO NOT REVEAL DIRECTLY]: Delivery #${d.id} status: ${d.status}, option: ${d.delivery_option}, created: ${d.created_at}, last updated: ${d.updated_at}]`;
        }
      } catch (_e) {
        // ignore context fetch errors
      }
    }

    const systemWithContext = contextNote
      ? SYSTEM_PROMPT + contextNote
      : SYSTEM_PROMPT;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemWithContext,
      messages: messages
    });

    const assistantMessage = response.content[0].text;

    // Parse BOOKING_COMPLETE block
    let bookingData = null;
    if (assistantMessage.includes('BOOKING_COMPLETE:')) {
      const jsonMatch = assistantMessage.match(/BOOKING_COMPLETE:\s*(\{[\s\S]*?\})\s*(?:$|\n\n)/);
      if (jsonMatch) {
        try {
          bookingData = JSON.parse(jsonMatch[1]);
        } catch (_e) {
          bookingData = null;
        }
      }
      // Fallback: try to grab the first JSON object after the marker
      if (!bookingData) {
        const fallbackMatch = assistantMessage.match(/BOOKING_COMPLETE:\s*(\{[\s\S]*\})/);
        if (fallbackMatch) {
          try {
            bookingData = JSON.parse(fallbackMatch[1]);
          } catch (_e) {
            bookingData = null;
          }
        }
      }
    }

    // Parse COMPLAINT_INTENT block
    let complaintData = null;
    if (assistantMessage.includes('COMPLAINT_INTENT:')) {
      const jsonMatch = assistantMessage.match(/COMPLAINT_INTENT:\s*(\{[\s\S]*?\})\s*(?:$|\n\n)/);
      if (jsonMatch) {
        try {
          complaintData = JSON.parse(jsonMatch[1]);
        } catch (_e) {
          complaintData = null;
        }
      }
      if (!complaintData) {
        const fallbackMatch = assistantMessage.match(/COMPLAINT_INTENT:\s*(\{[\s\S]*\})/);
        if (fallbackMatch) {
          try {
            complaintData = JSON.parse(fallbackMatch[1]);
          } catch (_e) {
            complaintData = null;
          }
        }
      }
    }

    res.json({
      message: assistantMessage,
      bookingData: bookingData,
      complaintData: complaintData
    });
  } catch (err) {
    res.status(500).json({ message: 'Chatbot error', error: err.message });
  }
};

module.exports = { chat };
