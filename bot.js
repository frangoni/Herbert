const { indicatorTest, estrategia2, grid, estrategia1, rsimacd, bollingerBandsCross, semaforo } = require('./strategies');
const { greet } = require('./greet');
const { ganeONo, getTopGainers, getCandles } = require('./controller');
const { MA, pivotLines } = require('./utils');

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

semaforo(pairs.sol, interval, tick);
