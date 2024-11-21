import fetch from 'node-fetch';

const ALPACA_API_KEY = 'PK6H5YCMUHP82J0LM2G6';
const ALPACA_SECRET_KEY = 'qrgOslPfw928dDpIZL4fiDACyPBPJ2bY09CZcQan';
const BASE_URL = 'https://paper-api.alpaca.markets';

async function fetchOptionsContracts(underlyingSymbol) {
  const url = `${BASE_URL}/v2/options/contracts?underlying_symbols=${underlyingSymbol}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'APCA-API-KEY-ID': ALPACA_API_KEY,
      'APCA-API-SECRET-KEY': ALPACA_SECRET_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching options contracts: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

// Example usage
fetchOptionsContracts('AAPL')
  .then(data => console.log(data))
  .catch(error => console.error(error));