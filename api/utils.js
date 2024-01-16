const { sub } = require('date-fns');

const getStartTimeByInterval = (interval, q) => {
	let amount = { hours: 0, minutes: 0, days: 0 };
	switch (interval) {
		case '1m':
			amount = { ...amount, minutes: 1 * q };
			break;
		case '5m':
			amount = { ...amount, minutes: 5 * q };
			break;
		case '15m':
			amount = { ...amount, minutes: 15 * q };
			break;
		case '1h':
			amount = { ...amount, hours: 1 * q };
			break;
		case '4h':
			amount = { ...amount, hours: 4 * q };
			break;
		case '1d':
			amount = { ...amount, days: 1 * q };
			break;
		default:
			break;
	}
	return sub(new Date(), amount).getTime();
};

module.exports = { getStartTimeByInterval };
