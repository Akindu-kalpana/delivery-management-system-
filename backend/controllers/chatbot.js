const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

const chat = async (req, res) => {
  const { messages } = req.body;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are a helpful delivery booking assistant for NKR Delivery (Nopeiden Kuljetusten Ritarit AY), a Finnish delivery company. 
      
Your job is to collect the following information from the user to book a delivery:
1. Sender name
2. Sender phone number
3. Pickup address
4. Receiver name
5. Receiver phone number
6. Delivery address
7. Package description (optional)

Ask for one or two pieces of information at a time in a friendly way. 
When you have collected ALL required information (sender name, sender phone, pickup address, receiver name, receiver phone, delivery address), 
output a JSON block at the end of your message in this exact format:

BOOKING_COMPLETE:
{
  "sender_name": "",
  "sender_phone": "",
  "pickup_address": "",
  "receiver_name": "",
  "receiver_phone": "",
  "delivery_address": "",
  "package_description": ""
}

You must respond in the same language the user is writing in. You support English, Finnish and Russian.
Be friendly, professional and concise.`,
      messages: messages
    });

    const assistantMessage = response.content[0].text;

    // Check if booking is complete
    let bookingData = null;
    if (assistantMessage.includes('BOOKING_COMPLETE:')) {
      const jsonMatch = assistantMessage.match(/BOOKING_COMPLETE:\s*(\{[\s\S]*\})/);
      if (jsonMatch) {
        try {
          bookingData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          bookingData = null;
        }
      }
    }

    res.json({
      message: assistantMessage,
      bookingData: bookingData
    });

  } catch (err) {
    res.status(500).json({ message: 'Chatbot error', error: err.message });
  }
};

module.exports = { chat };
