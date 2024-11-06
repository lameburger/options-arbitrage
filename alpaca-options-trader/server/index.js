const Alpaca = require('@alpacahq/alpaca-trade-api');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const alpaca = new Alpaca({
  keyId: 'PKRF0P3GA3XA473RV6M8',
  secretKey: 'dUpJRMDNbHusmn5wbPLCRdY4JAMYJJOzBFZPSE8a',
  paper: true,
});

app.post('/trade', async (req, res) => {
  const { symbol, qty, side } = req.body;
  try {
    const order = await alpaca.createOrder({
      symbol,
      qty,
      side,
      type: 'market',
      time_in_force: 'gtc',
    });
    res.json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4000, () => {
  console.log('Server is running on http://localhost:4000');
});