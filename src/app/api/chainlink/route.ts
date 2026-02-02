import { NextResponse } from 'next/server';
import { fetchChainlinkStats, CHAINLINK_CONFIG } from '@/lib/api/chainlink';
import { fetchTokenPrices } from '@/lib/api/prices';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/chainlink
 * 
 * Fetches Chainlink node operator statistics:
 * - LINK token balance
 * - Payment history (incoming LINK transfers)
 * - Statistics for 7/30/90 days
 */
export async function GET() {
  try {
    // Get LINK price from CoinGecko
    const prices = await fetchTokenPrices(['chainlink']);
    const linkPrice = prices['chainlink']?.usd;

    // Fetch Chainlink stats
    const stats = await fetchChainlinkStats(linkPrice);
    
    return NextResponse.json({
      ...stats,
      config: CHAINLINK_CONFIG,
      linkPrice,
      lastUpdated: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in chainlink API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch Chainlink data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
