import { NextResponse } from 'next/server';
import { fetchChainlinkStats, CHAINLINK_CONFIG, fetchLinkBalance } from '@/lib/api/chainlink';
import { fetchTokenPrices } from '@/lib/api/prices';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/chainlink
 * 
 * Fetches Chainlink node operator statistics:
 * - LINK token balance (via RPC - no API key needed)
 * - Payment history (requires ETHERSCAN_API_KEY)
 * - Statistics for 7/30/90 days
 */
export async function GET() {
  try {
    // Get LINK price from CoinGecko
    const prices = await fetchTokenPrices(['chainlink']);
    const linkPrice = prices['chainlink']?.usd;

    // Check if we have Etherscan API key for transfer history
    const hasApiKey = !!(process.env.ETHERSCAN_API_KEY || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY);

    // Fetch Chainlink stats (balance always works via RPC, transfers need API key)
    const stats = await fetchChainlinkStats(linkPrice);

    // If no transfers but we got balance, still return useful data
    const hasTransferHistory = stats.payments.length > 0;
    
    return NextResponse.json({
      ...stats,
      hasTransferHistory,
      hasApiKey,
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
    
    // Try to at least get the balance
    try {
      const balance = await fetchLinkBalance();
      const prices = await fetchTokenPrices(['chainlink']);
      const linkPrice = prices['chainlink']?.usd;
      
      return NextResponse.json({
        totalReceived: 0,
        totalSent: 0,
        netBalance: 0,
        currentBalance: balance,
        currentBalanceUsd: linkPrice ? balance * linkPrice : undefined,
        payments: [],
        last7Days: 0,
        last30Days: 0,
        last90Days: 0,
        hasTransferHistory: false,
        hasApiKey: false,
        config: CHAINLINK_CONFIG,
        linkPrice,
        lastUpdated: new Date().toISOString(),
        note: 'Transfer history unavailable - add ETHERSCAN_API_KEY for full data',
      });
    } catch {
      return NextResponse.json(
        { 
          error: 'Failed to fetch Chainlink data',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  }
}
