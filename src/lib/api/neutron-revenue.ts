// Neutron Revenue Module API client
// Docs: https://docs.neutron.org/developers/modules/revenue/overview

export interface NeutronRevenueStats {
  validatorAddress: string;
  committedBlocks: number;
  committedOracleVotes: number;
  activeBlocks: number;
  performanceRating: number; // 0-1
  expectedRevenueNtrn: number; // In NTRN tokens
  blocksUptime: number; // Percentage
  oracleUptime: number; // Percentage
}

export interface NeutronRevenueParams {
  rewardQuoteUsd: number; // Monthly USD reward per validator
  rewardAsset: string;
}

const NEUTRON_LCD = 'https://rest-lb.neutron.org';

/**
 * Fetch Neutron revenue parameters
 */
export async function fetchNeutronRevenueParams(): Promise<NeutronRevenueParams | null> {
  try {
    const response = await fetch(`${NEUTRON_LCD}/neutron/revenue/params`);
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      rewardQuoteUsd: parseInt(data.params.reward_quote.amount, 10),
      rewardAsset: data.params.reward_asset,
    };
  } catch (error) {
    console.error('Error fetching Neutron revenue params:', error);
    return null;
  }
}

/**
 * Fetch Neutron validator revenue stats
 */
export async function fetchNeutronValidatorRevenue(
  validatorAddress: string
): Promise<NeutronRevenueStats | null> {
  try {
    const url = `${NEUTRON_LCD}/neutron/revenue/validator_stats?val_oper_address=${validatorAddress}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Neutron revenue API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const stats = data.stats;
    
    const committedBlocks = parseInt(stats.validator_info.commited_blocks_in_period, 10);
    const committedOracleVotes = parseInt(stats.validator_info.commited_oracle_votes_in_period, 10);
    const activeBlocks = parseInt(stats.validator_info.in_active_valset_for_blocks_in_period, 10);
    const performanceRating = parseFloat(stats.performance_rating);
    
    // expected_revenue is in untrn (6 decimals)
    const expectedRevenueNtrn = parseInt(stats.expected_revenue.amount, 10) / 1_000_000;
    
    const blocksUptime = activeBlocks > 0 ? (committedBlocks / activeBlocks) * 100 : 0;
    const oracleUptime = activeBlocks > 0 ? (committedOracleVotes / activeBlocks) * 100 : 0;
    
    return {
      validatorAddress,
      committedBlocks,
      committedOracleVotes,
      activeBlocks,
      performanceRating,
      expectedRevenueNtrn,
      blocksUptime,
      oracleUptime,
    };
  } catch (error) {
    console.error('Error fetching Neutron validator revenue:', error);
    return null;
  }
}
