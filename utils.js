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

module.exports = { getMA, getEMA };
