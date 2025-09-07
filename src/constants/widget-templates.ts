import { WidgetTemplate, ApiProvider } from '@/types';

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  // Alpha Vantage Templates
  {
    id: 'av-stock-quote-card',
    name: 'Stock Quote Card',
    description: 'Display real-time stock quote information in a card format',
    apiProvider: 'alpha-vantage',
    displayMode: 'card',
    category: 'financial-data',
  },
  {
    id: 'av-stock-chart',
    name: 'Stock Price Chart',
    description: 'Line chart showing stock price trends over time',
    apiProvider: 'alpha-vantage',
    displayMode: 'chart',
    category: 'charts',
  },
  {
    id: 'av-market-status',
    name: 'Market Status',
    description: 'Current market status and trading hours',
    apiProvider: 'alpha-vantage',
    displayMode: 'card',
    category: 'financial-data',
  },

  // Finnhub Templates
  {
    id: 'fh-company-profile',
    name: 'Company Profile',
    description: 'Detailed company information and financial metrics',
    apiProvider: 'finnhub',
    displayMode: 'card',
    category: 'financial-data',
  },
  {
    id: 'fh-stock-candles',
    name: 'Stock Candles Chart',
    description: 'Candlestick chart for technical analysis',
    apiProvider: 'finnhub',
    displayMode: 'chart',
    category: 'charts',
  },
  {
    id: 'fh-quote-table',
    name: 'Stock Quotes Table',
    description: 'Tabular view of multiple stock quotes',
    apiProvider: 'finnhub',
    displayMode: 'table',
    category: 'financial-data',
  },

  // Indian API Templates
  {
    id: 'in-top-gainers',
    name: 'Top Gainers',
    description: 'List of stocks with highest gains',
    apiProvider: 'indian-api',
    displayMode: 'table',
    category: 'market-gainers',
  },
  {
    id: 'in-top-losers',
    name: 'Top Losers',
    description: 'List of stocks with highest losses',
    apiProvider: 'indian-api',
    displayMode: 'table',
    category: 'performance',
  },
  {
    id: 'in-market-status',
    name: 'Indian Market Status',
    description: 'Current status of Indian stock markets',
    apiProvider: 'indian-api',
    displayMode: 'card',
    category: 'financial-data',
  },
  {
    id: 'in-stock-watchlist',
    name: 'Stock Watchlist',
    description: 'Monitor your favorite Indian stocks',
    apiProvider: 'indian-api',
    displayMode: 'card',
    category: 'watchlist',
  },
];

export const getTemplatesByCategory = (category: string) => {
  return WIDGET_TEMPLATES.filter(template => template.category === category);
};

export const getTemplatesByProvider = (provider: ApiProvider) => {
  return WIDGET_TEMPLATES.filter(template => template.apiProvider === provider);
};

export const getTemplateById = (id: string) => {
  return WIDGET_TEMPLATES.find(template => template.id === id);
};
