const { getMA, getEMA, engulfing } = require("./utils");
const { getCandles, getLastCandles, getOpenOrders, createMarketOrder } = require("./controller");

const pairs = {
  eth: "ETHUSDT",
  rsr: "RSRUSDT",
  link: "LINKUSDT",
  eos: "EOSUSDT",
};

const interval = "1h";

const estrategia = async (pair) => {
  let cruce = false;
  let retest = false;
  let date;
  let buyPrice;
  let sellPrice;
  let sl;
  let candles;
  let ema10;
  let ema20;

  /*1) Wait for an uptrend (EMA 10 crosses ABOVE EMA 20)
    2) Wait for price to breakout then retest the EMAs( either one (based on the trend type))
    3) Wait for bullish confirmation after the retest
    4) Enter after the confirmation candle
    5) Set a stop loss underneath the previous swing-log
    6) Take profit once the EMAs cross the other direction (EMA 10 crosses BELOW EMA 20) */

  while (!cruce) {
    candles = await getCandles(pair, interval);
    ema10 = getEMA(candles, 10, interval);
    ema20 = getEMA(candles, 20, interval);
    if (ema10 > ema20) {
      date = Date.now();
      cruce = true;
    }
  }

  //MANDAR ORDEN

  while (!retest) {
    candles = await getCandles(pair, interval);
    ema10 = getEMA(candles, 10, interval);
    ema20 = getEMA(candles, 20, interval);
    if (candles[candles.length - 1][4] <= ema20 && ema10 > ema20) {
      retest = true;
      buyPrice = candles[candles.length - 1][4];
    }
  }

  console.log(`El precio de compra fue de ${buyPrice}`);

  while (cruce) {
    candles = await getCandles(pair, interval);
    ema10 = getEMA(candles, 10, interval);
    ema20 = getEMA(candles, 20, interval);
    if (ema10 < ema20) {
      cruce = false;
      sellPrice = candles[candles.length - 1][close];
    }
  }

  //VENDER ORDEN

  console.log(`El resultado de la orden fue de ${sellPrice - buyPrice}----${1 - sellPrice / buyPrice}%`);

  estrategia(pair);
};
