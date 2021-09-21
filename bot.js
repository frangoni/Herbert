const {
  indicatorTest,
  estrategia2,
  grid,
  estrategia1,
  rsimacd,
  bollingerBandsCross,
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
};
const interval = '15m';

greet();

/*bollingerBandsCross(pairs.link, interval);
 indicatorTest(pairs.sol, interval); 
ganeONo(pairs.sol);*/
