require('dotenv').config();
const WebSocket = require('ws');
const crypto = require('crypto');
const { apiKey, apiSecret } = process.env;
const socketURL = 'wss://fstream.binance.com';

const createKlineStream = (symbol, interval) => {
  const query = `${symbol.toLowerCase()}@kline_${interval}`;
  /*  const signature = crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
  const queryString = `stream=${query}&listenKey=${signature}`; */
  const url = `${socketURL}/ws/${query}`;
  const ws = new WebSocket(url);
  return ws;
};

let ws = createKlineStream('ETHUSDT', '1m');

/* ws.on('message', data => {
  if (data) {
    const trade = JSON.parse(data); // parsing single-trade record
    console.log(trade);
  }
}); */
