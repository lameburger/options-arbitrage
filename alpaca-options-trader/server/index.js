const Alpaca = require("@alpacahq/alpaca-trade-api");
const express = require("express");
const cors = require("cors");
const fetchOptionsChain = async (url) => {
  const fetch = (await import("node-fetch")).default;
  return fetch(url);
};
const app = express();
app.use(cors());

const alpaca = new Alpaca({
  keyId: "PKRF0P3GA3XA473RV6M8",
  secretKey: "dUpJRMDNbHusmn5wbPLCRdY4JAMYJJOzBFZPSE8a",
  paper: true,
});

app.post("/trade-option", express.json(), async (req, res) => {
  const { symbol, qty, side, type, strikePrice, expiry, optionType } = req.body;
  try {
    const order = await alpaca.createOrder({
      asset_class: "option",
      symbol,
      qty,
      side,
      type, // 'market' or 'limit'
      time_in_force: "gtc", // Good-till-cancelled
      option_type: optionType, // 'call' or 'put'
      strike: strikePrice, // e.g., 100 for $100 strike price
      expiry, // Format: 'YYYY-MM-DD'
    });
    res.json(order);
  } catch (error) {
    console.error("Error placing options order:", error);
    res.status(500).json({ error: error.message });
  }
});

// New route to fetch options chain
app.get("/options-chain", async (req, res) => {
  const { symbol, expiry } = req.query;

  try {
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(
      `https://api.polygon.io/v3/reference/options/contracts?underlying_symbol=${symbol}&expiration_date=${expiry}&apiKey=I78THoDlEeyjVhSe5oY74CZMXkbjlCUC`
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch options data: ${response.status} - ${response.statusText}`
      );
      const errorText = await response.text();
      console.error("Error details:", errorText); // Log detailed error message from API
      throw new Error("Failed to fetch options data");
    }

    const data = await response.json();
    res.json(data.results);
  } catch (error) {
    console.error("Error fetching options chain:", error);
    res.status(500).json({ error: "Failed to retrieve options data" });
  }
});

app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});
