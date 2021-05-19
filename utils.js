const ohlc = {
  open: 1,
  high: 2,
  low: 3,
  close: 4,
};

const getMA = (candles, q, interval) => {
  let total = 0;
  candles.slice(candles.length - q, candles.length).map((candle) => {
    total += Number(candle[ohlc.close]);
  });
  console.log(`MA(${q}) = ${total / q} para un intervalo de ${interval}`);
  return total / q;
};

const getEMA = (candles, q, interval) => {
  let value = candles[0][ohlc.close];
  let EMAs = [value];
  //smooth
  let k = 2 / (q + 1);

  candles.map((candle) => {
    value = Number(candle[ohlc.close]) * k + value * (1 - k);
    EMAs.push(value);
  });
  console.log(`EMA(${q}) = ${EMAs.pop()} para un intervalo de ${interval}`);
  return EMAs.pop();
};

const engulfing = (candles) => {
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
      console.log('Bullish fractal');
      return 'bullish';
    }
    //BEARISH
    if (secondCandle.close < firstCandle.open && secondCandle.close < secondCandle.open) {
      console.log('Bearish fractal');
      return 'bearish';
    }
  }
};

const fractal = (candles) => {
  const l = candles.length;
  //NO SE PUEDE TESTEAR SOBRE VELA ACTUAL
  const [izq2, izq1, medio, der1, der2] = candles.slice(l - 7, l - 2).map((candle) => candle);
  //REVISAR
  const bearingConditions =
    medio[ohlc.high] > izq1[ohlc.high] &&
    medio[ohlc.high] > izq2[ohlc.high] &&
    medio[ohlc.high] > der1[ohlc.high] &&
    medio[ohlc.high] > der2[ohlc.high];
  const bullishConditions =
    medio[ohlc.low] < izq1[ohlc.low] && medio[ohlc.low] < izq2[ohlc.low] && medio[ohlc.low] < der1[ohlc.low] && medio[ohlc.low] < der2[ohlc.low];

  if (bearingConditions) return 'bearish';
  if (bullishConditions) return 'bullish';

  return;
};

const macd = (candles, interval) => {
  let ema12 = getEMAHist(candles, 12);
  let ema26 = getEMAHist(candles, 26);
  let macdHist = [];
  for (let i = 9; i > 1; i--) {
    macdHist.push(ema12[ema12.length - i] - ema26[ema26.length - i]);
  }

  const macd = ema12.pop() - ema26.pop();
  const signal = getSignal(macdHist);

  console.log('MACD', macd, 'SIGNAL', signal);
  return { macd, signal };
};

const getEMAHist = (candles, q) => {
  let value = candles[0][ohlc.close];
  let EMAs = [value];
  //smooth
  let k = 2 / (q + 1);

  candles.map((candle) => {
    value = Number(candle[ohlc.close]) * k + value * (1 - k);
    EMAs.push(value);
  });
  return EMAs;
};

const getSignal = (macdHist) => {
  let value = macdHist[0];
  let signal = [value];
  //smooth
  let k = 2 / (9 + 1);

  macdHist.map((macd) => {
    value = Number(macd) * k + value * (1 - k);
    signal.push(value);
  });

  return signal.pop();
};

/* const fibonacci = (candles) => {
  let min = 0;
  let max = 0;

  candles.map((candle) => {
    if (candle[2] > max) max = candle[2];
    if (candle[3] < min) min = candle[3];
  });

  let avg = (min + max) / 2;
  let fibo = { 0: max, 0.236: 0.236, 0.382: 0.382, 0.5: avg, 0.618: 0.618, 0.786: 0.786, 1: min };

  for (const perc in fibo) {
    if (perc != [0,1,5]) fibo[perc] = fibo[perc] * avg; //VER CALCULO PARA OTROS COEF
  }
  return fibo;
}; */

module.exports = { getMA, getEMA, engulfing, fractal, macd, ohlc };