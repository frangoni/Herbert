const getMA = (candles, q, interval) => {
  let total = 0;
  candles.slice(candles.length - q, candles.length).map((candle) => {
    total += Number(candle[4]);
  });
  console.log(`MA(${q}) = ${total / q} para un intervalo de ${interval}`);
  return total / q;
};

module.exports = { getMA };
