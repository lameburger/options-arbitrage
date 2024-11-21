import React, { useState, useEffect } from 'react';
import { createChart } from 'lightweight-charts';
import './App.css';
import Chart from 'chart.js/auto';
import { MathJaxContext, MathJax } from "better-react-mathjax";
import TradingViewWidget from "./TradingViewWidget";


function App() {
  const [symbol, setSymbol] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [options, setOptions] = useState([]);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState([]);
  const [positions, setPositions] = useState([]); // Added here
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const renderCandlestickChart = (data) => {
    const chart = createChart(document.getElementById('candlestickChart'), {
      width: 600,
      height: 400,
      layout: {
        backgroundColor: '#0d1117',
        textColor: '#ffffff',
      },
      grid: {
        vertLines: { color: '#1c2128' },
        horLines: { color: '#1c2128' },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#21ce99',
      downColor: '#f85149',
      borderVisible: false,
      wickUpColor: '#21ce99',
      wickDownColor: '#f85149',
    });

    // Transform your data into the required format
    const formattedData = data.map((bar) => ({
      time: bar.timestamp, // Ensure timestamp is in seconds
      open: bar.open,
      high: bar.high,
      low: bar.low,
      close: bar.close,
    }));

    candlestickSeries.setData(formattedData);
  };

  const fetchOptions = async () => {
    try {
      setError(null);
      setLoading(true);
      setOptions([]);
      setArbitrageOpportunities([]);

      // Build the query URL with symbol and expiration date
      let url = `http://127.0.0.1:5000/options?symbol=${symbol}`;
      if (expirationDate) {
        url += `&expiration_date=${expirationDate}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch options');
      }
      const data = await response.json();

      if (data.filtered_contracts && data.filtered_contracts.length > 0) {
        setOptions(data.filtered_contracts);
      }
      if (data.arbitrage_opportunities && data.arbitrage_opportunities.length > 0) {
        setArbitrageOpportunities(data.arbitrage_opportunities);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    if (symbol) {
      fetchStockData(symbol);
    }
  }, [symbol]);


  const fetchAccount = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/account');
      if (!response.ok) {
        throw new Error('Failed to fetch account data');
      }
      const data = await response.json();
      setAccount(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStockData = async (symbol) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/stock-data?symbol=${symbol}`);
      if (!response.ok) throw new Error('Failed to fetch stock data');

      const data = await response.json();

      // Use the data for different graphs
      renderCandlestickChart(data.bars);
      renderVolumeChart(data.bars);
      renderMovingAverageChart(data.bars);
    } catch (err) {
      console.error(err.message);
    }
  };


  const fetchPositions = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/positions`); // Backend endpoint
      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }
      const data = await response.json();
      setPositions(data.positions); // Assuming backend returns an array of positions
    } catch (err) {
      console.error(err.message);
    }
  };

  const renderChart = (data, symbol) => {
    const ctx = document.getElementById('stockChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((point) => point.timestamp), // Assuming timestamp for x-axis
        datasets: [
          {
            label: `${symbol} Stock Price`,
            data: data.map((point) => point.close), // Assuming close prices
            borderColor: '#21ce99',
            borderWidth: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            grid: {
              borderDash: [5],
            },
          },
        },
      },
    });
  };

  const renderVolumeChart = (data) => {
    const ctx = document.getElementById('volumeChart').getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map((bar) => bar.timestamp), // Timestamps for x-axis
        datasets: [
          {
            label: 'Volume',
            data: data.map((bar) => bar.volume), // Volume for y-axis
            backgroundColor: '#21ce99',
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            grid: { borderDash: [5] },
          },
        },
      },
    });
  };

  const calculateMovingAverage = (data, windowSize) => {
    return data.map((_, index) => {
      if (index < windowSize) return null; // Not enough data for moving average
      const window = data.slice(index - windowSize, index);
      const sum = window.reduce((total, point) => total + point.close, 0);
      return sum / windowSize;
    });
  };

  const handleRowClick = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOpportunity(null);
  };

  const renderMovingAverageChart = (data) => {
    const ctx = document.getElementById('movingAverageChart').getContext('2d');

    const movingAverage = calculateMovingAverage(data, 5); // 5-day moving average

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map((bar) => bar.timestamp), // Timestamps for x-axis
        datasets: [
          {
            label: 'Stock Price',
            data: data.map((bar) => bar.close), // Closing prices
            borderColor: '#21ce99',
            borderWidth: 2,
          },
          {
            label: '5-Day Moving Average',
            data: movingAverage,
            borderColor: '#f85149',
            borderWidth: 2,
            borderDash: [5],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            grid: { borderDash: [5] },
          },
        },
      },
    });
  };

  useEffect(() => {
    fetchAccount();
    if (symbol) {
      fetchStockData(symbol);
    }
  }, [symbol]);

  const handleTrade = async (optionSymbol, action) => {
    const payload = {
      option_symbol: optionSymbol,
      action: action,
      quantity: 1, // Example value
      type: "market", // Example value
    };
    console.log("Trade Payload:", payload);

    try {
      const response = await fetch('http://127.0.0.1:5000/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error("Failed to execute trade");
      }

      const result = await response.json();
      console.log('Trade executed:', result);
      alert(`Trade successful: ${action.toUpperCase()} ${optionSymbol}`);
    } catch (err) {
      console.error('Error executing trade:', err.message);
      alert(`Error executing trade: ${err.message}`);
    }
  };

  return (
    <MathJaxContext>
      <div className="container">
        {/* Navbar Section */}
        <header className="navbar">
          <h1>(Shitty) Options Arbitrage Finder</h1>
        </header>

        {/* Account Dashboard Section */}
        <div className="card">
          <h2>Account Dashboard</h2>
          {account ? (
            <div>
              <p>Cash Balance: ${account.cash}</p>
              <p>Portfolio Value: ${account.portfolio_value}</p>
            </div>
          ) : (
            <p>Loading account details...</p>
          )}
        </div>

        {/* Stock Market Data Section */}
        <div className="card">
          <h2>Stock Market Data</h2>
          <div className="graph-container">
            <div>
              <TradingViewWidget />
            </div>
          </div>
        </div>

        {/* Current Positions Section */}
        <div className="card">
          <h2>Your Current Positions</h2>
          {positions.length > 0 ? (
            <table className="results-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Quantity</th>
                  <th>Market Value</th>
                  <th>Average Price</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => (
                  <tr key={index}>
                    <td>{position.symbol}</td>
                    <td>{position.qty}</td>
                    <td>${parseFloat(position.market_value).toFixed(2)}</td>
                    <td>${parseFloat(position.avg_entry_price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No positions available</p>
          )}
        </div>

        {/* Search Options Section */}
        <div className="card">
          <h2>Search Options</h2>
          <div className="input-container">
            <input
              type="text"
              placeholder="Enter Stock Symbol (e.g., AAPL)"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="symbol-input"
            />
            <input
              type="date"
              placeholder="Expiration Date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              className="date-input"
            />
            <button onClick={fetchOptions} className="fetch-button" disabled={!symbol}>
              {loading ? 'Fetching...' : 'Fetch Options'}
            </button>
          </div>
        </div>

        {/* Arbitrage Opportunities Section */}
        {arbitrageOpportunities.length > 0 && (
          <div className="card">
            <h2>Arbitrage Opportunities</h2>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Strike Price</th>
                  <th>Expiration Date</th>
                  <th>Call Symbol</th>
                  <th>Put Symbol</th>
                  <th>Call Price</th>
                  <th>Put Price</th>
                  <th>Theoretical Put Price</th>
                  <th>Arbitrage Amount</th>
                </tr>
              </thead>
              <tbody>
                {arbitrageOpportunities.map((opportunity, index) => (
                  <tr key={index} onClick={() => handleRowClick(opportunity)}>
                    <td>{opportunity.strike_price}</td>
                    <td>{opportunity.expiration_date}</td>
                    <td>{opportunity.call_symbol}</td>
                    <td>{opportunity.put_symbol}</td>
                    <td>${opportunity.call_price.toFixed(2)}</td>
                    <td>${opportunity.put_price.toFixed(2)}</td>
                    <td>${opportunity.theoretical_put_price.toFixed(2)}</td>
                    <td>${opportunity.arbitrage_amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Put-Call Parity Calculation */}
        {modalVisible && selectedOpportunity && (
          <div className="modal">
            <div className="modal-content">
              <h2>Put-Call Parity Calculation</h2>
              <p><strong>Formula:</strong></p>
              <p>
                <code>P<sub>theoretical</sub> = C - S + K</code>
              </p>
              <p><strong>Where:</strong></p>
              <ul>
                <li>
                  <strong>P<sub>theoretical</sub></strong>: Theoretical Put Price
                </li>
                <li>
                  <strong>C</strong>: Call Price = ${selectedOpportunity.call_price.toFixed(2)}
                </li>
                <li>
                  <strong>S</strong>: Stock Price (approximated) = ${
                    selectedOpportunity.stock_price ? selectedOpportunity.stock_price.toFixed(2) : "N/A"
                  }
                </li>
                <li>
                  <strong>K</strong>: Strike Price = ${selectedOpportunity.strike_price}
                </li>
              </ul>

              <p><strong>Detailed Calculation:</strong></p>
              <p>
                Using the formula: <code>P<sub>theoretical</sub> = C - S + K</code>, we substitute the values:
              </p>
              <p>
                <code>
                  P<sub>theoretical</sub> = {selectedOpportunity.call_price.toFixed(2)} - ${
                    selectedOpportunity.stock_price
                      ? selectedOpportunity.stock_price.toFixed(2)
                      : "N/A"
                  } + {selectedOpportunity.strike_price}
                </code>
              </p>
              <p>
                <strong>Result:</strong> Theoretical Put Price ={" "}
                {selectedOpportunity.theoretical_put_price.toFixed(2)}
              </p>

              <p>
                <strong>Arbitrage Amount:</strong> The difference between the theoretical and actual put price:
              </p>
              <p>
                <code>
                  Arbitrage Amount = |P<sub>theoretical</sub> - P| = |{selectedOpportunity.theoretical_put_price.toFixed(
                    2
                  )} - {selectedOpportunity.put_price.toFixed(2)}| ={" "}
                  ${selectedOpportunity.arbitrage_amount.toFixed(2)}
                </code>
              </p>

              <p>
                This arbitrage amount represents a potential profit of $
                {selectedOpportunity.arbitrage_amount.toFixed(2)} per share (or $
                {(selectedOpportunity.arbitrage_amount * 100).toFixed(2)} per options contract).
              </p>

              <div className="trade-buttons">
                <button
                  className="button"
                  onClick={() => handleTrade(selectedOpportunity.call_symbol, "buy")}
                >
                  Buy Call
                </button>
                <button
                  className="button"
                  onClick={() => handleTrade(selectedOpportunity.put_symbol, "buy")}
                >
                  Buy Put
                </button>
                <button
                  className="button"
                  onClick={() => handleTrade(selectedOpportunity.call_symbol, "sell")}
                >
                  Sell Call
                </button>
                <button
                  className="button"
                  onClick={() => handleTrade(selectedOpportunity.put_symbol, "sell")}
                >
                  Sell Put
                </button>
              </div>
              <button className="button close-button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </MathJaxContext>
  );
}

export default App;