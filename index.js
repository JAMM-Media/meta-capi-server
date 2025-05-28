const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require("cors");
const app = express();

// ✅ CORS should come before anything else
app.use(cors({
  origin: ["https://www.jamm-media.com"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send("✅ Meta CAPI server is running");
});

const PIXEL_ID = process.env.PIXEL_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.post('/lead', async (req, res) => {
  const { hashedEmail, hashedPhone, fbp, fbc } = req.body;

  const event = {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: 'https://www.jamm-media.com',
    user_data: {
      em: [hashedEmail],
      ph: hashedPhone ? [hashedPhone] : undefined,
      fbp: fbp || undefined,
      fbc: fbc || undefined,
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
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Meta CAPI error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to send lead event' });
  }
});

const PORT = parseInt(process.env.PORT) || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Meta CAPI server running on port ${PORT}`);
});

