const { greet } = require('./greet');
const CONFIG = require('./config');
const scalping = require('../strategies/ai');
const performance = require('../utils/performance');

export default {
	async fetch(request, env, ctx) {
		// For a fetch handler - if this is what you need
		return new Response('Your worker is running!');
	},

	// For scheduled/cron jobs
	async scheduled(event, env, ctx) {
		greet();
		performance.initPerformanceTracking(CONFIG.positionSize);
		await scalping(CONFIG.pair, CONFIG.interval);

		return new Response('Scheduled task completed');
	},
};
