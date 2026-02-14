// Aggregator service - fetches data from all sources and combines them

import { fetchCompleteCosmosValidator, ValidatorData } from './cosmos';
import { fetchSolanaValidator, SolanaValidatorData } from './solana';
import { fetchSuiValidator, SuiValidatorData } from './sui';
import { fetchNearValidator, NearValidatorData } from './near';
import { fetchSkaleValidators, SkaleData } from './skale';
import { fetchNeutronValidatorRevenue, fetchNeutronRevenueParams, NeutronRevenueStats } from './neutron-revenue';
import { fetchAllPrices, calculateUsdValue } from './prices';
import { COINGECKO_IDS, VALIDATOR_ADDRESSES } from './endpoints';
import { networks } from '@/data/networks';
import { Network, NetworkMetrics } from '@/types/network';

// Networks with Cosmos SDK that we can query
const COSMOS_NETWORKS = [
  'cosmos',
  'osmosis', 
  'celestia',
  'babylon',
  'terra',
  'union',
  'neutron',
  'xpla',
  'agoric',
  'zetachain',
  'dymension',
  'nolus',
  'seda',
  'persistence',
  'lava',
  'nibiru',
  'quicksilver',
  'sentinel',
  'haqq',
];

export interface AggregatedData {
  networks: Network[];
  metrics: NetworkMetrics;
  lastUpdated: string;
  errors: string[];
}

/**
 * Fetch all validator data from blockchain APIs
 */
export async function fetchAllValidatorData(): Promise<{
  cosmos: Record<string, ValidatorData | null>;
  solana: SolanaValidatorData | null;
  sui: SuiValidatorData | null;
  near: NearValidatorData | null;
  skale: SkaleData | null;
  neutronRevenue: NeutronRevenueStats | null;
  errors: string[];
}> {
  const errors: string[] = [];
  
  // Fetch Cosmos validators in parallel
  const cosmosPromises = COSMOS_NETWORKS.map(async (networkId) => {
    if (!VALIDATOR_ADDRESSES[networkId as keyof typeof VALIDATOR_ADDRESSES]) {
      return { networkId, data: null };
    }
    try {
      const data = await fetchCompleteCosmosValidator(networkId);
      return { networkId, data };
    } catch (error) {
      errors.push(`Failed to fetch ${networkId}: ${error}`);
      return { networkId, data: null };
    }
  });

  const cosmosResults = await Promise.all(cosmosPromises);
  const cosmosData: Record<string, ValidatorData | null> = {};
  cosmosResults.forEach(({ networkId, data }) => {
    cosmosData[networkId] = data;
  });

  // Fetch Solana
  let solanaData: SolanaValidatorData | null = null;
  try {
    solanaData = await fetchSolanaValidator();
  } catch (error) {
    errors.push(`Failed to fetch Solana: ${error}`);
  }

  // Fetch SUI
  let suiData: SuiValidatorData | null = null;
  try {
    suiData = await fetchSuiValidator();
  } catch (error) {
    errors.push(`Failed to fetch SUI: ${error}`);
  }

  // Fetch NEAR
  let nearData: NearValidatorData | null = null;
  try {
    nearData = await fetchNearValidator();
  } catch (error) {
    errors.push(`Failed to fetch NEAR: ${error}`);
  }

  // Fetch SKALE
  let skaleData: SkaleData | null = null;
  try {
    skaleData = await fetchSkaleValidators();
  } catch (error) {
    errors.push(`Failed to fetch SKALE: ${error}`);
  }

  // Fetch Neutron revenue stats
  let neutronRevenueData: NeutronRevenueStats | null = null;
  try {
    neutronRevenueData = await fetchNeutronValidatorRevenue(
      VALIDATOR_ADDRESSES.neutron
    );
  } catch (error) {
    errors.push(`Failed to fetch Neutron revenue: ${error}`);
  }

  return {
    cosmos: cosmosData,
    solana: solanaData,
    sui: suiData,
    near: nearData,
    skale: skaleData,
    neutronRevenue: neutronRevenueData,
    errors,
  };
}

/**
 * Aggregate all data and update network objects
 */
export async function aggregateAllData(): Promise<AggregatedData> {
  const errors: string[] = [];
  
  // Fetch validator data and prices in parallel
  const [validatorData, prices] = await Promise.all([
    fetchAllValidatorData(),
    fetchAllPrices(),
  ]);

  errors.push(...validatorData.errors);

  // Clone networks and update with live data
  const updatedNetworks: Network[] = networks.map((network) => {
    const updated = { ...network };
    
    // Get price for this network
    const coingeckoId = COINGECKO_IDS[network.id];
    const price = coingeckoId ? prices[coingeckoId]?.usd : undefined;

    // Update Cosmos networks
    if (COSMOS_NETWORKS.includes(network.id)) {
      const data = validatorData.cosmos[network.id];
      if (data) {
        updated.commission = data.commission;
        updated.rank = data.rank;
        updated.totalValidators = data.totalValidators;
        
        if (price) {
          updated.stake = {
            amount: data.tokens,
            usdValue: calculateUsdValue(data.tokens, price),
          };
          
          // Estimate monthly revenue (tokens * APR / 12 * commission_earned)
          if (updated.apr) {
            const avgApr = (updated.apr.min + updated.apr.max) / 2 / 100;
            const monthlyRewardTokens = data.tokens * avgApr / 12;
            const commissionEarned = monthlyRewardTokens * (data.commission / 100);
            updated.estimatedMonthlyRevenue = calculateUsdValue(commissionEarned, price);
            updated.estimatedYearlyRevenue = updated.estimatedMonthlyRevenue * 12;
          }
        }
      }
    }

    // Update Solana
    if (network.id === 'solana' && validatorData.solana) {
      const data = validatorData.solana;
      updated.commission = data.commission;
      updated.rank = data.rank;
      updated.totalValidators = data.totalValidators;
      
      if (price) {
        updated.stake = {
          amount: data.activatedStake,
          usdValue: calculateUsdValue(data.activatedStake, price),
        };
        
        // Solana commission is on rewards, not stake
        // Estimate: stake * APR * commission
        if (updated.apr) {
          const avgApr = (updated.apr.min + updated.apr.max) / 2 / 100;
          const monthlyRewardTokens = data.activatedStake * avgApr / 12;
          const commissionEarned = monthlyRewardTokens * (data.commission / 100);
          updated.estimatedMonthlyRevenue = calculateUsdValue(commissionEarned, price);
          updated.estimatedYearlyRevenue = updated.estimatedMonthlyRevenue * 12;
        }
      }
    }

    // Update SUI
    if (network.id === 'sui' && validatorData.sui) {
      const data = validatorData.sui;
      updated.commission = data.commissionRate;
      updated.rank = data.rank;
      updated.totalValidators = data.totalValidators;
      
      // Update APR from live data if available
      if (data.apy) {
        updated.apr = { min: data.apy, max: data.apy };
      }
      
      if (price) {
        updated.stake = {
          amount: data.stakingPoolSuiBalance,
          usdValue: calculateUsdValue(data.stakingPoolSuiBalance, price),
        };
        
        if (updated.apr) {
          const avgApr = (updated.apr.min + updated.apr.max) / 2 / 100;
          const monthlyRewardTokens = data.stakingPoolSuiBalance * avgApr / 12;
          const commissionEarned = monthlyRewardTokens * (data.commissionRate / 100);
          updated.estimatedMonthlyRevenue = calculateUsdValue(commissionEarned, price);
          updated.estimatedYearlyRevenue = updated.estimatedMonthlyRevenue * 12;
        }
      }
    }

    // Update NEAR
    if (network.id === 'near' && validatorData.near) {
      const data = validatorData.near;
      updated.commission = data.rewardFeeFraction;
      
      if (price) {
        updated.stake = {
          amount: data.totalStakedBalance,
          usdValue: calculateUsdValue(data.totalStakedBalance, price),
        };
        
        // NEAR commission is on rewards
        if (updated.apr) {
          const avgApr = (updated.apr.min + updated.apr.max) / 2 / 100;
          const monthlyRewardTokens = data.totalStakedBalance * avgApr / 12;
          const commissionEarned = monthlyRewardTokens * (data.rewardFeeFraction / 100);
          updated.estimatedMonthlyRevenue = calculateUsdValue(commissionEarned, price);
          updated.estimatedYearlyRevenue = updated.estimatedMonthlyRevenue * 12;
        }
      }
    }

    // Update SKALE (combined from 2 validators: ID 10 and ID 43)
    if (network.id === 'skale' && validatorData.skale) {
      const data = validatorData.skale;
      
      if (price && data.totalDelegated > 0) {
        updated.stake = {
          amount: data.totalDelegated,
          usdValue: calculateUsdValue(data.totalDelegated, price),
        };
        
        // SKALE rewards based on stake and APR
        if (updated.apr) {
          const avgApr = (updated.apr.min + updated.apr.max) / 2 / 100;
          const monthlyRewardTokens = data.totalDelegated * avgApr / 12;
          const commissionEarned = monthlyRewardTokens * ((updated.commission || 5) / 100);
          updated.estimatedMonthlyRevenue = calculateUsdValue(commissionEarned, price);
          updated.estimatedYearlyRevenue = updated.estimatedMonthlyRevenue * 12;
        }
      }
    }

    // Neutron revenue from Revenue Module API
    // reward_quote is $3000/month per validator, adjusted by performance
    if (network.id === 'neutron' && validatorData.neutronRevenue) {
      const revenueData = validatorData.neutronRevenue;
      // Monthly reward quota is $3000 USD, adjusted by performance rating
      const monthlyRevenueUsd = 3000 * revenueData.performanceRating;
      updated.estimatedMonthlyRevenue = monthlyRevenueUsd;
      updated.estimatedYearlyRevenue = monthlyRevenueUsd * 12;
      
      // Log performance stats
      console.log(`Neutron: Performance ${(revenueData.performanceRating * 100).toFixed(2)}%, ` +
        `Blocks ${revenueData.blocksUptime.toFixed(2)}%, ` +
        `Oracle ${revenueData.oracleUptime.toFixed(2)}%, ` +
        `Revenue: $${monthlyRevenueUsd.toFixed(0)}/month`);
    }

    return updated;
  });

  // Calculate metrics
  const activeNetworks = updatedNetworks.filter(n => n.status === 'active');
  const networksWithStake = activeNetworks.filter(n => n.stake?.usdValue);
  const networksWithApr = activeNetworks.filter(n => n.apr);
  
  const totalStakeUsd = networksWithStake.reduce(
    (sum, n) => sum + (n.stake?.usdValue || 0), 
    0
  );
  
  const avgApr = networksWithApr.length > 0
    ? networksWithApr.reduce(
        (sum, n) => sum + ((n.apr!.min + n.apr!.max) / 2), 
        0
      ) / networksWithApr.length
    : 0;

  const estimatedMonthlyRevenue = activeNetworks.reduce(
    (sum, n) => sum + (n.estimatedMonthlyRevenue || 0),
    0
  );

  const metrics: NetworkMetrics = {
    totalStakeUsd,
    totalNetworks: networks.length,
    activeNetworks: activeNetworks.length,
    estimatedMonthlyRevenue,
    estimatedYearlyRevenue: estimatedMonthlyRevenue * 12,
    avgApr,
  };

  return {
    networks: updatedNetworks,
    metrics,
    lastUpdated: new Date().toISOString(),
    errors,
  };
}
