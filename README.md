# **Options Arbitrage Finder**

A modern web application for identifying arbitrage opportunities in the options market, calculating put-call parity, and executing trades using Alpaca’s API.

---

## **Features**
- Search for options contracts by stock symbol and expiration date.
- Calculate theoretical put prices using the Put-Call Parity formula.
- Highlight arbitrage opportunities with detailed calculations.
- Execute buy/sell orders directly for call and put options.
- Visualize stock market data using candlestick and volume charts.
- Manage your portfolio and track your current positions.

---

## **Getting Started**

### **1. Prerequisites**
Make sure you have the following installed on your system:
- **Node.js** (v14.x or later)
- **npm** (v6.x or later)
- **Python** (v3.8 or later)
- **pip** (for installing Python dependencies)

---

### **2. Clone the Repository**
```bash
git clone https://github.com/your-username/options-arbitrage-finder.git
cd options-arbitrage-finder
```
buttons in the modal to execute trades for call or put options.

### **Step 5: Track Your Portfolio**
- View your current positions and account balance in the **Account Dashboard** and **Your Current Positions** sections.

---

## **Technical Details**

### **Backend API Endpoints**
- **`/options`**:
  - Fetch options contracts by stock symbol and expiration date.
- **`/stock-data`**:
  - Fetch live stock price and market data.
- **`/account`**:
  - Retrieve account details such as cash balance and portfolio value.
- **`/positions`**:
  - Fetch current portfolio positions.
- **`/trade`**:
  - Place buy or sell orders for options.

### **Frontend Components**
- **TradingViewWidget**:
  - Displays an advanced stock chart with real-time updates.
- **Candlestick & Volume Charts**:
  - Visualize stock market data with historical trends.
- **Interactive Modal**:
  - Displays put-call parity calculations with trade execution options.

---

## **Libraries Used**

### **Frontend**
- `react`: For building the user interface.
- `chart.js`: For rendering stock price and volume charts.
- `lightweight-charts`: For candlestick and financial charts.
- `react-scripts`: For managing development workflows.

### **Backend**
- `Flask`: A Python web framework for building the backend.
- `Flask-Cors`: To handle Cross-Origin Resource Sharing (CORS).
- `requests`: For making API calls to Alpaca.
