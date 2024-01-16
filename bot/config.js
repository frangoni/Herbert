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

const CONFIG = {
	interval: '15m',
	tick: 1000,
	pair: pairs.sol,
};

module.exports = CONFIG;
