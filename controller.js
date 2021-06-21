require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const { apiKey, apiSecret } = process.env;
const apiEP = 'https://api.binance.com/api';
const { sub } = require('date-fns');

const signature = (query) => {
  return crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
};

const api = axios.create({
  baseURL: apiEP,
  headers: { 'X-MBX-APIKEY': apiKey },
});

const getOpenOrders = async (symbol) => {
  try {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}&symbol=${symbol}`;
    const orders = await api.get('/v3/openOrders', {
      params: { timestamp, symbol, signature: signature(query) },
    });
    console.log(orders.data);
  } catch (error) {
    console.log(error.response);
  }
};

const createMarketOrder = async (symbol, side = 'BUY') => {
  const type = 'MARKET';
  try {
    const timestamp = Date.now();
    const query = `symbol=${symbol}&side=${side}&type=${type}&quantity=${5}timestamp=${timestamp}`;
    const order = await api.post('/v3/order/test', {
      params: { timestamp, symbol, side, type, quantity: 5, signature: signature(query) },
    });
    console.log(order);
    return order;
  } catch (error) {
    console.log('error :', error.response);
  }
};

const getCandles = async (symbol, interval) => {
  try {
    const candles = await api.get('/v3/klines', {
      params: {
        interval,
        symbol,
      },
    });
    return candles.data;
  } catch (error) {
    return [];
  }
};

const getLastCandles = async (symbol, interval, q) => {
  let amount = { hours: 0, minutes: 0, days: 0 };
  switch (interval) {
    case '5m':
      amount = { ...amount, minutes: 5 * q };
      break;
    case '15m':
      amount = { ...amount, minutes: 15 * q };
      break;
    case '1h':
      amount = { ...amount, hours: 1 * q };
      break;
    case '4h':
      amount = { ...amount, hours: 4 * q };
      break;
    case '1d':
      amount = { ...amount, days: 1 * q };
      break;
    default:
      break;
  }
  let startTime = sub(new Date(), amount).getTime();

  try {
    const candles = await api.get('/v3/klines', {
      params: {
        interval,
        symbol,
        startTime,
      },
    });
    return candles.data;
  } catch (error) {
    console.log('LAST CANDLES', error);
    return [];
  }
};

module.exports = { getCandles, getOpenOrders, getLastCandles, createMarketOrder };
