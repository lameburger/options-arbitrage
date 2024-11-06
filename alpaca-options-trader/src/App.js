// src/App.js
import React, { useState } from 'react';

const App = () => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('buy');
  const [status, setStatus] = useState('');

  const placeOrder = async () => {
    try {
      const response = await fetch('http://localhost:4000/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      console.error('Error placing order:', error);
      setStatus('Failed to place order.');
    }
  };

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