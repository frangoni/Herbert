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
	interval: '5m',
	tick: 3000,
	pair: pairs.sol,
};

module.exports = CONFIG;
