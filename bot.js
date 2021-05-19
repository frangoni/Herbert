const { getMA, getEMA, engulfing, fractal, ohlc, macd } = require('./utils');
const { getCandles, getLastCandles, getOpenOrders, createMarketOrder } = require('./controller');

const pairs = {
  eth: 'ETHUSDT',
  rsr: 'RSRUSDT',
  link: 'LINKUSDT',
  eos: 'EOSUSDT',
};

const interval = '1h';

const estrategia1 = async (pair) => {
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
    if (candles[candles.length - 1][ohlc.close] <= ema20 && ema10 > ema20) {
      retest = true;
      buyPrice = candles[candles.length - 1][ohlc.close];
    }
  }

  console.log(`El precio de compra fue de ${buyPrice}`);

  while (!cruce) {
    candles = await getCandles(pair, interval);
    ema10 = getEMA(candles, 10, interval);
    ema20 = getEMA(candles, 20, interval);
    if (ema10 < ema20) {
      cruce = false;
      sellPrice = candles[candles.length - 1][ohlc.close];
    }
    cruce = true;
  }

  //VENDER ORDEN

  console.log(`El resultado de la orden fue de ${sellPrice - buyPrice}----${1 - sellPrice / buyPrice}%`);

  estrategia(pair);
};

const estrategia2 = async (pair) => {
  let buy = false;
  let sell = false;
  let fractal = false;
  let candles;
  let ema20;
  let ema50;
  let ema100;
  let close;

  while (buy || sell) {
    candles = await getCandles(pair, interval);
    ema20 = getEMA(candles, 20, interval);
    ema50 = getEMA(candles, 50, interval);
    ema100 = getEMA(candles, 100, interval);
    close = candles[candles.length - 1][ohlc.close];

    if (ema20 > ema50 && ema50 > ema100) {
      buy = ema20 > close && close > ema50 ? true : false;
    }
    if (ema100 > ema50 && ema50 > ema20) {
      sell = ema20 > close && close > ema50 ? true : false;
    }
  }

  while (fractal) {
    candles = await getLastCandles(pair, interval, 6);
    let trend = fractal(candles);
    if (trend == 'bullish' && buy) {
      /*PLACE BUY ORDER
        SL = EMA 50
        TP = 1.5 x RISK
       ((ep - sl) * 1.5) + ep        
        */
    }
    if (trend == 'bearish' && sell) {
      /*PLACE SELL ORDER
        SL = EMA 50
        TP = -1.5 x RISK        
        ((ep - sl) * -1.5) - ep
        */
    }
  }
};

setTimeout(async () => {
  let candles = await getCandles(pairs.rsr, interval);
  let l = candles.length;
  macd(candles, interval);
  getEMA(candles, 10, interval);
  engulfing(candles.slice(l - 3, l - 1));
  fractal(candles);
  console.log(Date.now());
}, 1000);
