const { MA, EMA, engulfing, fractal, RSI, MACD, ohlc } = require('./utils');
const {
  getCandles,
  getLastCandles,
  getOpenOrders,
  createMarketOrder,
  getMarketInfo,
} = require('./controller');
const chalk = require('chalk');

const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const estrategia1 = async (pair, interval) => {
  let cruce = true;
  let candles;
  let ema10;
  let ema20;
  let date;
  let buyPrice;
  let sellPrice;
  let sl;

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
    console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
    await sleep(300000);
    console.log(chalk.greenBright('Esperando cruce para vender...'));
    console.log(chalk.magentaBright('-------------------------------'));

    while (cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        ema5 = EMA(candles, 5);
        ema10 = EMA(candles, 10);
        if (ema5 < ema10) {
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

const estrategia2 = async (pair, interval) => {
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

  //A CHEQUEAR

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
  estrategia2(pair);
};

const grid = async (pair, interval) => {
  let resistencia;
  let soporte;
  let grids;

  let amplitud = resistencia - soporte;
  let diferenciaGrillas = amplitud / grids;
  let coeficienteGrillas = diferenciaGrillas / amplitud;

  //SOPORTE - RESISTENCIA - CANTIDAD DE GRILLAS
  /*Con esos tres valores calcular porcentaje entre grillas.
      diferenciaPrecioGrilla = (Resistencia - soporte)/ cantidad de grids
      Crear una orden por grilla dependiendo precio actual. 
      Las grillas arriba del precio actual son ordenes de venta, abajo de compra.
      Monto de orden = ((Monto total * palanca)/ cantidad de grids)*margen 
    */
};

const indicatorTest = (pair, interval) => {
  const handleHour = str => {
    return str.toString().length == 1 ? `0${str}` : str;
  };
  setInterval(async () => {
    let candles = await getCandles(pair, interval);
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    console.log(chalk.cyanBright('PAIR ' + pair));
    console.log(chalk.cyanBright('INTERVAL ' + interval));
    console.log(chalk.cyanBright(`${hours}:${handleHour(minutes)}:${handleHour(seconds)}`));
    let l = candles.length;
    MACD(candles);
    EMA(candles, 5);
    EMA(candles, 10);
    EMA(candles, 20);
    RSI(candles, 14);
    engulfing(candles.slice(l - 3, l - 1));
    fractal(candles);
    console.log('---------------------------');
  }, 5000);
};

module.exports = { estrategia1, estrategia2, grid, indicatorTest };
