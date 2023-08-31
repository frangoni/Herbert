const chalk = require("chalk");
const {
  MA,
  EMA,
  engulfing,
  fractal,
  RSI,
  MACD,
  ohlc,
  bollingerBands,
} = require("./indicators");
const {
  getCandles,
  getLastCandles,
  getOpenOrders,
  createMarketOrder,
  getMarketInfo,
} = require("./controller");

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const EMAcross = async (pair, interval) => {
  let cruce = true;
  let candles;
  let ema5, ema10, ema20;
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

    console.log(chalk.greenBright("Testeando cruce de EMAs..."));
    console.log(chalk.magentaBright("-------------------------------"));

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
    console.log(chalk.greenBright("CRUZÓ"));
    console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
    await sleep(300000);
    console.log(chalk.greenBright("Esperando cruce para vender..."));
    console.log(chalk.magentaBright("-------------------------------"));

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
    const result = `El resultado de la orden fue de ${
      (sellPrice / buyPrice - 1) * 100
    }%`;
    let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;
    console.log(color(result));
  } catch (error) {
    console.log("error :", error);
  }
  EMAcross(pair);
};

const bollingerBandsCross = async (pair, interval) => {
  let cruce = true;
  let candles;
  let rsi;
  let date;
  let buyPrice;
  let sellPrice;
  let sl;

  console.log(chalk.cyanBright("Bollinger Bands Cross"));
  console.log(chalk.cyanBright(`Pair: ${pair}\nInterval: ${interval} `));
  console.log(chalk.magentaBright("-------------------------------"));

  try {
    while (cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        let { upper, middle, lower } = bollingerBands(candles);
        rsi = RSI(candles, 14);
        if (candles.pop()[ohlc.low] < lower && rsi < 35) {
          console.log("lower :", lower);
          console.log("rsi :", rsi);
          date = Date.now();
          cruce = false;
          buyPrice = candles.pop()[ohlc.close];
        }
      }
      await sleep(2500);
    }

    console.log(chalk.greenBright("Toca banda inferior"));
    console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
    console.log(chalk.magentaBright("-------------------------------"));
    await sleep(300000);

    while (!cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        let { upper, middle, lower } = bollingerBands(candles);

        if (candles.pop()[ohlc.high] > upper) {
          date = Date.now();
          cruce = true;
          sellPrice = candles[candles.length - 1][ohlc.close];
        }
      }
    }
    const result = `El resultado de la orden fue de ${
      (sellPrice / buyPrice - 1) * 100
    }%`;
    let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;

    console.log(chalk.magentaBright(new Date()));
    console.log(chalk.greenBright("Toca banda superior..."));
    console.log(chalk.greenBright(`El precio de venta fue de ${sellPrice}`));
    console.log(color(result));
  } catch (error) {
    console.log("error :", error);
  }
  bollingerBandsCross(pair);
};

const MAchannels = async (pair, interval) => {
  let buy = false;
  let sell = false;
  let fractal = false;
  let candles;
  let ma20;
  let ma55;
  let ma200;
  let close;

  while (!buy || !sell) {
    candles = await getCandles(pair, interval);
    ma20 = MA(candles, 20);
    ma55 = MA(candles, 55);
    ma200 = MA(candles, 100);
    close = candles[candles.length - 1][ohlc.close];

    if (ma20 > ma55 && ma55 > ma200) {
      buy = ma20 > close && close > ma55 ? true : false;
    }
    if (ma200 > ma55 && ma55 > ma20) {
      sell = ma20 > close && close > ma55 ? true : false;
    }
  }

  //A CHEQUEAR

  while (!fractal) {
    candles = await getLastCandles(pair, interval, 6);
    let trend = fractal(candles);
    if (trend == "bullish" && buy) {
      fractal = true;
      /*PLACE BUY ORDER
          SL = MA 55
          TP = 1.5 x RISK
         ((ep - sl) * 1.5) + ep        
          */
    }
    if (trend == "bearish" && sell) {
      fractal = true;
      /*PLACE SELL ORDER
          SL = MA 55
          TP = -1.5 x RISK        
          ((ep - sl) * -1.5) - ep
          */
    }
  }
  MAchannels(pair);
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

const rsimacd = async (pair, interval) => {
  let macd;
  let rsi;
  let candles;
  let buyPrice;
  let sellPrice;
  let buy = false;
  let sell = false;

  try {
    while (!buy || !sell) {
      candles = await getCandles(pair, interval);
      macd = MACD(candles);
      rsi = RSI(candles);
      if (rsi < 30) {
        if (macd.macd > macd.signal) {
          buy = true;
          buyPrice = candles[candles.length - 1][ohlc.close];
          console.log("buyPrice :", buyPrice);
        }
      } else if (rsi > 70) {
        if (macd.macd < macd.signal) {
          sell = true;
          buyPrice = candles[candles.length - 1][ohlc.close];
          console.log("buyPrice :", buyPrice);
        }
      }
      await sleep(2000);
    }

    console.log(chalk.magentaBright(new Date()));
    console.log(
      chalk.greenBright(
        `El precio de ${buy ? "compra" : "venta"} fue de ${buyPrice}`
      )
    );
    await sleep(20000);
    console.log(chalk.magentaBright("-------------------------------"));

    if (buy) {
      while (!sell) {
        candles = await getCandles(pair, interval);
        macd = MACD(candles);
        rsi = RSI(candles);
        if (rsi > 50) {
          sell = true;
          sellPrice = candles[candles.length - 1][ohlc.close];
        }
        await sleep(2000);
      }
      console.log(chalk.magentaBright(new Date()));
      console.log(chalk.greenBright(`El precio de venta fue de ${sellPrice}`));
    }

    if (sell) {
      while (!buy) {
        candles = await getCandles(pair, interval);
        macd = MACD(candles);
        rsi = RSI(candles);
        if (rsi < 50) {
          buy = true;
          sellPrice = candles[candles.length - 1][ohlc.close];
        }
        await sleep(2000);
      }
      console.log(chalk.magentaBright(new Date()));
      console.log(chalk.greenBright(`El precio de compra fue de ${sellPrice}`));
    }
    const result = `El resultado de la orden fue de ${
      (sellPrice / buyPrice - 1) * 100
    }%`;
    let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;
    console.log(color(result));
  } catch (error) {
    console.log("error :", error);
    return error;
  }
  rsimacd(pair, interval);
};

const semaforo = async (pair, interval, tick, acc = 0) => {
  let cruce = true;
  let buy, sell, candles, ema4, ema9, ema18, buyPrice, sellPrice;
  buy = sell = false;
  console.log(
    chalk.bgCyanBright(
      `ESTRATEGIA SEMAFORO CON PAR: ${pair} EN INTERVALO: ${interval}`
    )
  );

  //ANALISIS DE ESCENARIO
  while (!buy && !sell) {
    candles = await getCandles(pair, interval);
    if (candles.length) {
      ema4 = EMA(candles, 4);
      ema18 = EMA(candles, 18);
      if (ema4 < ema18) {
        buy = true;
      }
      if (ema4 > ema18) {
        sell = true;
      }
    }
  }

  if (buy) console.log("ESCENARIO LONG");
  if (sell) console.log("ESCENARIO SHORT");
  //INICIAR POSICIÓN
  if (buy) {
    while (cruce) {
      candles = await getCandles(pair, interval);
      if (candles.length) {
        ema4 = EMA(candles, 4);
        ema18 = EMA(candles, 18);
        if (ema4 > ema18) {
          candles = await getCandles(pair, interval);
          buyPrice = candles[candles.length - 1][ohlc.close];
          //LONG ORDER
          cruce = false;
        }
      }
      await sleep(tick);
    }
  }

  if (sell) {
    while (cruce) {
      candles = await getCandles(pair, interval);
      if (candles.length) {
        ema4 = EMA(candles, 4);
        ema18 = EMA(candles, 18);
        if (ema4 < ema18) {
          candles = await getCandles(pair, interval);
          buyPrice = candles[candles.length - 1][ohlc.close];
          //SHORT ORDER
          cruce = false;
        }
      }
      await sleep(tick);
    }
  }

  console.log(chalk.magentaBright(new Date()));
  console.log(chalk.greenBright("CRUZÓ"));
  console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
  console.log(chalk.greenBright("Esperando cruce para salir..."));
  await sleep(20000);

  //SACAR POSICION
  if (buy) {
    while (!cruce) {
      candles = await getCandles(pair, interval);
      if (candles.length) {
        ema4 = EMA(candles, 4);
        ema9 = EMA(candles, 9);
        if (ema4 < ema9) {
          candles = await getCandles(pair, interval);
          sellPrice = candles[candles.length - 1][ohlc.close];
          cruce = true;
        }
      }
      await sleep(tick);
    }
  }

  if (sell) {
    while (!cruce) {
      candles = await getCandles(pair, interval);
      if (candles.length) {
        ema4 = EMA(candles, 4);
        ema9 = EMA(candles, 9);
        if (ema4 > ema9) {
          candles = await getCandles(pair, interval);
          sellPrice = candles[candles.length - 1][ohlc.close];
          cruce = true;
        }
      }
      await sleep(tick);
    }
  }
  console.log(chalk.magentaBright(new Date()));
  console.log(chalk.greenBright(`El precio de venta fue de ${sellPrice}`));
  const result = buy
    ? (sellPrice / buyPrice - 1) * 100
    : (buyPrice / sellPrice - 1) * 100;
  let color = result > 0 ? chalk.greenBright : chalk.red;
  acc += result;
  console.log(`El resultado de la orden fue de ${color(result)}%`);
  console.log(
    `El acumulado hasta el momento es de ${
      acc > 0 ? chalk.greenBright(acc) : chalk.red(acc)
    }%`
  );
  console.log(chalk.magentaBright("-------------------------------"));
  semaforo(pair, interval, tick, acc);
};

const donchainChannels = async (pair, interval) => {
  let cruce = true;
  let candles;
  let rsi;
  let date;
  let buyPrice;
  let sellPrice;
  let sl;

  console.log(chalk.cyanBright("Donchain Channels"));
  console.log(chalk.cyanBright(`Pair: ${pair}\nInterval: ${interval} `));
  console.log(chalk.magentaBright("-------------------------------"));

  try {
    while (cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        let { upper, middle, lower } = bollingerBands(candles);
        rsi = RSI(candles, 14);
        if (candles.pop()[ohlc.low] < lower && rsi < 35) {
          date = Date.now();
          cruce = false;
          buyPrice = candles.pop()[ohlc.close];
        }
      }
      await sleep(2500);
    }

    console.log(chalk.greenBright("Toca banda inferior"));
    console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
    console.log(chalk.magentaBright("-------------------------------"));
    await sleep(300000);

    while (!cruce) {
      candles = await getCandles(pair, interval);
      if (candles?.length) {
        let { upper, middle, lower } = bollingerBands(candles);

        if (candles.pop()[ohlc.high] > upper) {
          date = Date.now();
          cruce = true;
          sellPrice = candles[candles.length - 1][ohlc.close];
        }
      }
    }
    const result = `El resultado de la orden fue de ${
      (sellPrice / buyPrice - 1) * 100
    }%`;
    let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;

    console.log(chalk.magentaBright(new Date()));
    console.log(chalk.greenBright("Toca banda superior..."));
    console.log(chalk.greenBright(`El precio de venta fue de ${sellPrice}`));
    console.log(color(result));
  } catch (error) {
    console.log("error :", error);
  }
  bollingerBandsCross(pair);
};

const indicatorTest = (pair, interval) => {
  const handleHour = (str) => {
    return str.toString().length == 1 ? `0${str}` : str;
  };
  setInterval(async () => {
    let candles = await getCandles(pair, interval);
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    console.log(chalk.cyanBright("PAIR " + pair));
    console.log(chalk.cyanBright("INTERVAL " + interval));
    console.log(
      chalk.cyanBright(`${hours}:${handleHour(minutes)}:${handleHour(seconds)}`)
    );
    let l = candles.length;
    MACD(candles);
    EMA(candles, 5);
    EMA(candles, 10);
    EMA(candles, 20);
    RSI(candles, 14);
    engulfing(candles.slice(l - 3, l - 1));
    fractal(candles);
    bollingerBands(candles);
    console.log("---------------------------");
  }, 5000);
};

module.exports = {
  EMAcross,
  MAchannels,
  grid,
  indicatorTest,
  rsimacd,
  bollingerBandsCross,
  semaforo,
};
