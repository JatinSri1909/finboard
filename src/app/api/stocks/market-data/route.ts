import { type NextRequest, NextResponse } from 'next/server';
import { transformIndianAPIQuote } from '@/lib/api/financial-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider') || 'alphavantage';

  try {
    let marketData;

    switch (provider) {
      case 'alphavantage':
        marketData = await fetchAlphaVantageMarketData();
        break;
      case 'indian':
        marketData = await fetchIndianMarketData();
        break;
      case 'finnhub':
        marketData = await fetchFinnhubMarketData();
        break;
      default:
        marketData = await fetchAlphaVantageMarketData();
    }

    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}

async function fetchAlphaVantageMarketData() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'GVZFR2F6VD687VB3';
  if (!apiKey) {
    throw new Error('Alpha Vantage API key not configured');
  }

  console.log('[v0] Fetching Alpha Vantage market data');

  try {
    // Fetch top gainers and losers
    const response = await fetch(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`
    );
    if (!response.ok) {
      console.log('[v0] Alpha Vantage market data API response not ok:', response.status);
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[v0] Alpha Vantage market data response keys:', Object.keys(data));

    // Transform Alpha Vantage data to our format
    const transformAlphaVantageQuote = (item: any) => ({
      symbol: item.ticker || item.symbol,
      name: item.ticker || item.symbol,
      price: Number.parseFloat(item.price || '0'),
      change: Number.parseFloat(item.change_amount || '0'),
      changePercent: Number.parseFloat(item.change_percentage?.replace('%', '') || '0'),
      volume: Number.parseInt(item.volume || '0'),
    });

    const gainers = (data.top_gainers || []).slice(0, 10).map(transformAlphaVantageQuote);
    const losers = (data.top_losers || []).slice(0, 10).map(transformAlphaVantageQuote);
    const mostActive = (data.most_actively_traded || [])
      .slice(0, 10)
      .map(transformAlphaVantageQuote);

    // For indices, fetch major US indices
    const indicesSymbols = ['SPY', 'QQQ', 'DIA', 'IWM'];
    const indices = await Promise.all(
      indicesSymbols.map(async (symbol) => {
        try {
          const quoteResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
          );
          const quoteData = await quoteResponse.json();
          const quote = quoteData['Global Quote'];

          return {
            symbol: quote['01. symbol'],
            name: quote['01. symbol'],
            price: Number.parseFloat(quote['05. price'] || '0'),
            change: Number.parseFloat(quote['09. change'] || '0'),
            changePercent: Number.parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
            volume: Number.parseInt(quote['06. volume'] || '0'),
          };
        } catch (error) {
          console.error(`[v0] Error fetching ${symbol}:`, error);
          return {
            symbol,
            name: symbol,
            price: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
          };
        }
      })
    );

    return {
      gainers,
      losers,
      mostActive,
      indices,
    };
  } catch (error) {
    console.error('[v0] Error in fetchAlphaVantageMarketData:', error);
    throw error;
  }
}

async function fetchIndianMarketData() {
  const apiKey = process.env.INDIAN_API_KEY || 'sk-live-YNw1S8YW0fzVcfnsYoI7SB44tr1eSvZ7ghsKEy7F';
  if (!apiKey) {
    throw new Error('Indian API key not configured');
  }

  const headers = {
    'X-API-Key': apiKey,
  };

  console.log('[v0] Fetching Indian market data');

  try {
    // Fetch trending data (gainers/losers)
    const trendingResponse = await fetch('https://api.indianapi.in/trending', { headers });
    if (!trendingResponse.ok) {
      console.log('[v0] Trending API response not ok:', trendingResponse.status);
    }
    const trendingData = await trendingResponse.json();
    console.log('[v0] Trending data keys:', Object.keys(trendingData));

    // Fetch NSE most active
    const nseActiveResponse = await fetch('https://api.indianapi.in/NSE_most_active', { headers });
    if (!nseActiveResponse.ok) {
      console.log('[v0] NSE Active API response not ok:', nseActiveResponse.status);
    }
    const nseActiveData = await nseActiveResponse.json();
    console.log(
      '[v0] NSE Active data length:',
      Array.isArray(nseActiveData) ? nseActiveData.length : 'not array'
    );

    // Fetch BSE most active
    const bseActiveResponse = await fetch('https://api.indianapi.in/BSE_most_active', { headers });
    if (!bseActiveResponse.ok) {
      console.log('[v0] BSE Active API response not ok:', bseActiveResponse.status);
    }
    const bseActiveData = await bseActiveResponse.json();
    console.log(
      '[v0] BSE Active data length:',
      Array.isArray(bseActiveData) ? bseActiveData.length : 'not array'
    );

    // Transform and organize data
    const gainers = trendingData.gainers?.slice(0, 5).map(transformIndianAPIQuote) || [];
    const losers = trendingData.losers?.slice(0, 5).map(transformIndianAPIQuote) || [];
    const mostActive = [
      ...(nseActiveData?.slice(0, 3) || []),
      ...(bseActiveData?.slice(0, 2) || []),
    ].map(transformIndianAPIQuote);

    // For indices, we'll use some major Indian indices
    const indices = [
      { symbol: 'NIFTY', name: 'NIFTY 50' },
      { symbol: 'SENSEX', name: 'BSE SENSEX' },
      { symbol: 'BANKNIFTY', name: 'BANK NIFTY' },
      { symbol: 'NIFTYNEXT50', name: 'NIFTY NEXT 50' },
    ].map(transformIndianAPIQuote);

    return {
      gainers,
      losers,
      mostActive,
      indices,
    };
  } catch (error) {
    console.error('[v0] Error in fetchIndianMarketData:', error);
    throw error;
  }
}

async function fetchFinnhubMarketData() {
  const apiKey = process.env.FINNHUB_API_KEY || 'd2u64gpr01qo4hodtk8gd2u64gpr01qo4hodtk90';
  if (!apiKey) {
    throw new Error('Finnhub API key not configured');
  }

  console.log('[v0] Fetching Finnhub market data');

  try {
    // Fetch market screener data for gainers and losers
    const screenerResponse = await fetch(
      `https://finnhub.io/api/v1/stock/market-status?exchange=US&token=${apiKey}`
    );

    // Since Finnhub doesn't have a direct gainers/losers endpoint, we'll use popular stocks
    // and fetch their real-time data to determine performance
    const popularSymbols = [
      'AAPL',
      'MSFT',
      'GOOGL',
      'AMZN',
      'TSLA',
      'META',
      'NVDA',
      'AMD',
      'NFLX',
      'UBER',
      'PYPL',
      'ADBE',
      'CRM',
      'ORCL',
      'INTC',
    ];

    const fetchQuote = async (symbol: string) => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
        );
        if (!response.ok) {
          console.log('[v0] Finnhub quote API response not ok for', symbol, ':', response.status);
          return null;
        }
        const data = await response.json();
        return {
          symbol,
          name: `${symbol} Inc.`,
          price: data.c || 0,
          change: data.d || 0,
          changePercent: data.dp || 0,
          high: data.h || 0,
          low: data.l || 0,
          open: data.o || 0,
          previousClose: data.pc || 0,
          volume: 0, // Finnhub quote doesn't include volume
        };
      } catch (error) {
        console.error(`[v0] Error fetching ${symbol}:`, error);
        return null;
      }
    };

    // Fetch all quotes
    const allQuotes = await Promise.all(popularSymbols.map(fetchQuote));
    const validQuotes = allQuotes.filter((quote) => quote !== null);

    // Sort by change percentage to get gainers and losers
    const sortedByChange = [...validQuotes].sort((a, b) => b.changePercent - a.changePercent);
    const gainers = sortedByChange.slice(0, 10);
    const losers = sortedByChange.slice(-10).reverse();

    // Most active would be based on volume, but since we don't have volume from quote endpoint,
    // we'll use the middle performers
    const mostActive = sortedByChange.slice(5, 15);

    // Major indices
    const indicesSymbols = ['SPY', 'QQQ', 'DIA', 'IWM'];
    const indices = await Promise.all(indicesSymbols.map(fetchQuote));

    return {
      gainers: gainers.filter(Boolean),
      losers: losers.filter(Boolean),
      mostActive: mostActive.filter(Boolean),
      indices: indices.filter(Boolean),
    };
  } catch (error) {
    console.error('[v0] Error in fetchFinnhubMarketData:', error);
    throw error;
  }
}
