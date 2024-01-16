const chalk = require('chalk');
const { sleep } = require('.');

const MAchannels = async (pair, interval) => {
	let buy = false;
	let sell = false;
	let fractal = false;
	let candles;
	let ma20;
	let ma55;
	let ma200;
	let close;

	while (!buy || !sell) {
		candles = await getCandles(pair, interval);
		ma20 = MA(candles, 20);
		ma55 = MA(candles, 55);
		ma200 = MA(candles, 100);
		close = candles[candles.length - 1][ohlc.close];

		if (ma20 > ma55 && ma55 > ma200) {
			buy = ma20 > close && close > ma55 ? true : false;
		}
		if (ma200 > ma55 && ma55 > ma20) {
			sell = ma20 > close && close > ma55 ? true : false;
		}
	}

	//A CHEQUEAR

	while (!fractal) {
		candles = await getLastCandles(pair, interval, 6);
		let trend = fractal(candles);
		if (trend == 'bullish' && buy) {
			fractal = true;
			/*PLACE BUY ORDER
          SL = MA 55
          TP = 1.5 x RISK
         ((ep - sl) * 1.5) + ep        
          */
		}
		if (trend == 'bearish' && sell) {
			fractal = true;
			/*PLACE SELL ORDER
          SL = MA 55
          TP = -1.5 x RISK        
          ((ep - sl) * -1.5) - ep
          */
		}
	}
	MAchannels(pair);
};

module.exports = MAchannels;
