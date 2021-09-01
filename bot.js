const { indicatorTest, estrategia2, grid, estrategia1, rsimacd } = require('./strategies');
const { greet } = require('./greet');

const pairs = {
  eth: 'ETHUSDT',
  btc: 'BTCUSDT',
  rsr: 'RSRUSDT',
  link: 'LINKUSDT',
  sol: 'SOLUSDT',
  eos: 'EOSUSDT',
  linketh: 'LINKETH',
};
const interval = '5m';

greet();

/* estrategia1(pairs.eth, interval);
indicatorTest(pairs.sol, interval); */
rsimacd(pairs.sol, interval);
