import { NextResponse } from 'next/server';
import { transformIndianAPIQuote } from '@/lib/api/financial-data';

export async function GET() {
  try {
    const apiKey = process.env.INDIAN_API_KEY;
    if (!apiKey) {
      throw new Error('Indian API key not configured');
    }

    const headers = {
      'X-API-Key': apiKey,
    };

    // Fetch all Indian market data endpoints
    const [trendingRes, nseActiveRes, bseActiveRes, priceShockersRes] = await Promise.all([
      fetch('https://api.indianapi.in/trending', { headers }),
      fetch('https://api.indianapi.in/NSE_most_active', { headers }),
      fetch('https://api.indianapi.in/BSE_most_active', { headers }),
      fetch('https://api.indianapi.in/price_shockers', { headers }),
    ]);

    const [trending, nseActive, bseActive, priceShockers] = await Promise.all([
      trendingRes.json(),
      nseActiveRes.json(),
      bseActiveRes.json(),
      priceShockersRes.json(),
    ]);

    return NextResponse.json({
      trending: trending?.slice(0, 10).map(transformIndianAPIQuote) || [],
      nseActive: nseActive?.slice(0, 10).map(transformIndianAPIQuote) || [],
      bseActive: bseActive?.slice(0, 10).map(transformIndianAPIQuote) || [],
      priceShockers: priceShockers?.slice(0, 10).map(transformIndianAPIQuote) || [],
    });
  } catch (error) {
    console.error('Error fetching Indian market data:', error);
    return NextResponse.json({ error: 'Failed to fetch Indian market data' }, { status: 500 });
  }
}
