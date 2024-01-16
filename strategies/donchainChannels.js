const chalk = require('chalk');
const { sleep } = require('.');

const donchainChannels = async (pair, interval) => {
	let cruce = true;
	let candles;
	let rsi;
	let date;
	let buyPrice;
	let sellPrice;
	let sl;

	console.log(chalk.cyanBright('Donchain Channels'));
	console.log(chalk.cyanBright(`Pair: ${pair}\nInterval: ${interval} `));
	console.log(chalk.magentaBright('-------------------------------'));

	try {
		while (cruce) {
			candles = await getCandles(pair, interval);
			if (candles?.length) {
				let { upper, middle, lower } = bollingerBands(candles);
				rsi = RSI(candles, 14);
				if (candles.pop()[ohlc.low] < lower && rsi < 35) {
					date = Date.now();
					cruce = false;
					buyPrice = candles.pop()[ohlc.close];
				}
			}
			await sleep(2500);
		}

		console.log(chalk.greenBright('Toca banda inferior'));
		console.log(chalk.greenBright(`El precio de compra fue de ${buyPrice}`));
		console.log(chalk.magentaBright('-------------------------------'));
		await sleep(300000);

		while (!cruce) {
			candles = await getCandles(pair, interval);
			if (candles?.length) {
				let { upper, middle, lower } = bollingerBands(candles);

				if (candles.pop()[ohlc.high] > upper) {
					date = Date.now();
					cruce = true;
					sellPrice = candles[candles.length - 1][ohlc.close];
				}
			}
		}
		const result = `El resultado de la orden fue de ${(sellPrice / buyPrice - 1) * 100}%`;
		let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;

		console.log(chalk.magentaBright(new Date()));
		console.log(chalk.greenBright('Toca banda superior...'));
		console.log(chalk.greenBright(`El precio de venta fue de ${sellPrice}`));
		console.log(color(result));
	} catch (error) {
		console.log('error :', error);
	}
	donchainChannels(pair);
};

module.exports = donchainChannels;
