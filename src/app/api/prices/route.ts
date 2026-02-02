import { NextResponse } from 'next/server';
import { fetchAllPrices } from '@/lib/api/prices';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Revalidate every minute

/**
 * GET /api/prices
 * 
 * Fetch current token prices from CoinGecko API
 * 
 * Returns prices for all supported tokens including:
 * - USD price
 * - 24h change percentage
 * - Market cap
 */
export async function GET() {
  try {
    const prices = await fetchAllPrices();
    
    return NextResponse.json({
      prices,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch prices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
