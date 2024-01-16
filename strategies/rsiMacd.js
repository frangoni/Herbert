const chalk = require('chalk');
const { sleep } = require('.');

const rsimacd = async (pair, interval) => {
	let macd;
	let rsi;
	let candles;
	let buyPrice;
	let sellPrice;
	let buy = false;
	let sell = false;

	try {
		while (!buy || !sell) {
			candles = await getCandles(pair, interval);
			macd = MACD(candles);
			rsi = RSI(candles);
			if (rsi < 30) {
				if (macd.macd > macd.signal) {
					buy = true;
					buyPrice = candles[candles.length - 1][ohlc.close];
					console.log('buyPrice :', buyPrice);
				}
			} else if (rsi > 70) {
				if (macd.macd < macd.signal) {
					sell = true;
					buyPrice = candles[candles.length - 1][ohlc.close];
					console.log('buyPrice :', buyPrice);
				}
			}
			await sleep(2000);
		}

		console.log(chalk.magentaBright(new Date()));
		console.log(chalk.greenBright(`El precio de ${buy ? 'compra' : 'venta'} fue de ${buyPrice}`));
		await sleep(20000);
		console.log(chalk.magentaBright('-------------------------------'));

		if (buy) {
			while (!sell) {
				candles = await getCandles(pair, interval);
				macd = MACD(candles);
				rsi = RSI(candles);
				if (rsi > 50) {
					sell = true;
					sellPrice = candles[candles.length - 1][ohlc.close];
				}
				await sleep(2000);
			}
			console.log(chalk.magentaBright(new Date()));
			console.log(chalk.greenBright(`El precio de venta fue de ${sellPrice}`));
		}

		if (sell) {
			while (!buy) {
				candles = await getCandles(pair, interval);
				macd = MACD(candles);
				rsi = RSI(candles);
				if (rsi < 50) {
					buy = true;
					sellPrice = candles[candles.length - 1][ohlc.close];
				}
				await sleep(2000);
			}
			console.log(chalk.magentaBright(new Date()));
			console.log(chalk.greenBright(`El precio de compra fue de ${sellPrice}`));
		}
		const result = `El resultado de la orden fue de ${(sellPrice / buyPrice - 1) * 100}%`;
		let color = sellPrice - buyPrice > 0 ? chalk.greenBright : chalk.red;
		console.log(color(result));
	} catch (error) {
		console.log('error :', error);
		return error;
	}
	rsimacd(pair, interval);
};

module.exports = rsimacd;
