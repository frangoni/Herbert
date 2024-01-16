const { greet } = require('./greet');
const CONFIG = require('./config');
const semaforo = require('../strategies/semaforo');

greet();

semaforo(CONFIG.pair, CONFIG.interval);
