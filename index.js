const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const PIXEL_ID = process.env.PIXEL_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Utility function to hash and normalize
function hashData(data) {
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
}

app.post('/lead', async (req, res) => {
  const { email } = req.body;
  const hashedEmail = hashData(email);

  const event = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: 'https://your-squarespace-site.com',
    user_data: {
      em: [hashedEmail],
      client_ip_address: req.ip,
      client_user_agent: req.get('User-Agent')
    },
    attribution_data: {
      attribution_share: 0.3
    }
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
      {
        data: [event],
        access_token: ACCESS_TOKEN,
        test_event_code: 'TEST31032' // Remove this for live events later
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Meta CAPI error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send lead event' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Meta CAPI server running on port ${PORT}`);
});
