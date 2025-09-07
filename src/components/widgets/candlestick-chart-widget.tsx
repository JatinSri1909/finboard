'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CandlestickChartWidgetProps {
  data?: any[];
  config: {
    symbol: string;
    timeframe: string;
    showVolume: boolean;
    indicators: string[];
  };
}

// Generate sample OHLC data
const generateOHLCData = (symbol: string, days = 30) => {
  const data = [];
  let price = 150 + Math.random() * 100;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const open = price;
    const volatility = 5 + Math.random() * 10;
    const high = open + Math.random() * volatility;
    const low = open - Math.random() * volatility;
    const close = low + Math.random() * (high - low);

    price = close;

    data.push({
      date: date.toISOString().split('T')[0],
      open: Number.parseFloat(open.toFixed(2)),
      high: Number.parseFloat(high.toFixed(2)),
      low: Number.parseFloat(low.toFixed(2)),
      close: Number.parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      candleColor: close >= open ? '#10b981' : '#ef4444',
      candleHeight: Math.abs(close - open),
      candleY: Math.min(open, close),
      wickHeight: high - low,
      wickY: low,
    });
  }

  return data;
};

export function CandlestickChartWidget({ data, config }: CandlestickChartWidgetProps) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    return generateOHLCData(config.symbol);
  }, [data, config.symbol]);

  const currentCandle = chartData[chartData.length - 1];
  const previousCandle = chartData[chartData.length - 2];
  const priceChange = currentCandle
    ? currentCandle.close - (previousCandle?.close || currentCandle.open)
    : 0;
  const priceChangePercent = previousCandle ? (priceChange / previousCandle.close) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p>
              Open: <span className="font-medium">${data.open}</span>
            </p>
            <p>
              High: <span className="font-medium text-green-600">${data.high}</span>
            </p>
            <p>
              Low: <span className="font-medium text-red-600">${data.low}</span>
            </p>
            <p>
              Close: <span className="font-medium">${data.close}</span>
            </p>
            {config.showVolume && (
              <p>
                Volume: <span className="font-medium">{(data.volume / 1000000).toFixed(1)}M</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-8 w-8 mx-auto mb-2" />
        <p>No OHLC data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Price Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{config.symbol}</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${currentCandle?.close.toFixed(2)}</span>
            <div
              className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {priceChange >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {priceChange >= 0 ? '+' : ''}
                {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        <Badge variant="outline">{config.timeframe}</Badge>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              }
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Wicks (High-Low lines) */}
            <Bar dataKey="wickHeight" fill="transparent" stroke="#666" strokeWidth={1} />

            {/* Candle bodies */}
            <Bar
              dataKey="candleHeight"
              fill={(entry: any) => entry.candleColor}
              stroke={(entry: any) => entry.candleColor}
              strokeWidth={1}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* OHLC Summary */}
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-xs text-muted-foreground">Open</div>
          <div className="font-medium">${currentCandle?.open.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">High</div>
          <div className="font-medium text-green-600">${currentCandle?.high.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Low</div>
          <div className="font-medium text-red-600">${currentCandle?.low.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Close</div>
          <div className="font-medium">${currentCandle?.close.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
