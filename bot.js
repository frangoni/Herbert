const { indicatorTest, estrategia2, grid, estrategia1 } = require('./strategies');
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
const interval = '1h';

greet();

/* estrategia1(pairs.eth, interval); */
indicatorTest(pairs.sol, interval);
