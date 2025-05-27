const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
app.use(express.json());

const PIXEL_ID = process.env.PIXEL_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

app.post('/purchase', async (req, res) => {
  const { email, phone, value, currency } = req.body;

  const event = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    user_data: {
      em: [hashData(email)],
      ph: [hashData(phone)],
    },
    custom_data: {
      currency,
      value,
    },
    action_source: 'website',
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`,
      {
        data: [event],
        access_token: ACCESS_TOKEN,
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Failed to send event');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Meta CAPI server running on port ${PORT}`);
});
