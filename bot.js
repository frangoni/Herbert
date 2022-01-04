const {
  indicatorTest,
  estrategia2,
  grid,
  estrategia1,
  rsimacd,
  bollingerBandsCross,
  semaforo,
} = require('./strategies');
const { greet } = require('./greet');
const { ganeONo } = require('./controller');

const pairs = {
  eth: 'ETHUSDT',
  btc: 'BTCUSDT',
  rsr: 'RSRUSDT',
  link: 'LINKUSDT',
  sol: 'SOLUSDT',
  eos: 'EOSUSDT',
  icp: 'ICPUSDT',
  mana: 'MANAUSDT',
};
const interval = '1h';
const tick = 5000;

greet();

semaforo(pairs.sol, interval, tick);
