// Token price fetching using CoinGecko API
// Documentation: https://docs.coingecko.com/reference/simple-price

import { ENDPOINTS, COINGECKO_IDS } from './endpoints';

export interface TokenPrice {
  id: string;
  usd: number;
  usd_24h_change?: number;
  usd_market_cap?: number;
}

export type PricesMap = Record<string, TokenPrice>;

/**
 * Fetch token prices from CoinGecko
 * 
 * Endpoint: /simple/price
 * Params: ids, vs_currencies, include_24hr_change, include_market_cap
 * 
 * Rate limit: 10-30 calls/minute on free tier
 */
export async function fetchTokenPrices(
  tokenIds?: string[]
): Promise<PricesMap> {
  const ids = tokenIds || Object.values(COINGECKO_IDS);
  const idsString = ids.join(',');
  
  const url = `${ENDPOINTS.coingecko.base}/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 }, // Cache for 1 minute (CoinGecko updates every 60s on free tier)
    });

    if (!response.ok) {
      // Check for rate limiting
      if (response.status === 429) {
        console.warn('CoinGecko rate limit reached');
        return {};
      }
      console.error(`CoinGecko API error: ${response.status}`);
      return {};
    }

    const data = await response.json();
    
    // Transform response to our format
    const prices: PricesMap = {};
    
    for (const [id, priceData] of Object.entries(data)) {
      const price = priceData as {
        usd?: number;
        usd_24h_change?: number;
        usd_market_cap?: number;
      };
      
      if (price.usd !== undefined) {
        prices[id] = {
          id,
          usd: price.usd,
          usd_24h_change: price.usd_24h_change,
          usd_market_cap: price.usd_market_cap,
        };
      }
    }

    return prices;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return {};
  }
}

/**
 * Get price for a specific network token
 */
export async function getTokenPrice(networkId: string): Promise<number | null> {
  const coingeckoId = COINGECKO_IDS[networkId];
  if (!coingeckoId) {
    console.warn(`No CoinGecko ID for network ${networkId}`);
    return null;
  }

  const prices = await fetchTokenPrices([coingeckoId]);
  return prices[coingeckoId]?.usd || null;
}

/**
 * Calculate USD value from token amount and price
 */
export function calculateUsdValue(tokens: number, price: number): number {
  return tokens * price;
}

/**
 * Fetch all prices needed for the dashboard
 */
export async function fetchAllPrices(): Promise<PricesMap> {
  return fetchTokenPrices();
}
