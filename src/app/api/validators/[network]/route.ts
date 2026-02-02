import { NextResponse } from 'next/server';
import { fetchCompleteCosmosValidator } from '@/lib/api/cosmos';
import { fetchSolanaValidator } from '@/lib/api/solana';
import { fetchSuiValidator } from '@/lib/api/sui';
import { getTokenPrice, calculateUsdValue } from '@/lib/api/prices';
import { VALIDATOR_ADDRESSES } from '@/lib/api/endpoints';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const COSMOS_NETWORKS = [
  'cosmos', 'osmosis', 'celestia', 'juno', 'secret',
  'persistence', 'agoric', 'regen', 'sentinel', 
  'quicksilver', 'dymension', 'irisnet',
];

/**
 * GET /api/validators/[network]
 * 
 * Fetch data for a specific network validator
 * 
 * Examples:
 * - /api/validators/cosmos
 * - /api/validators/solana
 * - /api/validators/sui
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ network: string }> }
) {
  const { network } = await params;
  
  try {
    let validatorData: Record<string, unknown> | null = null;
    let price: number | null = null;

    // Fetch validator data based on network type
    if (COSMOS_NETWORKS.includes(network)) {
      if (!VALIDATOR_ADDRESSES[network as keyof typeof VALIDATOR_ADDRESSES]) {
        return NextResponse.json(
          { error: `No validator address configured for ${network}` },
          { status: 400 }
        );
      }
      
      const data = await fetchCompleteCosmosValidator(network);
      if (data) {
        price = await getTokenPrice(network);
        validatorData = {
          ...data,
          price,
          usdValue: price ? calculateUsdValue(data.tokens, price) : null,
        };
      }
    } else if (network === 'solana') {
      const data = await fetchSolanaValidator();
      if (data) {
        price = await getTokenPrice('solana');
        validatorData = {
          ...data,
          price,
          usdValue: price ? calculateUsdValue(data.activatedStake, price) : null,
        };
      }
    } else if (network === 'sui') {
      const data = await fetchSuiValidator();
      if (data) {
        price = await getTokenPrice('sui');
        validatorData = {
          ...data,
          price,
          usdValue: price ? calculateUsdValue(data.stakingPoolSuiBalance, price) : null,
        };
      }
    } else {
      return NextResponse.json(
        { error: `Network ${network} not supported for live data` },
        { status: 400 }
      );
    }

    if (!validatorData) {
      return NextResponse.json(
        { error: `Could not fetch data for ${network}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      network,
      data: validatorData,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error fetching ${network} validator:`, error);
    
    return NextResponse.json(
      { 
        error: `Failed to fetch ${network} validator data`,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
