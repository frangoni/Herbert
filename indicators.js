const chalk = require('chalk');
const log = false;
const ohlc = {
  open: 1,
  high: 2,
  low: 3,
  close: 4,
};

const MA = (candles, q) => {
  let total = 0;
  candles.slice(candles.length - q, candles.length).map(candle => {
    total += Number(candle[ohlc.close]);
  });
  log && console.log(chalk.green(`MA(${q})= ${total / q}`));
  return total / q;
};

const EMA = (candles, q) => {
  let value = candles[0][ohlc.close];
  let EMAs = [value];
  //smooth
  let k = 2 / (q + 1);

  candles.map(candle => {
    value = Number(candle[ohlc.close]) * k + value * (1 - k);
    EMAs.push(value);
  });
  log && console.log(chalk.green(`EMA(${q})= ${EMAs.pop()}`));
  return EMAs.pop();
};

const bollingerBands = (candles, q = 20) => {
  let totalCandles = candles.slice(candles.length - q, candles.length);

  let middle = MA(candles, q);
  let total = 0;
  let std = 0;

  for (let i = 0; i < totalCandles.length; i++) {
    total += Number(totalCandles[i][ohlc.close]);
  }

  let avg = total / q;

  for (let i = 0; i < totalCandles.length; i++) {
    std += Math.pow(totalCandles[i][ohlc.close] - avg, 2);
  }

  std = Math.sqrt(std / q);

  let upper = middle + 2 * std;
  let lower = middle - 2 * std;
  log && console.log(chalk.greenBright(`---------------BOLLINGER BANDS---------------`));
  log && console.log(chalk.green(`Upper: ${upper}\nMiddle: ${middle}\nLower: ${lower}`));
  return { upper, middle, lower };
};

const RSI = (candles, q = 14) => {
  const l = candles.length;
  let avgWin = 0;
  let avgLoss = 0;
  //smooth
  let k = 2 / (q + 1);

  candles.slice(l - q, l).map(candle => {
    let value = (candle[ohlc.close] - candle[ohlc.open]) / q;

    // EMA's Smoothing Method
    /* value > 0
      ? (avgWin = k * value + (1 - k) * avgWin)
      : (avgLoss = k * Math.abs(value) + (1 - k) * avgLoss); */

    //Wilder’s Smoothing Method
    value > 0 ? (avgWin = value * (1 / q) + ((q - 1) / q) * avgWin) : (avgLoss = Math.abs(value) * (1 / q) + ((q - 1) / q) * avgLoss);
  });

  let rs = avgWin / avgLoss;
  let rsi = 100 - 100 / (1 + rs);

  log && console.log(chalk.green(`RSI(${q})= ${rsi}`));
  return rsi;
};

const engulfing = candles => {
  let firstCandle = {
    open: candles[0][ohlc.open],
    high: candles[0][ohlc.high],
    low: candles[0][ohlc.low],
    close: candles[0][ohlc.close],
  };
  let secondCandle = {
    open: candles[1][ohlc.open],
    high: candles[1][ohlc.high],
    low: candles[1][ohlc.low],
    close: candles[1][ohlc.close],
  };
  if (secondCandle.low < firstCandle.low && secondCandle.high > firstCandle.high) {
    //BULLISH
    if (secondCandle.close > firstCandle.open && secondCandle.close > secondCandle.open) {
      log && console.log(chalk.magenta('Bullish engulfing'));
      return 'bullish';
    }
    //BEARISH
    if (secondCandle.close < firstCandle.open && secondCandle.close < secondCandle.open) {
      log && console.log(chalk.magenta('Bearish engulfing'));
      return 'bearish';
    }
  }
};

const fractal = candles => {
  const l = candles.length;

  const [izq2, izq1, medio, der1, der2] = candles.slice(l - 6, l - 1).map(candle => candle);

  const bearingConditions = medio[ohlc.high] > izq1[ohlc.high] && medio[ohlc.high] > izq2[ohlc.high] && medio[ohlc.high] > der1[ohlc.high] && medio[ohlc.high] > der2[ohlc.high];
  const bullishConditions = medio[ohlc.low] < izq1[ohlc.low] && medio[ohlc.low] < izq2[ohlc.low] && medio[ohlc.low] < der1[ohlc.low] && medio[ohlc.low] < der2[ohlc.low];

  if (bearingConditions) {
    log && console.log(chalk.magenta('Bearish Williams Fractal'));
    return 'bearish';
  }
  if (bullishConditions) {
    log && console.log(chalk.magenta('Bullish Williams Fractal'));
    return 'bullish';
  }

  return;
};

const MACD = candles => {
  let ema12 = getEMAHist(candles, 12);
  let ema26 = getEMAHist(candles, 26);
  let macdHist = [];
  for (let i = 9; i > 1; i--) {
    macdHist.push(ema12[ema12.length - i] - ema26[ema26.length - i]);
  }

  const macd = ema12.pop() - ema26.pop();
  const signal = getSignal(macdHist);

  log && console.log(chalk.green(`MACD= ${macd}`));
  log && console.log(chalk.green(`SIGNAL= ${signal}`));
  return { macd, signal };
};

const getEMAHist = (candles, q) => {
  let value = candles[0][ohlc.close];
  let EMAs = [value];
  let k = 2 / (q + 1);

  candles.map(candle => {
    value = Number(candle[ohlc.close]) * k + value * (1 - k);
    EMAs.push(value);
  });
  return EMAs;
};

const getSignal = macdHist => {
  let value = macdHist[0];
  let signal = [value];
  let k = 2 / (9 + 1);

  macdHist.map(macd => {
    value = Number(macd) * k + value * (1 - k);
    signal.push(value);
  });

  return signal.pop();
};

const fibonacci = candles => {
  //RESULTADOS INCORRECTOS
  let min = 0;
  let max = 0;

  candles.map(candle => {
    if (candle[2] > max) max = candle[2];
    if (candle[3] < min) min = candle[3];
  });

  let avg = (min + max) / 2;
  let fibo = { 0: max, 0.236: 0.236, 0.382: 0.382, 0.5: avg, 0.618: 0.618, 0.786: 0.786, 1: min };

  for (const perc in fibo) {
    if (perc != [0, 1, 5]) fibo[perc] = fibo[perc] * avg; //VER CALCULO PARA OTROS COEF
  }
  return fibo;
};

const pivotLines = candles => {
  //LAS VELAS TIENEN QUE SER SI O SI DIARIAS
  const previousCandle = candles[candles.length - 2];
  const close = Number(previousCandle[ohlc.close]);
  const high = Number(previousCandle[ohlc.high]);
  const low = Number(previousCandle[ohlc.low]);

  const pivotPoint = (high + low + close) / 3;
  const range = high - low;

  //FIBONACCI PIVOT
  const r1 = pivotPoint + range * 0.382;
  const s1 = pivotPoint - range * 0.382;
  const r2 = pivotPoint + range * 0.618;
  const s2 = pivotPoint - range * 0.618;
  const r3 = pivotPoint + range;
  const s3 = pivotPoint - range;

  return { r1, s1, r2, s2, r3, s3, pivotPoint };
};

module.exports = { MA, EMA, engulfing, fractal, MACD, RSI, bollingerBands, ohlc, pivotLines };