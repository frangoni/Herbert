const chalk = require('chalk');
const { sleep } = require('.');
const { getCandles } = require('../api/controller');
const { EMA } = require('../utils/indicators');

const semaforo = async (pair, interval, tick, acc = 0) => {
	let cruce = true;
	let buy, sell, candles, ema4, ema9, ema18, buyPrice, sellPrice;
	buy = sell = false;
	console.log(chalk.bgCyanBright(`ESTRATEGIA SEMAFORO CON PAR: ${pair} EN INTERVALO: ${interval}`));

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

	if (buy) console.log('ESCENARIO LONG');
	if (sell) console.log('ESCENARIO SHORT');
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
	console.log(chalk.greenBright('CRUZÓ'));
	console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
	console.log(chalk.greenBright('Esperando cruce para salir...'));
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
	const result = buy ? (sellPrice / buyPrice - 1) * 100 : (buyPrice / sellPrice - 1) * 100;
	let color = result > 0 ? chalk.greenBright : chalk.red;
	acc += result;
	console.log(`El resultado de la orden fue de ${color(result)}%`);
	console.log(`El acumulado hasta el momento es de ${acc > 0 ? chalk.greenBright(acc) : chalk.red(acc)}%`);
	console.log(chalk.magentaBright('-------------------------------'));
	semaforo(pair, interval, tick, acc);
};

module.exports = semaforo;
