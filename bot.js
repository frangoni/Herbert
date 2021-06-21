const { MA, EMA, engulfing, fractal, RSI, MACD, ohlc } = require('./utils');
const { getCandles, getLastCandles, getOpenOrders, createMarketOrder } = require('./controller');
const { greet } = require('./greet');
const chalk = require('chalk');
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const pairs = {
  eth: 'ETHUSDT',
  rsr: 'RSRUSDT',
  link: 'LINKUSDT',
  eos: 'EOSUSDT',
  linketh: 'LINKETH',
};
const interval = '5m';

const estrategia1 = async (pair) => {
  let cruce = true;
  let retest = false;
  let candles;
  let ema10;
  let ema20;
  let date;
  let buyPrice;
  let sellPrice;
  let sl;

  /*1) Wait for an uptrend (EMA 10 crosses ABOVE EMA 20)
    2) Wait for price to breakout then retest the EMAs( either one (based on the trend type))
    3) Wait for bullish confirmation after the retest
    4) Enter after the confirmation candle
    5) Set a stop loss underneath the previous swing-log
    6) Take profit once the EMAs cross the other direction (EMA 10 crosses BELOW EMA 20) */

  //ARRANCAR CON EMA10 YA ARRIBA
  try {
    while (cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        ema10 = EMA(candles, 10);
        ema20 = EMA(candles, 20);
        if (ema10 < ema20) {
          date = Date.now();
          cruce = false;
        }
      }
    }

    console.log(chalk.greenBright('Testeando cruce de EMAs...'));
    console.log(chalk.magentaBright('-------------------------------'));

    while (!cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        ema20 = EMA(candles, 20);
        ema10 = EMA(candles, 10);

        if (ema10 > ema20 * 1.00005) {
          date = Date.now();
          cruce = true;
          buyPrice = candles[candles.length - 1][ohlc.close];
        }
      }
    }

    console.log(chalk.magentaBright(new Date()));
    console.log(chalk.greenBright('CRUZÓ'));

    /* 
  console.log(chalk.greenBright('Retesteando...'));
  console.log(chalk.magentaBright('-------------------------------'));

  while (!retest) {
    candles = await getCandles(pair, interval);
    if (candles?.length) {
      ema10 = EMA(candles, 10);
      ema20 = EMA(candles, 20);
      if (candles[candles.length - 1][ohlc.low] <= ema20 && ema10 > ema20) {
        retest = true;
        buyPrice = candles[candles.length - 1][ohlc.close];
      }
    }
  } 
  console.log(chalk.magentaBright(new Date()));*/
    console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
    await sleep(300000);
    console.log(chalk.greenBright('Esperando cruce para vender...'));
    console.log(chalk.magentaBright('-------------------------------'));

    while (cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        ema10 = EMA(candles, 10);
        ema20 = EMA(candles, 20);
        if (ema10 < ema20) {
          cruce = false;
          sellPrice = candles[candles.length - 1][ohlc.close];
        }
      }
    }
    //VENDER ORDEN
    console.log(chalk.magentaBright(new Date()));
    console.log(chalk.greenBright(`El precio de venta fue de ${sellPrice}`));
    const result = `El resultado de la orden fue de ${(sellPrice / buyPrice - 1) * 100}%`;
    let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;
    console.log(color(result));
  } catch (error) {
    console.log('error :', error);
  }
  estrategia1(pair);
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
    ema20 = EMA(candles, 20);
    ema50 = EMA(candles, 50);
    ema100 = EMA(candles, 100);
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

const indicatorTest = () => {
  setInterval(async () => {
    let candles = await getCandles(pairs.rsr, interval);
    console.log(chalk.cyanBright('PAIR ' + pairs.rsr));
    console.log(chalk.cyanBright('INTERVAL ' + interval));
    console.log(chalk.cyanBright(`${new Date().getHours()}:${new Date().getMinutes()}`));
    let l = candles.length;
    /*   MACD(candles);
  EMA(candles, 10);
  RSI(candles, 14); */
    engulfing(candles.slice(l - 3, l - 1));
    fractal(candles);
    console.log('---------------------------');
  }, 60000);
};

greet();
estrategia1(pairs.linketh);
