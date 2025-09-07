import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Star,
  Table,
  LineChart,
  DollarSign,
} from 'lucide-react';
import type { WidgetTemplate } from './widget-store';

export const widgetTemplates: WidgetTemplate[] = [
  {
    id: 'stock-table',
    name: 'Stock Table',
    description: 'Paginated stock list with filters and search',
    icon: Table,
    category: 'Tables',
    popular: true,
    defaultConfig: {
      symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'],
      columns: ['symbol', 'name', 'price', 'change', 'changePercent', 'volume'],
      pageSize: 10,
      sortBy: 'changePercent',
      sortOrder: 'desc',
      showFilters: true,
    },
    defaultSize: { width: 2, height: 2 },
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    description: 'Your tracked stocks and favorites',
    icon: Star,
    category: 'Cards',
    popular: true,
    defaultConfig: {
      symbols: ['AAPL', 'MSFT', 'GOOGL'],
      showChange: true,
      showPercentChange: true,
      showVolume: false,
      refreshInterval: 30000,
    },
    defaultSize: { width: 1, height: 1 },
  },
  {
    id: 'market-gainers',
    name: 'Market Gainers',
    description: 'Top performing stocks today',
    icon: TrendingUp,
    category: 'Cards',
    popular: false,
    defaultConfig: {
      count: 5,
      minChange: 1.0,
      showPercentage: true,
      refreshInterval: 60000,
      provider: 'alphavantage', // alphavantage, finnhub, indian
      dataType: 'gainers', // gainers, losers, mostActive, indices
    },
    defaultSize: { width: 1, height: 1 },
  },
  {
    id: 'market-losers',
    name: 'Market Losers',
    description: 'Worst performing stocks today',
    icon: TrendingUp,
    category: 'Cards',
    popular: false,
    defaultConfig: {
      count: 5,
      maxChange: -1.0,
      showPercentage: true,
      refreshInterval: 60000,
      provider: 'alphavantage', // alphavantage, finnhub, indian
      dataType: 'losers', // gainers, losers, mostActive, indices
    },
    defaultSize: { width: 1, height: 1 },
  },
  {
    id: 'performance-data',
    name: 'Performance Data',
    description: 'Portfolio performance metrics',
    icon: Activity,
    category: 'Cards',
    popular: false,
    defaultConfig: {
      metrics: ['totalValue', 'dayChange', 'totalReturn', 'winRate'],
      showCharts: true,
      timeframe: '1D',
    },
    defaultSize: { width: 1, height: 1 },
  },
  {
    id: 'price-chart',
    name: 'Price Chart',
    description: 'Interactive stock price charts',
    icon: LineChart,
    category: 'Charts',
    popular: true,
    defaultConfig: {
      symbol: 'AAPL',
      chartType: 'line',
      timeframe: '1D',
      indicators: ['sma', 'volume'],
      showVolume: true,
    },
    defaultSize: { width: 2, height: 1 },
  },
  {
    id: 'candlestick-chart',
    name: 'Candlestick Chart',
    description: 'OHLC candlestick price charts',
    icon: BarChart3,
    category: 'Charts',
    popular: false,
    defaultConfig: {
      symbol: 'AAPL',
      timeframe: '1D',
      indicators: ['sma', 'rsi'],
      showVolume: true,
    },
    defaultSize: { width: 2, height: 2 },
  },
  {
    id: 'portfolio-summary',
    name: 'Portfolio Summary',
    description: 'Overview of your portfolio value',
    icon: PieChart,
    category: 'Cards',
    popular: true,
    defaultConfig: {
      showAllocation: true,
      showPerformance: true,
      timeframe: '1D',
    },
    defaultSize: { width: 1, height: 1 },
  },
  {
    id: 'market-overview',
    name: 'Market Overview',
    description: 'Major market indices and trends',
    icon: DollarSign,
    category: 'Cards',
    popular: true,
    defaultConfig: {
      indices: ['SPY', 'QQQ', 'DIA', 'IWM'],
      showChange: true,
      showChart: false,
      provider: 'alphavantage', // alphavantage, finnhub, indian
      dataType: 'indices', // gainers, losers, mostActive, indices
    },
    defaultSize: { width: 2, height: 1 },
  },
  {
    id: 'most-active',
    name: 'Most Active',
    description: 'Most actively traded stocks',
    icon: Activity,
    category: 'Cards',
    popular: false,
    defaultConfig: {
      count: 5,
      showVolume: true,
      showPercentage: true,
      refreshInterval: 60000,
      provider: 'alphavantage', // alphavantage, finnhub, indian
      dataType: 'mostActive', // gainers, losers, mostActive, indices
    },
    defaultSize: { width: 1, height: 1 },
  },
];

export function getWidgetTemplate(id: string): WidgetTemplate | undefined {
  return widgetTemplates.find((template) => template.id === id);
}

export function getWidgetsByCategory(category: string): WidgetTemplate[] {
  return widgetTemplates.filter((template) => template.category === category);
}

export function getPopularWidgets(): WidgetTemplate[] {
  return widgetTemplates.filter((template) => template.popular);
}
