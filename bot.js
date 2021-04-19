require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { apiKey, apiSecret } = process.env;
const apiEP = "https://api.binance.com/api";
const { getMA, getEMA } = require("./utils");

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

const getCandles = async (symbol, interval) => {
  try {
    const candles = await api.get("/v3/klines", {
      params: {
        interval,
        symbol /* , startTime: new Date().setHours(new Date().getHours() - 1)//Si mandamos intervalos de tiempo no calcula EMA */,
      },
    });
    return candles.data;
  } catch (error) {
    console.log("ERROR", error);
  }
};

let interval = "4h";

getCandles(rsr, interval).then((candles) => {
  getMA(candles, 20, interval);
  getEMA(candles, 20, interval);
});
