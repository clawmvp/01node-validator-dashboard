import { NextResponse } from 'next/server';
import { aggregateAllData } from '@/lib/api/aggregator';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidate every 5 minutes

/**
 * GET /api/validators
 * 
 * Fetches live validator data from all blockchain APIs:
 * - Cosmos SDK chains: cosmos, osmosis, celestia, juno, etc.
 * - Solana: getVoteAccounts RPC
 * - SUI: suix_getLatestSuiSystemState RPC
 * - Prices: CoinGecko API
 * 
 * Returns aggregated network data with:
 * - Live stake amounts
 * - USD values
 * - Validator ranks
 * - Estimated revenue
 */
export async function GET() {
  try {
    const data = await aggregateAllData();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in validators API:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch validator data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
