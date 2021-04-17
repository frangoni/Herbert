require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");
const { apiKey, apiSecret } = process.env;
const apiEP = "https://api.binance.com/";

const signature = (query) => {
  return `&signature=${crypto.createHmac("sha256", apiSecret).update(query).digest("hex")}`;
};

const timestamp = () => `&timestamp=${Date.now()}`;

const log = async () => {
  try {
    const query = "api/v3/allOrders&symbol=ETHUSDT";
    const orderss = await axios.get(`${apiEP}${query}${signature(query)}${timestamp()}`, {
      headers: { "X-MBX-APIKEY": apiKey },
    });
    console.log(orderss);
  } catch (error) {
    console.log(error);
  }
};

log();

const tick = async (config, binanceClient) => {
  const { asset, base, allocation, spread } = config;
  const market = `${asset}/${base}`;
  try {
    //CONSEGUIR TODAS LAS ORDENES

    const orders = await binanceClient.openOrders({ symbol: asset + base });

    //CERRAR TODAS LAS ORDENES
    orders.forEach(async (order) => {
      await binanceClient.cancelOrder({ symbol: asset + base, orderId: order.id });
    });

    //TIPOS DE CAMBIO
    const results = await Promise.all([
      axios.get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"),
      axios.get("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd"),
    ]);

    //BALANCES
    /* 
    const balances = await binanceClient.fetchBalance(); */
    const assetBalance = balances.free[asset];
    const baseBalance = balances.free[base];

    //PRECIOS
    const marketPrice = results[0].data.bitcoin.usd / results[1].data.tether.usd;
    const sellPrice = marketPrice * (1 + spread);
    const buyPrice = marketPrice * (1 - spread);

    //VOLUMENES
    const sellVolume = assetBalance * allocation;
    const buyVolume = (baseBalance * allocation) / marketPrice;

    console.log(binanceClient.allOrders());

    //CREACION DE ORDENES
    /*   await binanceClient.createLimitSellOrder(market, sellVolume, sellPrice);
    await binanceClient.createLimitBuyOrder(market, buyVolume, buyPrice); */

    console.log(`
    New tick for ${market}...
    Created limit sell order for ${sellVolume}@${sellPrice}
    Created limit buy order for ${buyVolume}@${buyPrice}
    `);
  } catch (error) {
    console.log("ERROR: " + error);
  }
};

const bot = async () => {
  const config = {
    asset: "ETH",
    base: "USDT",
    //SI ES DE 0.1 DEBERIA HABER MAS DE 100 DOLS EN CUENTA (MINIMO USDT10 PARA OPERAR)
    allocation: 0.1,
    spread: 0.2,
    tickInterval: 2000,
  };

  const binanceClient = new Binance().options({
    APIKEY: apiKey,
    APISECRET: apiSecret,
    useServerTime: true,
  });
  console.log(await binanceClient.time());
  tick(config, binanceClient);
  setInterval(tick, config.tickInterval, config, binanceClient);
};

bot();
