const PAIRS = {
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

const CONFIG = {
	interval: '15m',
	tick: 10000,
	pair: PAIRS.sol,
};

module.exports = CONFIG;
