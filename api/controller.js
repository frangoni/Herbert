const { get, post } = require('./agent');
const { getStartTimeByInterval } = require('./utils');

const getOpenOrders = async symbol => {
	const options = { symbol };
	return get('/v3/openOrders', symbol, '', options, true);
};

const getAllOrders = async symbol => {
	const options = { symbol };
	return get('/v3/allOrders', symbol, '', options, true);
};

const getCandles = async (symbol, interval) => {
	const options = { interval, symbol };
	return get('/v3/klines', symbol, `&interval=${interval}`, options);
};

const getLastCandles = async (symbol, interval, q) => {
	const startTime = getStartTimeByInterval(interval, q);
	const options = { interval, startTime, symbol };
	return get('/v3/klines', symbol, `&interval=${interval}&startTime=${startTime}`, options);
};

const getMarketInfo = async () => {
	return get('/v1/exchangeInfo');
};

const getTopGainers = async () => {
	const res = await get('/v3/ticker/24hr');
	res.sort((a, b) => b.priceChangePercent - a.priceChangePercent);
	const topGainers = res.slice(0, 5);
	console.log('topGainers :', topGainers);
	return topGainers;
};

const ganeONo = async symbol => {
	const orders = await getAllOrders(symbol);
	let buy = 0;
	let sell = 0;
	orders.forEach(order => {
		const { price, executedQty } = order;
		const value = price * executedQty;
		if (order.status == 'FILLED') {
			order.side == 'BUY' ? (buy += value) : (sell += value);
		}
	});
	const result = sell - buy;
	console.log(`Tu resultado con el par ${symbol} fue de $${result}`);
};

const createMarketOrder = async (symbol, side = 'BUY') => {
	const type = 'MARKET';
	const queryParams = `&side=${side}&type=${type}&quantity=${5}`;
	const options = { side, type, quantity: 5 };
	return post('/v3/order/test', symbol, queryParams, options);
};

module.exports = {
	getCandles,
	getOpenOrders,
	getLastCandles,
	createMarketOrder,
	getMarketInfo,
	getAllOrders,
	ganeONo,
	getTopGainers,
};
