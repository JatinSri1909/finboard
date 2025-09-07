'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceChartWidgetProps {
  data?: any[];
  config: {
    symbol: string;
    chartType: 'line' | 'area';
    timeframe: string;
    showVolume: boolean;
    indicators: string[];
  };
}

// Generate sample price data
const generatePriceData = (symbol: string, days = 30) => {
  const data = [];
  let price = 150 + Math.random() * 100;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate price movement
    const change = (Math.random() - 0.5) * 10;
    price = Math.max(10, price + change);

    data.push({
      date: date.toISOString().split('T')[0],
      price: Number.parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      sma: Number.parseFloat((price * (0.95 + Math.random() * 0.1)).toFixed(2)),
    });
  }

  return data;
};

export function PriceChartWidget({ data, config }: PriceChartWidgetProps) {
  const chartData = useMemo(() => {
    if (data && data.length > 0) return data;
    return generatePriceData(config.symbol);
  }, [data, config.symbol]);

  const currentPrice = chartData[chartData.length - 1]?.price || 0;
  const previousPrice = chartData[chartData.length - 2]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? (priceChange / previousPrice) * 100 : 0;

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'price' || name === 'sma') {
      return [`$${value.toFixed(2)}`, name.toUpperCase()];
    }
    if (name === 'volume') {
      return [`${(value / 1000000).toFixed(1)}M`, 'Volume'];
    }
    return [value, name];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {formatTooltipValue(entry.value, entry.dataKey)[1]}:{' '}
              {formatTooltipValue(entry.value, entry.dataKey)[0]}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <TrendingUp className="h-8 w-8 mx-auto mb-2" />
        <p>No price data available</p>
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
            <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
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
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {config.chartType === 'area' ? (
            <AreaChart data={chartData}>
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
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
              {config.indicators.includes('sma') && (
                <Area
                  type="monotone"
                  dataKey="sma"
                  stroke="hsl(var(--chart-2))"
                  fill="none"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                />
              )}
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
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
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: 'hsl(var(--chart-1))', strokeWidth: 2 }}
              />
              {config.indicators.includes('sma') && (
                <Line
                  type="monotone"
                  dataKey="sma"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Indicators Legend */}
      {config.indicators.length > 0 && (
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-chart-1"></div>
            <span>Price</span>
          </div>
          {config.indicators.includes('sma') && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-chart-2 border-dashed border-t"></div>
              <span>SMA</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
