export const API_PRESETS = {
  // Alpha Vantage APIs
  'Alpha Vantage - Stock Quote': `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`,
  'Alpha Vantage - Top Gainers': `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`,
  'Alpha Vantage - Daily Chart': `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&apikey=${process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY}`,

  // Finnhub APIs
  'Finnhub - Stock Quote': `https://finnhub.io/api/v1/quote?symbol=AAPL&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
  'Finnhub - Company Profile': `https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
  'Finnhub - Stock Candles': `https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=D&from=1609459200&to=1640995200&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
  'Finnhub - Market News': `https://finnhub.io/api/v1/news?category=general&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY}`,
};
