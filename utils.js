const getMA = (candles, q, interval) => {
  let total = 0;
  candles.slice(candles.length - q, candles.length).map((candle) => {
    total += Number(candle[4]);
  });
  console.log(`MA(${q}) = ${total / q} para un intervalo de ${interval}`);
  return total / q;
};

const getEMA = (candles, q, interval) => {
  let value = candles[0][4];
  let EMAs = [value];
  let k = smooth(q);

  candles.map((candle) => {
    value = Number(candle[4]) * k + value * (1 - k);
    EMAs.push(value);
  });
  console.log(`EMA(${q}) = ${EMAs.pop()} para un intervalo de ${interval}`);
  return EMAs.pop();
};

const smooth = (n) => {
  return 2 / (n + 1);
};

const engulfing = (candles) => {
  let firstCandle = {
    open: candles[0][1],
    high: candles[0][2],
    low: candles[0][3],
    close: candles[0][4],
  };
  let secondCandle = {
    open: candles[1][1],
    high: candles[1][2],
    low: candles[1][3],
    close: candles[1][4],
  };
  if (secondCandle.low < firstCandle.low && secondCandle.high > firstCandle.high) {
    //BULLISH
    if (secondCandle.close > firstCandle.open && secondCandle.close > secondCandle.open) return "bullish";
    //BEARISH
    if (secondCandle.close < firstCandle.open && secondCandle.close < secondCandle.open) return "bearish";
  }
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

module.exports = { getMA, getEMA, engulfing };
