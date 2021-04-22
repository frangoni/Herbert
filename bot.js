const { getMA, getEMA } = require("./utils");
const { getCandles } = require("./controller");

const pairs = {
  eth: "ETHUSDT",
  rsr: "RSRUSDT",
  link: "LINKUSDT",
  eos: "EOSUSDT",
};
let interval = "15m";

const estrategia = (pair) => {
  let cruce = false;
  let retest = false;
  let date;
  let buyPrice;
  let sellPrice;
  let sl;

  while (!cruce) {
    getCandles(pair, interval).then(async (candles) => {
      const ema10 = await getEMA(candles, 10, interval);
      const ema20 = await getEMA(candles, 20, interval);
      if (ema10 > ema20) {
        date = Date.now();
        cruce = true;
      }
    });
  }

  while (!retest) {
    getCandles(pair, interval).then(async (candles) => {
      const ema20 = await getEMA(candles, 20, interval);
      if (candles[candles.length - 1][close] <= ema20 && ema10 > ema20) {
        retest = true;
        buyPrice = candles[candles.length - 1][close];
        sl = price * 0.98;
      }
    });
  }

  //MANDAR ORDEN

  while (cruce) {
    getCandles(pair, interval).then(async (candles) => {
      const ema10 = await getEMA(candles, 10, interval);
      const ema20 = await getEMA(candles, 20, interval);
      if (ema10 < ema20) {
        cruce = false;
        sellPrice = candles[candles.length - 1][close];
      }
    });
  }

  //VENDER ORDEN
  console.log(`El resultado de la orden fue de ${sellPrice - buyPrice}`);

  estrategia(pair);
};

estrategia(pairs.link);
