const { indicatorTest, estrategia2, grid, estrategia1 } = require('./strategies');
const { greet } = require('./greet');

const pairs = {
  eth: 'ETHUSDT',
  btc: 'BTCUSDT',
  rsr: 'RSRUSDT',
  link: 'LINKUSDT',
  eos: 'EOSUSDT',
  linketh: 'LINKETH',
  busdusdt: 'BUSDUSDT',
};
const interval = '1h';

greet();

estrategia1(pairs.eth, interval);
/*indicatorTest(pairs.eth, interval);*/
