const chalk = require('chalk');
const { sleep } = require('.');

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

		console.log(chalk.greenBright('Testeando cruce de EMAs...'));
		console.log(chalk.magentaBright('-------------------------------'));

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
		console.log(chalk.greenBright('CRUZÓ'));
		console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
		await sleep(300000);
		console.log(chalk.greenBright('Esperando cruce para vender...'));
		console.log(chalk.magentaBright('-------------------------------'));

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
		const result = `El resultado de la orden fue de ${(sellPrice / buyPrice - 1) * 100}%`;
		let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;
		console.log(color(result));
	} catch (error) {
		console.log('error :', error);
	}
	EMAcross(pair);
};

module.exports = EMAcross;
