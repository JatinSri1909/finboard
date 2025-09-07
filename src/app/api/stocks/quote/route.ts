import { type NextRequest, NextResponse } from 'next/server';
import {
  transformAlphaVantageQuote,
  transformFinnhubQuote,
  transformIndianAPIQuote,
} from '@/lib/api/financial-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const provider = searchParams.get('provider') || 'alphavantage';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    let quote;

    switch (provider) {
      case 'alphavantage':
        quote = await fetchAlphaVantageQuote(symbol);
        break;
      case 'finnhub':
        quote = await fetchFinnhubQuote(symbol);
        break;
      case 'indian':
        quote = await fetchIndianAPIQuote(symbol);
        break;
      default:
        quote = await fetchAlphaVantageQuote(symbol);
    }

    return NextResponse.json(quote);
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    return NextResponse.json({ error: 'Failed to fetch stock quote' }, { status: 500 });
  }
}

async function fetchAlphaVantageQuote(symbol: string) {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'GVZFR2F6VD687VB3';
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  console.log('[v0] Fetching Alpha Vantage quote for:', symbol);
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.log('[v0] Alpha Vantage API response not ok:', response.status);
    throw new Error(`Alpha Vantage API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[v0] Alpha Vantage response:', JSON.stringify(data, null, 2));

  if (data['Error Message']) {
    throw new Error(data['Error Message']);
  }

  if (data['Note']) {
    throw new Error('API call frequency limit reached');
  }

  if (data['Information']) {
    console.log('[v0] Alpha Vantage rate limit hit, falling back to Finnhub');
    // Fall back to Finnhub when Alpha Vantage rate limit is reached
    return await fetchFinnhubQuote(symbol);
  }

  if (!data['Global Quote']) {
    console.log('[v0] No Global Quote in response, falling back to Finnhub');
    return await fetchFinnhubQuote(symbol);
  }

  return transformAlphaVantageQuote(data, symbol);
}

async function fetchFinnhubQuote(symbol: string) {
  const apiKey = process.env.FINNHUB_API_KEY || 'd2u64gpr01qo4hodtk8gd2u64gpr01qo4hodtk90';
  if (!apiKey) {
    throw new Error('Finnhub API key not configured');
  }

  console.log('[v0] Fetching Finnhub quote for:', symbol);
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    console.log('[v0] Finnhub API response not ok:', response.status);
    throw new Error(`Finnhub API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[v0] Finnhub response:', JSON.stringify(data, null, 2));

  if (data.error) {
    throw new Error(data.error);
  }

  return transformFinnhubQuote(data, symbol);
}

async function fetchIndianAPIQuote(symbol: string) {
  const apiKey = process.env.INDIAN_API_KEY || 'sk-live-YNw1S8YW0fzVcfnsYoI7SB44tr1eSvZ7ghsKEy7F';
  if (!apiKey) {
    throw new Error('Indian API key not configured');
  }

  console.log('[v0] Fetching Indian API quote for:', symbol);
  const url = `https://api.indianapi.in/stock?name=${symbol}`;
  const response = await fetch(url, {
    headers: {
      'X-API-Key': apiKey,
    },
  });

  if (!response.ok) {
    console.log('[v0] Indian API response not ok:', response.status);
    throw new Error(`Indian API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[v0] Indian API response:', JSON.stringify(data, null, 2));

  if (data.error) {
    throw new Error(data.error);
  }

  return transformIndianAPIQuote(data);
}
