const { greet } = require('./greet');
const CONFIG = require('./config');
const scalping = require('../strategies/ai');
const performance = require('../utils/performance');

greet();

performance.initPerformanceTracking(CONFIG.positionSize);
scalping(CONFIG.pair, CONFIG.interval);
