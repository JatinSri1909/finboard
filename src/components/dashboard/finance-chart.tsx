import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface FinanceChartProps {
  data: any;
  config: {
    chartType?: 'line' | 'candlestick';
    timeInterval?: 'daily' | 'weekly' | 'monthly';
    symbol?: string;
  };
}

export const FinanceChart = ({ data, config }: FinanceChartProps) => {
  // Extract chart data from various API response formats
  const extractChartData = (data: any): any[] => {
    // Handle Alpha Vantage time series format
    if (data['Time Series (Daily)']) {
      return Object.entries(data['Time Series (Daily)']).map(([date, values]: [string, any]) => ({
        date,
        price: parseFloat(values['4. close']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        open: parseFloat(values['1. open']),
        volume: parseInt(values['5. volume']),
      })).reverse().slice(-30); // Last 30 data points
    }

    // Handle Finnhub candle format
    if (data.c && data.h && data.l && data.o && data.t) {
      return data.t.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toLocaleDateString(),
        price: data.c[index],
        high: data.h[index],
        low: data.l[index],
        open: data.o[index],
        volume: data.v ? data.v[index] : 0,
      })).slice(-30);
    }

    // Handle array of objects with price data
    if (Array.isArray(data)) {
      return data.slice(-30).map((item, index) => ({
        date: item.date || item.timestamp || `Day ${index + 1}`,
        price: parseFloat(item.price || item.close || item.c || item.value || 0),
        high: parseFloat(item.high || item.h || 0),
        low: parseFloat(item.low || item.l || 0),
        open: parseFloat(item.open || item.o || 0),
      }));
    }

    // Handle top gainers/losers format - create mock time series
    if (data.top_gainers) {
      const topStock = data.top_gainers[0];
      if (topStock) {
        const basePrice = parseFloat(topStock.price);
        return Array.from({ length: 30 }, (_, i) => {
          const variation = (Math.random() - 0.5) * 0.1;
          const price = basePrice * (1 + variation);
          return {
            date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            price,
            high: price * 1.02,
            low: price * 0.98,
            open: price * (1 + (Math.random() - 0.5) * 0.01),
          };
        });
      }
    }

    // Handle single quote data - create mock time series
    if (data.c || data.price) {
      const currentPrice = parseFloat(data.c || data.price);
      return Array.from({ length: 30 }, (_, i) => {
        const variation = (Math.random() - 0.5) * 0.1;
        const price = currentPrice * (1 + variation);
        return {
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          price,
          high: price * 1.02,
          low: price * 0.98,
          open: price * (1 + (Math.random() - 0.5) * 0.01),
        };
      });
    }

    // Create sample data if no recognizable format
    const basePrice = 100;
    return Array.from({ length: 30 }, (_, i) => {
      const variation = (Math.random() - 0.5) * 0.2;
      const price = basePrice * (1 + variation);
      return {
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        price,
        high: price * 1.05,
        low: price * 0.95,
        open: price * (1 + (Math.random() - 0.5) * 0.02),
      };
    });
  };

  const chartData = extractChartData(data);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No chart data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-widget border border-widget-border rounded-lg p-3 shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          <p className="text-primary">
            Price: ${payload[0].value?.toFixed(2)}
          </p>
          {payload[0].payload.volume && (
            <p className="text-muted-foreground text-sm">
              Volume: {payload[0].payload.volume.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" />
          <XAxis 
            dataKey="date" 
            stroke="#ffffff"
            fontSize={12}
            tick={{ fill: '#ffffff' }}
          />
          <YAxis 
            stroke="#ffffff"
            fontSize={12}
            tick={{ fill: '#ffffff' }}
            domain={['dataMin * 0.95', 'dataMax * 1.05']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#ffffff" 
            fillOpacity={1} 
            fill="url(#priceGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};