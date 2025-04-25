require('dotenv').config();
const axios = require('axios');
const signature = require('./signature');
const { apiKey } = process.env;
console.log('apiKey :', apiKey);
const apiEP = 'https://api.binance.com/api';
const fapiEP = 'https://fapi.binance.com/fapi';

const api = axios.create({
	baseURL: apiEP,
	headers: { 'X-MBX-APIKEY': apiKey },
});

const fapi = axios.create({
	baseURL: fapiEP,
	headers: { 'X-MBX-APIKEY': apiKey },
});

const IS_FUTURES = false;

const get = async (endpoint, symbol, queryParams = '', options, isAuth = false) => {
	const timestamp = Date.now();
	const query = `timestamp=${timestamp}&symbol=${symbol}` + queryParams;
	const agent = IS_FUTURES ? fapi : api;
	const params = isAuth ? { timestamp, signature: signature(query), ...options } : options;

	try {
		const res = await agent.get(endpoint, { params });
		return res.data;
	} catch (error) {
		console.log('Error Code :', error.code);
		console.log('Error Cause:', error.cause);
		console.log('Error Message:', error.message);

		return error;
	}
};

const post = async (endpoint, symbol, queryParams = '', options) => {
	const timestamp = Date.now();
	const query = `timestamp=${timestamp}&symbol=${symbol}` + queryParams;
	const agent = IS_FUTURES ? fapi : api;

	try {
		const res = await agent.post(endpoint, {
			params: { timestamp, symbol, signature: signature(query), ...options },
		});
		return res.data;
	} catch (error) {
		console.log('Error Code :', error.code);
		console.log('Error Cause:', error.cause);
		return error;
	}
};

module.exports = { api, fapi, get, post };
