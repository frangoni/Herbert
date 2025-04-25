/**
 * Performance tracking for low-risk scalping strategy
 * Tracks metrics such as win rate, profit factor, average gain/loss, and drawdown
 */

// Define global tracking variables
let performanceStats = {
	totalTrades: 0,
	winningTrades: 0,
	losingTrades: 0,
	breakEvenTrades: 0,
	totalProfit: 0,
	grossProfit: 0,
	grossLoss: 0,
	largestWin: 0,
	largestLoss: 0,
	averageWin: 0,
	averageLoss: 0,
	winRate: 0,
	profitFactor: 0,
	expectancy: 0,
	maxDrawdown: 0,
	currentDrawdown: 0,
	peakBalance: 0,
	consecutiveWins: 0,
	consecutiveLosses: 0,
	maxConsecutiveWins: 0,
	maxConsecutiveLosses: 0,
	tradeHistory: [],
	startingBalance: 0,
	currentBalance: 0,
	timeInTrade: 0,
	totalTradeTime: 0,
};

// Initialize performance tracking
const initPerformanceTracking = startingBalance => {
	performanceStats.startingBalance = startingBalance;
	performanceStats.currentBalance = startingBalance;
	performanceStats.peakBalance = startingBalance;

	console.log(`Performance tracking initialized with starting balance of ${startingBalance} USDT`);

	// Setup periodic reporting
	setInterval(() => {
		reportPerformance();
	}, 3600000); // Report every hour
};

// Record a completed trade
const recordTrade = (entryPrice, exitPrice, positionSize, side, entryTime, exitTime, exitReason) => {
	const trade = {
		id: performanceStats.totalTrades + 1,
		entryTime: entryTime,
		exitTime: exitTime,
		duration: (exitTime - entryTime) / 1000, // in seconds
		entryPrice: entryPrice,
		exitPrice: exitPrice,
		positionSize: positionSize,
		side: side, // 'LONG' or 'SHORT'
		exitReason: exitReason, // 'takeProfit', 'stopLoss', 'trailingStop'
		profit: 0,
		profitPercentage: 0,
	};

	// Calculate profit
	if (side === 'LONG') {
		trade.profit = (exitPrice - entryPrice) * positionSize;
		trade.profitPercentage = ((exitPrice - entryPrice) / entryPrice) * 100;
	} else {
		trade.profit = (entryPrice - exitPrice) * positionSize;
		trade.profitPercentage = ((entryPrice - exitPrice) / entryPrice) * 100;
	}

	// Update balance
	performanceStats.currentBalance += trade.profit;

	// Update trade statistics
	performanceStats.totalTrades++;
	performanceStats.totalProfit += trade.profit;
	performanceStats.totalTradeTime += trade.duration;

	// Categorize the trade
	if (trade.profit > 0) {
		performanceStats.winningTrades++;
		performanceStats.grossProfit += trade.profit;
		performanceStats.consecutiveWins++;
		performanceStats.consecutiveLosses = 0;

		// Check for largest win
		if (trade.profit > performanceStats.largestWin) {
			performanceStats.largestWin = trade.profit;
		}
	} else if (trade.profit < 0) {
		performanceStats.losingTrades++;
		performanceStats.grossLoss += Math.abs(trade.profit);
		performanceStats.consecutiveLosses++;
		performanceStats.consecutiveWins = 0;

		// Check for largest loss
		if (Math.abs(trade.profit) > performanceStats.largestLoss) {
			performanceStats.largestLoss = Math.abs(trade.profit);
		}
	} else {
		performanceStats.breakEvenTrades++;
	}

	// Update consecutive trade records
	if (performanceStats.consecutiveWins > performanceStats.maxConsecutiveWins) {
		performanceStats.maxConsecutiveWins = performanceStats.consecutiveWins;
	}
	if (performanceStats.consecutiveLosses > performanceStats.maxConsecutiveLosses) {
		performanceStats.maxConsecutiveLosses = performanceStats.consecutiveLosses;
	}

	// Update peak balance and drawdown statistics
	if (performanceStats.currentBalance > performanceStats.peakBalance) {
		performanceStats.peakBalance = performanceStats.currentBalance;
		performanceStats.currentDrawdown = 0;
	} else {
		const drawdown =
			((performanceStats.peakBalance - performanceStats.currentBalance) / performanceStats.peakBalance) * 100;
		performanceStats.currentDrawdown = drawdown;
		if (drawdown > performanceStats.maxDrawdown) {
			performanceStats.maxDrawdown = drawdown;
		}
	}

	// Calculate averages
	if (performanceStats.winningTrades > 0) {
		performanceStats.averageWin = performanceStats.grossProfit / performanceStats.winningTrades;
	}
	if (performanceStats.losingTrades > 0) {
		performanceStats.averageLoss = performanceStats.grossLoss / performanceStats.losingTrades;
	}

	// Calculate win rate and profit factor
	performanceStats.winRate = (performanceStats.winningTrades / performanceStats.totalTrades) * 100;
	performanceStats.profitFactor =
		performanceStats.grossLoss > 0
			? performanceStats.grossProfit / performanceStats.grossLoss
			: performanceStats.grossProfit;

	// Calculate expectancy
	performanceStats.expectancy =
		(performanceStats.winRate / 100) * performanceStats.averageWin -
		((100 - performanceStats.winRate) / 100) * performanceStats.averageLoss;

	// Add trade to history
	performanceStats.tradeHistory.push(trade);

	// Log trade details
	console.log(
		`Trade #${trade.id} recorded: ${side} ${positionSize} ${exitReason} - P/L: ${trade.profit.toFixed(
			2
		)} USDT (${trade.profitPercentage.toFixed(2)}%)`
	);

	// Optional: Save trade to database or file
	// saveTradeToDatabase(trade);

	return trade;
};

// Generate performance report
const reportPerformance = () => {
	console.log('\n=== PERFORMANCE REPORT ===');
	console.log(`Date: ${new Date().toISOString()}`);
	console.log(`Total Trades: ${performanceStats.totalTrades}`);
	console.log(`Win Rate: ${performanceStats.winRate.toFixed(2)}%`);
	console.log(`Profit Factor: ${performanceStats.profitFactor.toFixed(2)}`);
	console.log(`Expectancy: ${performanceStats.expectancy.toFixed(2)} USDT`);
	console.log(`Total Profit: ${performanceStats.totalProfit.toFixed(2)} USDT`);
	console.log(`Starting Balance: ${performanceStats.startingBalance.toFixed(2)} USDT`);
	console.log(`Current Balance: ${performanceStats.currentBalance.toFixed(2)} USDT`);
	console.log(
		`Return: ${(
			((performanceStats.currentBalance - performanceStats.startingBalance) / performanceStats.startingBalance) *
			100
		).toFixed(2)}%`
	);
	console.log(`Max Drawdown: ${performanceStats.maxDrawdown.toFixed(2)}%`);
	console.log(`Current Drawdown: ${performanceStats.currentDrawdown.toFixed(2)}%`);
	console.log(`Average Win: ${performanceStats.averageWin.toFixed(2)} USDT`);
	console.log(`Average Loss: ${performanceStats.averageLoss.toFixed(2)} USDT`);
	console.log(`Largest Win: ${performanceStats.largestWin.toFixed(2)} USDT`);
	console.log(`Largest Loss: ${performanceStats.largestLoss.toFixed(2)} USDT`);
	console.log(`Max Consecutive Wins: ${performanceStats.maxConsecutiveWins}`);
	console.log(`Max Consecutive Losses: ${performanceStats.maxConsecutiveLosses}`);
	console.log(
		`Average Trade Duration: ${(performanceStats.totalTradeTime / performanceStats.totalTrades / 60).toFixed(
			2
		)} minutes`
	);
	console.log('============================\n');

	// Return summary for potential use elsewhere
	return {
		winRate: performanceStats.winRate,
		profitFactor: performanceStats.profitFactor,
		totalProfit: performanceStats.totalProfit,
		maxDrawdown: performanceStats.maxDrawdown,
		return:
			((performanceStats.currentBalance - performanceStats.startingBalance) / performanceStats.startingBalance) *
			100,
	};
};

// Get trade history with optional filtering
const getTradeHistory = (filter = {}) => {
	if (Object.keys(filter).length === 0) {
		return performanceStats.tradeHistory;
	}

	return performanceStats.tradeHistory.filter(trade => {
		let passes = true;

		// Apply filters
		if (filter.side && trade.side !== filter.side) passes = false;
		if (filter.exitReason && trade.exitReason !== filter.exitReason) passes = false;
		if (filter.profitable === true && trade.profit <= 0) passes = false;
		if (filter.profitable === false && trade.profit >= 0) passes = false;
		if (filter.afterDate && new Date(trade.entryTime) < new Date(filter.afterDate)) passes = false;
		if (filter.beforeDate && new Date(trade.entryTime) > new Date(filter.beforeDate)) passes = false;

		return passes;
	});
};

// Generate and save detailed performance analytics
const generateAnalytics = () => {
	// Calculate additional analytics
	const hourlyBreakdown = getHourlyBreakdown();
	const dayOfWeekBreakdown = getDayOfWeekBreakdown();
	const consecutiveWinLossRatios = getConsecutiveWinLossRatios();
	const volatilityAnalysis = getVolatilityAnalysis();

	const analytics = {
		summary: {
			totalTrades: performanceStats.totalTrades,
			winRate: performanceStats.winRate,
			profitFactor: performanceStats.profitFactor,
			expectancy: performanceStats.expectancy,
			sharpeRatio: calculateSharpeRatio(),
			sortino: calculateSortinoRatio(),
			calmarRatio: calculateCalmarRatio(),
		},
		hourlyBreakdown,
		dayOfWeekBreakdown,
		consecutiveWinLossRatios,
		volatilityAnalysis,
		tradeDistribution: {
			byExitReason: getDistributionByExitReason(),
			byDuration: getDistributionByDuration(),
		},
	};

	console.log('\n=== DETAILED ANALYTICS ===');
	console.log('Sharpe Ratio:', analytics.summary.sharpeRatio.toFixed(2));
	console.log('Calmar Ratio:', analytics.summary.calmarRatio.toFixed(2));
	console.log(
		'Best Hour:',
		Object.keys(hourlyBreakdown).reduce((a, b) =>
			hourlyBreakdown[a].profitPercentage > hourlyBreakdown[b].profitPercentage ? a : b
		)
	);
	console.log(
		'Best Day:',
		Object.keys(dayOfWeekBreakdown).reduce((a, b) =>
			dayOfWeekBreakdown[a].profitPercentage > dayOfWeekBreakdown[b].profitPercentage ? a : b
		)
	);
	console.log('===========================\n');

	// Save analytics to file or database
	// saveAnalyticsToFile(analytics);

	return analytics;
};

// Helper functions for analytics
const getHourlyBreakdown = () => {
	const hourly = {};

	// Initialize hours
	for (let i = 0; i < 24; i++) {
		hourly[i] = {
			trades: 0,
			wins: 0,
			losses: 0,
			profit: 0,
			profitPercentage: 0,
		};
	}

	// Process trades
	performanceStats.tradeHistory.forEach(trade => {
		const hour = new Date(trade.entryTime).getHours();
		hourly[hour].trades++;

		if (trade.profit > 0) hourly[hour].wins++;
		else if (trade.profit < 0) hourly[hour].losses++;

		hourly[hour].profit += trade.profit;
	});

	// Calculate percentages
	for (const hour in hourly) {
		if (hourly[hour].trades > 0) {
			hourly[hour].winRate = (hourly[hour].wins / hourly[hour].trades) * 100;
			hourly[hour].profitPercentage = (hourly[hour].profit / performanceStats.totalProfit) * 100;
		}
	}

	return hourly;
};

const getDayOfWeekBreakdown = () => {
	const days = {
		0: { name: 'Sunday', trades: 0, wins: 0, losses: 0, profit: 0, profitPercentage: 0 },
		1: { name: 'Monday', trades: 0, wins: 0, losses: 0, profit: 0, profitPercentage: 0 },
		2: { name: 'Tuesday', trades: 0, wins: 0, losses: 0, profit: 0, profitPercentage: 0 },
		3: { name: 'Wednesday', trades: 0, wins: 0, losses: 0, profit: 0, profitPercentage: 0 },
		4: { name: 'Thursday', trades: 0, wins: 0, losses: 0, profit: 0, profitPercentage: 0 },
		5: { name: 'Friday', trades: 0, wins: 0, losses: 0, profit: 0, profitPercentage: 0 },
		6: { name: 'Saturday', trades: 0, wins: 0, losses: 0, profit: 0, profitPercentage: 0 },
	};

	// Process trades
	performanceStats.tradeHistory.forEach(trade => {
		const day = new Date(trade.entryTime).getDay();
		days[day].trades++;

		if (trade.profit > 0) days[day].wins++;
		else if (trade.profit < 0) days[day].losses++;

		days[day].profit += trade.profit;
	});

	// Calculate percentages
	for (const day in days) {
		if (days[day].trades > 0) {
			days[day].winRate = (days[day].wins / days[day].trades) * 100;
			days[day].profitPercentage = (days[day].profit / performanceStats.totalProfit) * 100;
		}
	}

	return days;
};

const getConsecutiveWinLossRatios = () => {
	// Analysis of consecutive wins/losses and their impact
	return {
		winStreakProbability: performanceStats.maxConsecutiveWins / performanceStats.totalTrades,
		lossStreakProbability: performanceStats.maxConsecutiveLosses / performanceStats.totalTrades,
		recoveryFactor: performanceStats.totalProfit / performanceStats.maxDrawdown,
	};
};

const getVolatilityAnalysis = () => {
	// Calculate daily returns for volatility metrics
	const dailyReturns = [];
	const tradesByDate = {};

	performanceStats.tradeHistory.forEach(trade => {
		const date = new Date(trade.exitTime).toISOString().split('T')[0];
		if (!tradesByDate[date]) {
			tradesByDate[date] = { profit: 0 };
		}
		tradesByDate[date].profit += trade.profit;
	});

	for (const date in tradesByDate) {
		dailyReturns.push(tradesByDate[date].profit / performanceStats.startingBalance);
	}

	// Calculate standard deviation of returns
	const avgReturn = dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length;
	const variance = dailyReturns.reduce((sum, value) => sum + Math.pow(value - avgReturn, 2), 0) / dailyReturns.length;
	const stdDev = Math.sqrt(variance);

	return {
		stdDeviation: stdDev,
		averageDailyReturn: avgReturn,
		annualizedVolatility: stdDev * Math.sqrt(365) * 100, // Annualized and in percentage
		profitToVolatilityRatio: avgReturn / stdDev,
	};
};

const getDistributionByExitReason = () => {
	const distribution = {
		takeProfit: { count: 0, profit: 0 },
		stopLoss: { count: 0, profit: 0 },
		trailingStop: { count: 0, profit: 0 },
	};

	performanceStats.tradeHistory.forEach(trade => {
		if (distribution[trade.exitReason]) {
			distribution[trade.exitReason].count++;
			distribution[trade.exitReason].profit += trade.profit;
		}
	});

	// Calculate percentages
	for (const reason in distribution) {
		distribution[reason].percentage = (distribution[reason].count / performanceStats.totalTrades) * 100;
		distribution[reason].avgProfit =
			distribution[reason].count > 0 ? distribution[reason].profit / distribution[reason].count : 0;
	}

	return distribution;
};

const getDistributionByDuration = () => {
	const distribution = {
		lessThan1Min: { count: 0, profit: 0 },
		'1To5Min': { count: 0, profit: 0 },
		'5To15Min': { count: 0, profit: 0 },
		'15To30Min': { count: 0, profit: 0 },
		'30To60Min': { count: 0, profit: 0 },
		moreThan60Min: { count: 0, profit: 0 },
	};

	performanceStats.tradeHistory.forEach(trade => {
		const duration = trade.duration;

		if (duration < 60) distribution.lessThan1Min.count++;
		else if (duration < 300) distribution['1To5Min'].count++;
		else if (duration < 900) distribution['5To15Min'].count++;
		else if (duration < 1800) distribution['15To30Min'].count++;
		else if (duration < 3600) distribution['30To60Min'].count++;
		else distribution.moreThan60Min.count++;
	});

	// Calculate percentages
	for (const range in distribution) {
		distribution[range].percentage = (distribution[range].count / performanceStats.totalTrades) * 100;
	}

	return distribution;
};

// Financial ratios calculations
const calculateSharpeRatio = () => {
	// Using daily returns for Sharpe ratio
	const tradesByDate = {};
	const dailyReturns = [];

	performanceStats.tradeHistory.forEach(trade => {
		const date = new Date(trade.exitTime).toISOString().split('T')[0];
		if (!tradesByDate[date]) {
			tradesByDate[date] = { profit: 0 };
		}
		tradesByDate[date].profit += trade.profit;
	});

	for (const date in tradesByDate) {
		dailyReturns.push(tradesByDate[date].profit / performanceStats.startingBalance);
	}

	const avgReturn = dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length;
	const stdDev = Math.sqrt(
		dailyReturns.reduce((sum, value) => sum + Math.pow(value - avgReturn, 2), 0) / dailyReturns.length
	);

	const riskFreeRate = 0.02 / 365; // Assuming 2% annual risk-free rate
	return ((avgReturn - riskFreeRate) / stdDev) * Math.sqrt(365); // Annualized
};

const calculateSortinoRatio = () => {
	// Similar to Sharpe but penalizes only downside deviation
	const tradesByDate = {};
	const dailyReturns = [];

	performanceStats.tradeHistory.forEach(trade => {
		const date = new Date(trade.exitTime).toISOString().split('T')[0];
		if (!tradesByDate[date]) {
			tradesByDate[date] = { profit: 0 };
		}
		tradesByDate[date].profit += trade.profit;
	});

	for (const date in tradesByDate) {
		dailyReturns.push(tradesByDate[date].profit / performanceStats.startingBalance);
	}

	const avgReturn = dailyReturns.reduce((sum, value) => sum + value, 0) / dailyReturns.length;

	// Calculate only downside deviation
	const downsideReturns = dailyReturns.filter(value => value < 0);
	const downsideDeviation = Math.sqrt(
		downsideReturns.reduce((sum, value) => sum + Math.pow(value, 2), 0) / downsideReturns.length
	);

	const riskFreeRate = 0.02 / 365; // Assuming 2% annual risk-free rate
	return ((avgReturn - riskFreeRate) / downsideDeviation) * Math.sqrt(365); // Annualized
};

const calculateCalmarRatio = () => {
	// Annual return divided by maximum drawdown
	const annualizedReturn =
		((performanceStats.totalProfit / performanceStats.startingBalance) * 365) /
		(performanceStats.tradeHistory.length > 0
			? (performanceStats.tradeHistory[performanceStats.tradeHistory.length - 1].exitTime -
					performanceStats.tradeHistory[0].entryTime) /
			  (1000 * 60 * 60 * 24)
			: 1);

	return performanceStats.maxDrawdown > 0 ? annualizedReturn / (performanceStats.maxDrawdown / 100) : 0;
};

// Update the executeExit function in the main strategy to record trades
const recordExitAndUpdateStats = (entryPrice, exitPrice, positionSize, side, entryTime, exitReason) => {
	const exitTime = Date.now();
	return recordTrade(entryPrice, exitPrice, positionSize, side, entryTime, exitTime, exitReason);
};

module.exports = {
	initPerformanceTracking,
	recordTrade,
	reportPerformance,
	getTradeHistory,
	generateAnalytics,
	recordExitAndUpdateStats,
};
