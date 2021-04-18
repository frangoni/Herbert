require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { apiKey, apiSecret } = process.env;
const apiEP = "https://api.binance.com/api";
const { getMA } = require("./utils");

const signature = (query) => {
  return crypto.createHmac("sha256", apiSecret).update(query).digest("hex");
};

const api = axios.create({
  baseURL: apiEP,
  headers: { "X-MBX-APIKEY": apiKey },
});

const eth = "ETHUSDT";
const rsr = "RSRUSDT";

const getMyOrders = async (symbol) => {
  try {
    const timestamp = Date.now();
    const query = `timestamp=${timestamp}&symbol=${symbol}`;
    const orderss = await api.get("/v3/allOrders", {
      params: { timestamp, symbol, signature: signature(query) },
    });
    console.log(orderss);
  } catch (error) {
    console.log("error");
    console.log(error.response);
  }
};

// getMyOrders(rsr);

const getCandles = async (symbol, interval) => {
  try {
    const candles = await api.get("/v3/klines", {
      params: { interval, symbol /* , startTime: new Date().setHours(new Date().getHours() - 1) */ },
    });
    return candles.data;
  } catch (error) {
    console.log("ERROR", error);
  }
};

let interval = "1h";

getCandles(rsr, interval).then((candles) => getMA(candles, 200, interval));
