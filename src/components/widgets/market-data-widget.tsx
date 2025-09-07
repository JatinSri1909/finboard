'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketDataWidgetProps {
  title?: string;
  provider?: 'alphavantage' | 'finnhub' | 'indian';
  dataType?: 'gainers' | 'losers' | 'mostActive' | 'indices';
  count?: number;
  refreshInterval?: number;
  showPercentage?: boolean;
  showVolume?: boolean;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export function MarketDataWidget({
  title = 'Market Data',
  provider = 'alphavantage',
  dataType = 'gainers',
  count = 5,
  refreshInterval = 60000,
  showPercentage = true,
  showVolume = false,
}: MarketDataWidgetProps) {
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stocks/market-data?provider=${provider}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.status}`);
      }

      const marketData = await response.json();
      const selectedData = marketData[dataType] || [];
      setData(selectedData.slice(0, count));
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, refreshInterval);
    return () => clearInterval(interval);
  }, [provider, dataType, count, refreshInterval]);

  const getIcon = () => {
    switch (dataType) {
      case 'gainers':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'losers':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'mostActive':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getIcon()}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded animate-pulse w-16" />
                <div className="h-4 bg-muted rounded animate-pulse w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getIcon()}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getIcon()}
          {title}
          <Badge variant="outline" className="ml-auto text-xs">
            {provider.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((stock, index) => (
            <div key={`${stock.symbol}-${index}`} className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{stock.symbol}</span>
                <span className="text-xs text-muted-foreground truncate max-w-20">
                  ${stock.price.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col items-end">
                {showPercentage && (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {stock.changePercent >= 0 ? '+' : ''}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                )}
                {showVolume && stock.volume && (
                  <span className="text-xs text-muted-foreground">
                    Vol: {(stock.volume / 1000000).toFixed(1)}M
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
