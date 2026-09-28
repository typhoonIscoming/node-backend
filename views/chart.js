document.addEventListener('DOMContentLoaded', () => {
	const chartElement = document.getElementById('chart');
	const lastPriceEl = document.getElementById('lastPrice');
	const priceChangeEl = document.getElementById('priceChange');
	const openPriceEl = document.getElementById('openPrice');
	const highPriceEl = document.getElementById('highPrice');
	const lowPriceEl = document.getElementById('lowPrice');
	const volumeEl = document.getElementById('volume');
	const typeButtons = document.querySelectorAll('.chart-type-btn');

	if (!chartElement) {
		return;
	}

	const chart = LightweightCharts.createChart(chartElement, {
		layout: {
			background: { type: 'solid', color: '#0f172a' },
			textColor: '#e2e8f0',
		},
		grid: {
			vertLines: { color: 'rgba(148, 163, 184, 0.14)' },
			horzLines: { color: 'rgba(148, 163, 184, 0.14)' },
		},
		rightPriceScale: {
			borderColor: 'rgba(148, 163, 184, 0.25)',
			scaleMargins: { top: 0.08, bottom: 0.08 },
		},
		timeScale: {
			borderColor: 'rgba(148, 163, 184, 0.25)',
			timeVisible: true,
			secondsVisible: false,
		},
		crosshair: {
			vertLine: { color: '#60a5fa', width: 1, style: 0 },
			horzLine: { color: 'rgba(96, 165, 250, 0.7)', width: 1, style: 2 },
		},
	});

	const generateIntradayData = () => {
		const now = Date.now();
		const points = [];
		let currentPrice = 2348.5;

		for (let i = 239; i >= 0; i--) {
			const time = Math.floor((now - i * 60 * 1000) / 1000);
			currentPrice += (Math.random() - 0.48) * 2.4;
			points.push({
				time,
				value: Number(currentPrice.toFixed(2)),
			});
		}

		return points;
	};

	const buildCandlestickData = (valueSeries) => {
		return valueSeries.map((point, index) => {
			const previous = valueSeries[index - 1]?.value ?? point.value;
			const open = previous;
			const close = point.value;
			const high = Math.max(open, close) + Math.random() * 1.6;
			const low = Math.min(open, close) - Math.random() * 1.6;
			return {
				time: point.time,
				open: Number(open.toFixed(2)),
				high: Number(high.toFixed(2)),
				low: Number(low.toFixed(2)),
				close: Number(close.toFixed(2)),
			};
		});
	};

	const valueData = generateIntradayData();
	const candleData = buildCandlestickData(valueData);
	let activeSeries = null;
	let isRealtimeTicking = false;

	const updateSummary = (data) => {
		if (!data.length) {
			return;
		}

		const first = data[0].value ?? data[0].open;
		const last = data[data.length - 1].value ?? data[data.length - 1].close;
		const values = data.map((item) => item.value ?? item.close);
		const high = Math.max(...values);
		const low = Math.min(...values);
		const volume = Math.round((last - first) * 1300 + 24000);
		const change = last - first;
		const changePercent = (change / first) * 100;
		const isUp = change >= 0;

		if (lastPriceEl) {
			lastPriceEl.textContent = last.toFixed(2);
			lastPriceEl.className = `price ${isUp ? 'up' : 'down'}`;
		}

		if (priceChangeEl) {
			const sign = isUp ? '+' : '-';
			const label = `${sign}${Math.abs(change).toFixed(2)} (${sign}${Math.abs(changePercent).toFixed(2)}%)`;
			priceChangeEl.textContent = label;
			priceChangeEl.className = `price-change ${isUp ? 'up' : 'down'}`;
		}

		if (openPriceEl) openPriceEl.textContent = first.toFixed(2);
		if (highPriceEl) highPriceEl.textContent = high.toFixed(2);
		if (lowPriceEl) lowPriceEl.textContent = low.toFixed(2);
		if (volumeEl) volumeEl.textContent = `${volume.toLocaleString()} oz`;
	};

	const setActiveButton = (type) => {
		typeButtons.forEach((button) => {
			button.classList.toggle('active', button.dataset.chartType === type);
		});
	};

	const renderChart = (type) => {
		if (activeSeries) {
			chart.removeSeries(activeSeries);
			activeSeries = null;
		}

		let nextSeries;
		if (type === 'candlestick') {
			nextSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
				upColor: '#26a69a',
				downColor: '#ef5350',
				borderVisible: false,
				wickUpColor: '#26a69a',
				wickDownColor: '#ef5350',
			});
			nextSeries.setData(candleData);
		} else if (type === 'area') {
			nextSeries = chart.addSeries(LightweightCharts.AreaSeries, {
				lineColor: '#2dd4bf',
				topColor: 'rgba(45, 212, 191, 0.35)',
				bottomColor: 'rgba(45, 212, 191, 0.03)',
				lineWidth: 2,
			});
			nextSeries.setData(valueData);
		} else if (type === 'line') {
			nextSeries = chart.addSeries(LightweightCharts.LineSeries, {
				color: '#60a5fa',
				lineWidth: 2,
			});
			nextSeries.setData(valueData);
		} else if (type === 'hollow') {
			nextSeries = chart.addSeries(LightweightCharts.CandlestickSeries, {
				upColor: 'rgba(45, 212, 191, 0.05)',
				downColor: 'rgba(248, 113, 113, 0.05)',
				wickUpColor: '#34d399',
				wickDownColor: '#f87171',
				borderVisible: true,
				borderColor: '#34d399',
				wickVisible: true,
			});
			nextSeries.setData(candleData);
		} else if (type === 'baseline') {
			nextSeries = chart.addSeries(LightweightCharts.BaselineSeries, {
				topLineColor: '#f59e0b',
				bottomLineColor: '#f59e0b',
				topFillColor1: 'rgba(245, 158, 11, 0.28)',
				bottomFillColor2: 'rgba(245, 158, 11, 0.02)',
				lineWidth: 2,
				baseValue: {
					type: 'price',
					price: valueData[0].value,
					position: 'aboveBar',
				},
			});
			nextSeries.setData(valueData);
		}

		if (!nextSeries) {
			return;
		}

		activeSeries = nextSeries;
		chart.timeScale().fitContent();
		updateSummary(type === 'candlestick' || type === 'hollow' ? candleData : valueData);
	};

	setActiveButton('candlestick');
	renderChart('candlestick');

	typeButtons.forEach((button) => {
		button.addEventListener('click', () => {
			const type = button.dataset.chartType;
			setActiveButton(type);
			renderChart(type);
		});
	});

	const resizeChart = () => {
		chart.applyOptions({
			width: chartElement.clientWidth,
			height: chartElement.clientHeight,
		});
	};
	resizeChart();
	new ResizeObserver(resizeChart).observe(chartElement);

	const tickMarket = () => {
		if (isRealtimeTicking) {
			return;
		}

		isRealtimeTicking = true;
		const lastValue = valueData[valueData.length - 1].value;
		const nextValue = Number(
			Math.max(2300, lastValue + (Math.random() - 0.48) * 2.8).toFixed(2)
		);
		const nextPoint = {
			time: Math.floor(Date.now() / 1000),
			value: nextValue,
		};
		valueData.push(nextPoint);
		if (valueData.length > 240) {
			valueData.shift();
		}
		const refreshedCandle = buildCandlestickData(valueData);
		candleData.length = 0;
		refreshedCandle.forEach((item) => candleData.push(item));
		if (activeSeries && document.querySelector('.chart-type-btn.active')) {
			const currentType = document.querySelector('.chart-type-btn.active').dataset.chartType;
			if (currentType === 'candlestick' || currentType === 'hollow') {
				activeSeries.update(candleData[candleData.length - 1]);
			} else {
				activeSeries.update(nextPoint);
			}
		}

		updateSummary(valueData);
		// chart.timeScale().fitContent();
		isRealtimeTicking = false;
	};

	setInterval(tickMarket, 2000);
});
