import React, { useState } from "react";
import styles from "./App.module.css";
import TradingViewWidget from "./TradingViewWidget";

const App = () => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState("buy");
  const [status, setStatus] = useState("");
  const [homePage, setHomePage] = useState(true);
  const [expiry, setExpiry] = useState("");
  const [arbitrageData, setArbitrageData] = useState([]);
  const expiryTest = "2025-01-01";

  const placeOrder = async () => {
    try {
      const response = await fetch("http://localhost:4000/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol,
          qty: quantity,
          side: orderType,
        }),
      });
      console.log("Alpaca Key:", process.env.REACT_APP_ALPACA_KEY);
      const data = await response.json();
      setStatus(`Order placed! ID: ${data.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      setStatus("Failed to place order.");
    }
  };

  const fetchArbitrageOpportunities = async () => {
    console.log("fetchArbitrageOpportunities called");
    console.log(
      "URL:",
      `http://localhost:4000/options-chain?symbol=${symbol}&expiry=${expiryTest}`
    );
    setStatus("Fetching arbitrage opportunities...");
    try {
      const response = await fetch(
        `http://localhost:4000/options-chain?symbol=${symbol}&expiry=${expiryTest}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      console.log("Fetched Data:", data);
      setArbitrageData(data.slice(0, 5));
      setStatus("");
    } catch (error) {
      console.error("Error fetching arbitrage data:", error);
      setStatus("Failed to fetch arbitrage data.");
    }
  };

  if (homePage) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.balanceDisplay}>Current Balance: $</div>
        <div className={styles.line}></div>
        <div className={styles.headerContainer}>
          <h1 className={styles.heading}>Options Arbitrage</h1>
          <h2 className={styles.subheading}>Subheading</h2>
          <p className={styles.text}>Text explaining how it works</p>
        </div>

        <div className={styles.contentContainer}>
          <div className={styles.leftSide}>
            <div className={styles.tableContainer}>
              <div className={styles.inputRow}>
                <input
                  type="text"
                  placeholder="Enter stock symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className={styles.inputField}
                />
                <button
                  onClick={fetchArbitrageOpportunities}
                  className={styles.orderButton}
                >
                  Find Arbitrage Opportunities
                </button>
              </div>

              {arbitrageData.map((item, index) => (
                <div key={index} className={styles.tableRow}>
                  <span>{item.symbol}</span>
                  <button className={styles.rowButton}>Button</button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.rightSide}>
            <TradingViewWidget />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Alpaca Options Trader</h1>
      <input
        type="text"
        placeholder="Symbol (e.g., AAPL)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>
      <button onClick={placeOrder}>Place Order</button>
      <p>{status}</p>
    </div>
  );
};

export default App;
