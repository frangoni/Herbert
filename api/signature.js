require('dotenv').config();
const crypto = require('crypto');
const { apiSecret } = process.env;

const signature = query => {
	return crypto.createHmac('sha256', apiSecret).update(query).digest('hex');
};

module.exports = signature;
