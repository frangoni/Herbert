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
    if (secondCandle.close > firstCandle.open && secondCandle.close > secondCandle.open) return "bullish";
    //BEARISH
    if (secondCandle.close < firstCandle.open && secondCandle.close < secondCandle.open) return "bearish";
  }
};

const fractal = (candles) => {
  const l = candles.length;
  //NO SE PUEDE TESTEAR SOBRE VELA ACTUAL
  const [izq2, izq1, medio, der1, der2] = candles.slice(l - 7, l - 2).map((candle) => candle);
  const bearingConditions = medio[ohlc.high] > izq1[ohlc.high] > izq2[ohlc.high] > der1[ohlc.high] > der2[ohlc.high];
  const bullishConditions = medio[ohlc.low] < izq1[ohlc.low] < izq2[ohlc.low] < der1[ohlc.low] < der2[ohlc.low];

  if (bearingConditions) return "bearish";
  if (bullishConditions) return "bullish";

  return;
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

module.exports = { getMA, getEMA, engulfing, fractal, ohlc };
