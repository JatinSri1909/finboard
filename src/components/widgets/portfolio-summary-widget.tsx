'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface PortfolioSummaryWidgetProps {
  data?: any;
  config: {
    showAllocation: boolean;
    showPerformance: boolean;
    timeframe: string;
  };
}

// Sample portfolio data
const samplePortfolioData = {
  totalValue: 125430.5,
  dayChange: 2934.25,
  dayChangePercent: 2.39,
  totalReturn: 15430.5,
  totalReturnPercent: 14.05,
  allocation: [
    { name: 'Stocks', value: 75258.3, percent: 60, color: 'hsl(var(--chart-1))' },
    { name: 'Bonds', value: 25086.1, percent: 20, color: 'hsl(var(--chart-2))' },
    { name: 'ETFs', value: 18764.58, percent: 15, color: 'hsl(var(--chart-3))' },
    { name: 'Cash', value: 6271.52, percent: 5, color: 'hsl(var(--chart-4))' },
  ],
  topHoldings: [
    { symbol: 'AAPL', value: 15643.2, percent: 12.5 },
    { symbol: 'MSFT', value: 12514.4, percent: 10.0 },
    { symbol: 'GOOGL', value: 10011.52, percent: 8.0 },
  ],
};

export function PortfolioSummaryWidget({ data, config }: PortfolioSummaryWidgetProps) {
  const portfolioData = data || samplePortfolioData;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Value: ${data.value.toLocaleString()}</p>
          <p className="text-sm">Allocation: {data.percent}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Value</span>
          </div>
          <div className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Percent className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <div
            className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              portfolioData.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {portfolioData.dayChange >= 0 ? (
              <TrendingUp className="h-5 w-5" />
            ) : (
              <TrendingDown className="h-5 w-5" />
            )}
            {portfolioData.dayChangePercent >= 0 ? '+' : ''}
            {portfolioData.dayChangePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {config.showPerformance && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Performance</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Day Change</div>
              <div
                className={`font-medium ${portfolioData.dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {portfolioData.dayChange >= 0 ? '+' : ''}${portfolioData.dayChange.toLocaleString()}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Total Return</div>
              <div
                className={`font-medium ${portfolioData.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {portfolioData.totalReturn >= 0 ? '+' : ''}$
                {portfolioData.totalReturn.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Asset Allocation */}
      {config.showAllocation && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Asset Allocation</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData.allocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={20}
                  outerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {portfolioData.allocation.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {portfolioData.allocation.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs">{item.name}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {item.percent}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Holdings */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Top Holdings</h4>
        <div className="space-y-2">
          {portfolioData.topHoldings.map((holding: any, index: number) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium text-sm">{holding.symbol}</span>
              <div className="text-right">
                <div className="text-sm">${holding.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{holding.percent}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
