const { MACD, EMA, RSI, engulfing, fractal, bollingerBands } = require('./indicators');

const indicatorTest = (pair, interval) => {
	const formatTime = str => {
		return str.toString().length == 1 ? `0${str}` : str;
	};
	setInterval(async () => {
		let candles = await getCandles(pair, interval);
		let now = new Date();
		let hours = now.getHours();
		let minutes = now.getMinutes();
		let seconds = now.getSeconds();
		console.log(chalk.cyanBright('PAIR ' + pair));
		console.log(chalk.cyanBright('INTERVAL ' + interval));
		console.log(chalk.cyanBright(`${hours}:${formatTime(minutes)}:${formatTime(seconds)}`));
		let l = candles.length;
		MACD(candles);
		EMA(candles, 5);
		EMA(candles, 10);
		EMA(candles, 20);
		RSI(candles, 14);
		engulfing(candles.slice(l - 3, l - 1));
		fractal(candles);
		bollingerBands(candles);
		console.log('---------------------------');
	}, 5000);
};

module.exports = indicatorTest;
