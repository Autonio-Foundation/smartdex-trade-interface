import { parseFullSymbol } from './helpers.js';
import socketIOClient from "socket.io-client";
const ENDPOINT = "https://api.smartdex.app/";

export const socket = socketIOClient(ENDPOINT);
// const socket = io('wss://streamer.cryptocompare.com');
const channelToSubscription = new Map();

socket.on('connect', () => {
	console.log('[socket] Connected');
});

socket.on('disconnect', (reason) => {
	console.log('[socket] Disconnected:', reason);
});

socket.on('error', (error) => {
	console.log('[socket] Error:', error);
});

socket.on('m', data => {
	console.log('[socket] Message:', data);
	const [
		eventTypeStr,
		exchange,
		fromSymbol,
		toSymbol,
		,
		,
		tradeTimeStr,
		,
		tradePriceStr,
	] = data.split('~');

	if (parseInt(eventTypeStr) !== 0) {
		// skip all non-TRADE events
		return;
	}
	const tradePrice = parseFloat(tradePriceStr);
	const tradeTime = parseInt(tradeTimeStr);
	const channelString = `0~${exchange}~${fromSymbol}~${toSymbol}`;
	const subscriptionItem = channelToSubscription.get(channelString);
	if (subscriptionItem === undefined) {
		return;
	}
	// console.log(subscriptionItem);
	const lastDailyBar = subscriptionItem.lastDailyBar;
	let nextDailyBarTime = new Date().getTime() / 1000;
	if (lastDailyBar) {
		nextDailyBarTime = getNextDailyBarTime(lastDailyBar.time, subscriptionItem.resolution);
	}

	let bar;
	if (tradeTime >= nextDailyBarTime) {
		let nextOfNextDailyBarTime = getNextDailyBarTime(nextDailyBarTime, subscriptionItem.resolution);
		while (tradeTime >= nextOfNextDailyBarTime) {
			bar = {
				time: nextDailyBarTime,
				open: lastDailyBar.close,
				high: lastDailyBar.close,
				low: lastDailyBar.close,
				close: lastDailyBar.close,
			};
			console.log('[socket] Generate new bar', bar);	
			subscriptionItem.handlers.forEach(handler => handler.callback(bar));
			nextDailyBarTime = nextOfNextDailyBarTime;
			nextOfNextDailyBarTime = getNextDailyBarTime(nextOfNextDailyBarTime, subscriptionItem.resolution);
		}
		bar = {
			time: nextDailyBarTime,
			open: lastDailyBar.close,
			high: tradePrice,
			low: tradePrice,
			close: tradePrice,
		};
		console.log('[socket] Generate new bar', bar);	
		subscriptionItem.lastDailyBar = bar;
		// send data to every subscriber of that symbol
		subscriptionItem.handlers.forEach(handler => handler.callback(bar));
	} else {
		bar = {
			...lastDailyBar,
			high: Math.max(lastDailyBar.high, tradePrice),
			low: Math.min(lastDailyBar.low, tradePrice),
			close: tradePrice,
		};
		console.log('[socket] Update the latest bar by price', tradePrice);
		subscriptionItem.lastDailyBar = bar;
		// send data to every subscriber of that symbol
		subscriptionItem.handlers.forEach(handler => handler.callback(bar));
	}
});

function getNextDailyBarTime(barTime, resolution) {
	const date = new Date(barTime * 1000);
	if (resolution === "D") {
		date.setDate(date.getDate() + 1);
		return date.getTime() / 1000;
	}
	return barTime + parseInt(resolution) * 60;
}

export function subscribeOnStream(
	symbolInfo,
	resolution,
	onRealtimeCallback,
	subscribeUID,
	onResetCacheNeededCallback,
	lastDailyBar,
) {
	const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
	const exchange = "Smartdex";
	const channelString = `0~${exchange}~${parsedSymbol.fromSymbol.toLowerCase()}~${parsedSymbol.toSymbol.toLowerCase()}`;
	const handler = {
		id: subscribeUID,
		callback: onRealtimeCallback,
	};
	let subscriptionItem = channelToSubscription.get(channelString);
	if (subscriptionItem) {
		// already subscribed to the channel, use the existing subscription
		subscriptionItem.handlers.push(handler);
		return;
	}
	subscriptionItem = {
		subscribeUID,
		resolution,
		lastDailyBar,
		handlers: [handler],
	};
	channelToSubscription.set(channelString, subscriptionItem);
	console.log('[subscribeBars]: Subscribe to streaming. Channel:', channelString);
	socket.emit('SubAdd', { subs: [channelString] });
}

export function unsubscribeFromStream(subscriberUID) {
	// find a subscription with id === subscriberUID
	for (const channelString of channelToSubscription.keys()) {
		const subscriptionItem = channelToSubscription.get(channelString);
		const handlerIndex = subscriptionItem.handlers
			.findIndex(handler => handler.id === subscriberUID);

		if (handlerIndex !== -1) {
			// remove from handlers
			subscriptionItem.handlers.splice(handlerIndex, 1);

			if (subscriptionItem.handlers.length === 0) {
				// unsubscribe from the channel, if it was the last handler
				console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString);
				socket.emit('SubRemove', { subs: [channelString] });
				channelToSubscription.delete(channelString);
				break;
			}
		}
	}
}