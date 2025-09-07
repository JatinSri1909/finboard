import { type NextRequest, NextResponse } from 'next/server';
import { transformAlphaVantageHistorical } from '@/lib/api/financial-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const period = searchParams.get('period') || '1M';
  const provider = searchParams.get('provider') || 'alphavantage';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    let historicalData;

    switch (provider) {
      case 'alphavantage':
        historicalData = await fetchAlphaVantageHistorical(symbol, period);
        break;
      case 'indian':
        historicalData = await fetchIndianAPIHistorical(symbol, period);
        break;
      default:
        historicalData = await fetchAlphaVantageHistorical(symbol, period);
    }

    return NextResponse.json(historicalData);
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}

async function fetchAlphaVantageHistorical(symbol: string, period: string) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'GVZFR2F6VD687VB3';
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  // Map period to Alpha Vantage function
  let func = 'TIME_SERIES_DAILY';
  let interval = '';

  switch (period) {
    case '1D':
      func = 'TIME_SERIES_INTRADAY';
      interval = '&interval=60min';
      break;
    case '1W':
    case '1M':
      func = 'TIME_SERIES_DAILY';
      break;
    case '3M':
    case '1Y':
      func = 'TIME_SERIES_WEEKLY';
      break;
    default:
      func = 'TIME_SERIES_DAILY';
  }

  console.log('[v0] Fetching Alpha Vantage historical data for:', symbol, 'period:', period);
  const url = `https://www.alphavantage.co/query?function=${func}&symbol=${symbol}${interval}&apikey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.log('[v0] Alpha Vantage historical API response not ok:', response.status);
    throw new Error(`Alpha Vantage API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[v0] Alpha Vantage historical response keys:', Object.keys(data));

  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }

  if (data['Note']) {
    throw new Error('API call frequency limit reached');
  }

  return transformAlphaVantageHistorical(data);
}

async function fetchIndianAPIHistorical(symbol: string, period: string) {
  const apiKey = process.env.INDIAN_API_KEY || 'sk-live-YNw1S8YW0fzVcfnsYoI7SB44tr1eSvZ7ghsKEy7F';
  if (!apiKey) {
    throw new Error('Indian API key not configured');
  }

  // Map period to Indian API format
  let apiPeriod = '1m';
  switch (period) {
    case '1D':
      apiPeriod = '1d';
      break;
    case '1W':
      apiPeriod = '1w';
      break;
    case '1M':
      apiPeriod = '1m';
      break;
    case '3M':
      apiPeriod = '3m';
      break;
    case '1Y':
      apiPeriod = '1yr';
      break;
    default:
      apiPeriod = '1m';
  }

  console.log('[v0] Fetching Indian API historical data for:', symbol, 'period:', apiPeriod);
  const url = `https://api.indianapi.in/historical_data?stock_name=${symbol}&period=${apiPeriod}`;
  const response = await fetch(url, {
    headers: {
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    console.log('[v0] Indian API historical response not ok:', response.status);
    throw new Error(`Indian API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[v0] Indian API historical response:', JSON.stringify(data, null, 2));

  if (data.error) {
    throw new Error(data.error);
  }

  // Transform Indian API response to our format
  return data
    .map((item: any) => ({
      date: item.date || item.timestamp,
      open: Number.parseFloat(item.open) || 0,
      high: Number.parseFloat(item.high) || 0,
      low: Number.parseFloat(item.low) || 0,
      close: Number.parseFloat(item.close) || 0,
      volume: Number.parseInt(item.volume) || 0,
    }))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
