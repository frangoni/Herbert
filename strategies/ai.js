const { getLastCandles, createMarketOrder } = require('../api/controller');
const { EMA, RSI, bollingerBands, MACD, ohlc } = require('../utils/indicators');
const CONFIG = require('../bot/config');
const performance = require('../utils/performance');

/**
 * Low Risk Scalping Strategy
 *
 * Strategy concept:
 * 1. Uses Bollinger Bands, RSI, and MACD for trade signals
 * 2. Identifies zones of high probability for short-term reversals
 * 3. Employs tight stop losses and take profits for risk management
 * 4. Focused on high-volume trading pairs for better liquidity
 * 5. Implements a trail stop to lock in profits
 */

let inPosition = false;
let entryPrice = 0;
let stopLoss = 0;
let takeProfit = 0;
let trailingStop = 0;
let trailingActive = false;
let entryTime = 0; // Store entry time for performance tracking
let positionSize = 0; // Store position size for performance tracking

const RISK_PERCENT = 0.5; // Risk 0.5% per trade
const REWARD_RATIO = 1.5; // Risk:Reward ratio
const POSITION_SIZE = CONFIG.positionSize; // Position size in quote currency (USDT)
const TRAILING_ACTIVATION = 0.5; // Activate trailing stop when profit reaches 0.5%
const TRAILING_DISTANCE = 0.3; // Trailing stop distance in %

const calculatePositionSize = (entryPrice, stopPrice) => {
	const riskAmount = POSITION_SIZE * (RISK_PERCENT / 100);
	const priceDiff = Math.abs(entryPrice - stopPrice) / entryPrice;
	return (riskAmount / priceDiff).toFixed(6);
};

const scalping = async (symbol = CONFIG.pair, interval = '5m') => {
	console.log(`Starting Low Risk Scalping Strategy on ${symbol} at ${interval} interval`);

	// Initial scan
	await analyzeMarket(symbol, interval);

	// Set interval for continuous monitoring
	setInterval(async () => {
		await analyzeMarket(symbol, interval);
	}, 60000); // Check every minute
};

const analyzeMarket = async (symbol, interval) => {
	try {
		// Get candle data
		const candles = await getLastCandles(symbol, interval, 50);
		if (!candles || candles.length < 50) {
			console.log('Not enough candle data to analyze.');
			return;
		}

		const currentCandle = candles[candles.length - 1];
		const currentPrice = parseFloat(currentCandle[ohlc.close]);

		// Calculate indicators
		const bb = bollingerBands(candles, 20);
		const rsi = RSI(candles, 14);
		const macdData = MACD(candles);
		const ema50 = EMA(candles, 50);
		const ema20 = EMA(candles, 20);

		console.log(`Current Price: ${currentPrice}, RSI: ${rsi.toFixed(2)}, BB Middle: ${bb.middle.toFixed(4)}`);
		console.log(`MACD: ${macdData.macd.toFixed(4)}, Signal: ${macdData.signal.toFixed(4)}`);
		console.log(`EMA20: ${ema20.toFixed(4)}, EMA50: ${ema50.toFixed(4)}`);

		// Check for exit conditions if in position
		if (inPosition) {
			checkExitConditions(currentPrice);
			return;
		}

		// Entry conditions
		checkEntryConditions(currentPrice, bb, rsi, macdData, ema20, ema50);
	} catch (error) {
		console.log('Error analyzing market:', error);
	}
};

const checkEntryConditions = (currentPrice, bb, rsi, macdData, ema20, ema50) => {
	// Long entry conditions
	if (
		// Price near lower BB (oversold)
		currentPrice <= bb.lower * 1.005 &&
		// RSI shows oversold but recovering
		rsi < 40 &&
		rsi > 30 &&
		// MACD turning bullish
		macdData.macd > macdData.signal &&
		// Price above EMA50 (overall uptrend)
		currentPrice > ema50
	) {
		entryLong(currentPrice, bb.lower);
	}

	// Short entry conditions
	else if (
		// Price near upper BB (overbought)
		currentPrice >= bb.upper * 0.995 &&
		// RSI shows overbought but starting to turn
		rsi > 60 &&
		rsi < 70 &&
		// MACD turning bearish
		macdData.macd < macdData.signal &&
		// Price below EMA50 (overall downtrend)
		currentPrice < ema50
	) {
		entryShort(currentPrice, bb.upper);
	}
};

const entryLong = (price, bbLower) => {
	entryPrice = price;
	entryTime = Date.now();
	// Set stop loss slightly below BB lower band
	stopLoss = bbLower * 0.99;
	// Set take profit based on risk:reward ratio
	const risk = entryPrice - stopLoss;
	takeProfit = entryPrice + risk * REWARD_RATIO;

	// Calculate position size based on risk
	positionSize = calculatePositionSize(entryPrice, stopLoss);

	console.log(`LONG ENTRY at ${entryPrice}`);
	console.log(`Stop Loss: ${stopLoss}, Take Profit: ${takeProfit}, Position Size: ${positionSize}`);

	// Execute order
	// Uncomment to execute real orders
	// createMarketOrder(CONFIG.pair, 'BUY', positionSize);

	inPosition = true;
	trailingActive = false;
	trailingStop = 0;
};

const entryShort = (price, bbUpper) => {
	entryPrice = price;
	entryTime = Date.now();
	// Set stop loss slightly above BB upper band
	stopLoss = bbUpper * 1.01;
	// Set take profit based on risk:reward ratio
	const risk = stopLoss - entryPrice;
	takeProfit = entryPrice - risk * REWARD_RATIO;

	// Calculate position size based on risk
	positionSize = calculatePositionSize(entryPrice, stopLoss);

	console.log(`SHORT ENTRY at ${entryPrice}`);
	console.log(`Stop Loss: ${stopLoss}, Take Profit: ${takeProfit}, Position Size: ${positionSize}`);

	// Execute order
	// Uncomment to execute real orders
	// createMarketOrder(CONFIG.pair, 'SELL', positionSize);

	inPosition = true;
	trailingActive = false;
	trailingStop = 0;
};

const checkExitConditions = currentPrice => {
	// Check if we're in a long position
	if (entryPrice < stopLoss) {
		// Long position

		// Check for stop loss hit
		if (currentPrice <= stopLoss) {
			executeExit('Stop loss hit on LONG position', 'SELL');
			return;
		}

		// Check for take profit hit
		if (currentPrice >= takeProfit) {
			executeExit('Take profit hit on LONG position', 'SELL');
			return;
		}

		// Check if we should activate trailing stop
		const currentProfit = ((currentPrice - entryPrice) / entryPrice) * 100;
		if (!trailingActive && currentProfit >= TRAILING_ACTIVATION) {
			trailingActive = true;
			trailingStop = currentPrice * (1 - TRAILING_DISTANCE / 100);
			console.log(`Trailing stop activated at ${trailingStop}`);
		}

		// Check if we hit trailing stop
		if (trailingActive) {
			// Update trailing stop if price moves up
			if (currentPrice * (1 - TRAILING_DISTANCE / 100) > trailingStop) {
				trailingStop = currentPrice * (1 - TRAILING_DISTANCE / 100);
				console.log(`Trailing stop updated to ${trailingStop}`);
			}

			// Exit if price drops below trailing stop
			if (currentPrice <= trailingStop) {
				executeExit('Trailing stop hit on LONG position', 'SELL');
				return;
			}
		}
	}
	// Short position
	else {
		// Check for stop loss hit
		if (currentPrice >= stopLoss) {
			executeExit('Stop loss hit on SHORT position', 'BUY');
			return;
		}

		// Check for take profit hit
		if (currentPrice <= takeProfit) {
			executeExit('Take profit hit on SHORT position', 'BUY');
			return;
		}

		// Check if we should activate trailing stop
		const currentProfit = ((entryPrice - currentPrice) / entryPrice) * 100;
		if (!trailingActive && currentProfit >= TRAILING_ACTIVATION) {
			trailingActive = true;
			trailingStop = currentPrice * (1 + TRAILING_DISTANCE / 100);
			console.log(`Trailing stop activated at ${trailingStop}`);
		}

		// Check if we hit trailing stop
		if (trailingActive) {
			// Update trailing stop if price moves down
			if (currentPrice * (1 + TRAILING_DISTANCE / 100) < trailingStop) {
				trailingStop = currentPrice * (1 + TRAILING_DISTANCE / 100);
				console.log(`Trailing stop updated to ${trailingStop}`);
			}

			// Exit if price rises above trailing stop
			if (currentPrice >= trailingStop) {
				executeExit('Trailing stop hit on SHORT position', 'BUY');
				return;
			}
		}
	}
};

const executeExit = (reason, side) => {
	console.log(`EXIT: ${reason} at price ${entryPrice}`);
	performance.recordTrade(
		entryPrice,
		currentPrice,
		positionSize,
		entryPrice < stopLoss ? 'LONG' : 'SHORT',
		entryTime, // You need to store this when entering a position
		Date.now(),
		reason === 'Stop loss hit' ? 'stopLoss' : reason.includes('Take profit') ? 'takeProfit' : 'trailingStop'
	);

	// Execute order
	// Uncomment to execute real orders
	// createMarketOrder(CONFIG.pair, side);

	// Reset position tracking variables
	inPosition = false;
	entryPrice = 0;
	stopLoss = 0;
	takeProfit = 0;
	trailingStop = 0;
	trailingActive = false;
};

// Additional helper function for monitoring performance
const trackPerformance = () => {
	// Track trades, win rate, average profit, etc.
	// This would be expanded in a full implementation
};

module.exports = scalping;
