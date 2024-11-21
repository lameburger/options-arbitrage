from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

ALPACA_API_KEY = "PK6H5YCMUHP82J0LM2G6"
ALPACA_SECRET_KEY = "qrgOslPfw928dDpIZL4fiDACyPBPJ2bY09CZcQan"
BASE_URL = "https://paper-api.alpaca.markets"
MARKET_DATA_URL = "https://data.alpaca.markets/v2"  # Base URL for Market Data API

@app.route('/options', methods=['GET'])
def get_options():
    underlying_symbol = request.args.get('symbol', default='', type=str)
    expiration_date = request.args.get('expiration_date', default=None, type=str)

    if not underlying_symbol:
        return jsonify({"error": "No symbol provided"}), 400

    # Fetch options data
    url = f"{BASE_URL}/v2/options/contracts"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }
    params = {"underlying_symbols": underlying_symbol}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        return jsonify({"error": f"Error fetching options contracts: {response.status_code}"}), 500

    data = response.json()

    # Ensure option contracts exist
    if "option_contracts" not in data:
        return jsonify({"error": "No option contracts found"}), 404

    # Filter contracts by expiration date if provided
    filtered_contracts = data["option_contracts"]
    if expiration_date:
        filtered_contracts = [
            contract for contract in filtered_contracts
            if contract["expiration_date"] == expiration_date
        ]

    # Calculate arbitrage opportunities
    arbitrage_opportunities = find_arbitrage_opportunities(filtered_contracts)

    return jsonify({
        "filtered_contracts": filtered_contracts,
        "arbitrage_opportunities": arbitrage_opportunities
    })

@app.route('/stock-data', methods=['GET'])
def get_stock_data():
    symbol = request.args.get('symbol')
    if not symbol:
        return jsonify({"error": "Symbol is required"}), 400

    url = f"{MARKET_DATA_URL}/stocks/{symbol}/bars"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }
    params = {
        "timeframe": "1D",  # Daily data
        "limit": 100,  # Fetch last 100 bars
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        return jsonify({"error": f"Failed to fetch stock data: {response.status_code}"}), 500
    return jsonify(response.json())

@app.route('/account', methods=['GET'])
def get_account():
    url = f"{BASE_URL}/v2/account"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return jsonify({"error": f"Error fetching account data: {response.status_code}"}), 500
    return jsonify(response.json())

@app.route('/trade', methods=['POST'])
def trade_option():
    data = request.json
    option_symbol = data.get('option_symbol')
    action = data.get('action')  # "buy" or "sell"
    quantity = data.get('quantity', 1)
    order_type = data.get('type', 'market')  # Default to market order

    # Validate inputs
    if not option_symbol or not action:
        return jsonify({"error": "Invalid input: option_symbol and action are required"}), 400
    if not isinstance(quantity, int) or quantity <= 0:
        return jsonify({"error": "Invalid input: quantity must be a positive whole number"}), 400
    if order_type not in ["market", "limit"]:
        return jsonify({"error": "Invalid input: type must be 'market' or 'limit'"}), 400

    # Log the order data
    print("Order Payload:", {
        "symbol": option_symbol,
        "qty": quantity,
        "side": action,
        "type": order_type,
        "time_in_force": "day"
    })

    # Create order payload
    url = f"{BASE_URL}/v2/orders"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }
    order_data = {
        "symbol": option_symbol,
        "qty": quantity,
        "side": action,
        "type": order_type,
        "time_in_force": "day",  # Required for options
    }

    try:
        # Place order
        response = requests.post(url, json=order_data, headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        # Log error details
        print(f"Error placing order: {e}")
        print(f"Alpaca Response: {response.text if response else 'No response'}")
        return jsonify({"error": f"Error placing order: {response.text}"}), 500


@app.route('/positions', methods=['GET'])
def get_positions():
    url = f"{BASE_URL}/v2/positions"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        return jsonify({"error": f"Failed to fetch positions: {response.status_code}"}), 500
    return jsonify({"positions": response.json()})

def fetch_current_stock_price(symbol):
    url = f"{MARKET_DATA_URL}/stocks/{symbol}/quotes/latest"
    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
    }

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        # Extract price from the "quote" object
        if "quote" in data:
            quote = data["quote"]
            # Use "ap" (ask price) or "bp" (bid price) if available
            if "ap" in quote:
                return float(quote["ap"])  # Ask Price
            elif "bp" in quote:
                return float(quote["bp"])  # Bid Price
        print(f"Price data not available in response: {data}")
        return None
    else:
        print(f"Error fetching stock price for {symbol}: {response.status_code}")
        return None

def find_arbitrage_opportunities(contracts):
    opportunities = []

    # Group contracts by strike price and expiration date
    grouped_contracts = {}
    for contract in contracts:
        key = (contract["strike_price"], contract["expiration_date"])
        if key not in grouped_contracts:
            grouped_contracts[key] = {"calls": [], "puts": []}

        if contract["type"] == "call":
            grouped_contracts[key]["calls"].append(contract)
        elif contract["type"] == "put":
            grouped_contracts[key]["puts"].append(contract)

    # Analyze groups for arbitrage opportunities
    for key, group in grouped_contracts.items():
        strike_price, expiration_date = key
        calls = group["calls"]
        puts = group["puts"]

        if not calls or not puts:
            continue  # Skip if no matching calls and puts

        # Use the first call and put for simplicity
        call = calls[0]
        put = puts[0]

        call_price = float(call["close_price"]) if call["close_price"] else None
        put_price = float(put["close_price"]) if put["close_price"] else None

        # Fetch the actual stock price
        stock_price = fetch_current_stock_price(call["underlying_symbol"])

        # Skip if any essential value is missing
        if call_price is None or put_price is None or stock_price is None:
            continue

        # Calculate theoretical put price
        theoretical_put_price = call_price - stock_price + float(strike_price)

        # Calculate arbitrage opportunity
        arbitrage_amount = abs(put_price - theoretical_put_price)
        if arbitrage_amount > 1:  # Arbitrage threshold
            opportunities.append({
                "strike_price": strike_price,
                "expiration_date": expiration_date,
                "call_symbol": call["symbol"],
                "put_symbol": put["symbol"],
                "call_price": call_price,
                "put_price": put_price,
                "theoretical_put_price": theoretical_put_price,
                "arbitrage_amount": arbitrage_amount
            })

    return opportunities

if __name__ == '__main__':
    app.run(debug=True)