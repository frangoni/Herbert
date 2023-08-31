const { semaforo } = require('./strategies');
const { greet } = require('./greet');
const { ganeONo, getTopGainers, getCandles } = require('./controller');
const { MA, pivotLines, superTrend, EWO } = require('./indicators');

const pairs = {
	eth: 'ETHUSDT',
	btc: 'BTCUSDT',
	rsr: 'RSRUSDT',
	link: 'LINKUSDT',
	sol: 'SOLUSDT',
	eos: 'EOSUSDT',
	icp: 'ICPUSDT',
	mana: 'MANAUSDT',
	curve: 'CRVUSDT',
	helium: 'HNTUSDT',
	luna: 'LUNAUSDT',
	illuvium: 'ILVUSDT',
	cardano: 'ADAUSDT',
};

const interval = '15m';
const tick = 5000;

greet();

const indicatorTest = async indicator => {
	const pair = pairs.btc;
	const candles = await getCandles(pair, interval);
	console.log('Interval :', interval);
	console.log('Pair :', pair);
	indicator(candles);
};

const port = process.env.PORT || 8080;

indicatorTest(EWO);

/*semaforo(pairs.sol, interval, tick); */
