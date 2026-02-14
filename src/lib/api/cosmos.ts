// Cosmos SDK LCD REST API client
// Documentation: https://docs.cosmos.network/main/core/grpc_rest

import { ENDPOINTS, VALIDATOR_ADDRESSES } from './endpoints';

export interface CosmosValidatorResponse {
  validator: {
    operator_address: string;
    consensus_pubkey: {
      '@type': string;
      key: string;
    };
    jailed: boolean;
    status: string; // BOND_STATUS_BONDED, BOND_STATUS_UNBONDING, BOND_STATUS_UNBONDED
    tokens: string; // Total staked tokens in smallest denomination
    delegator_shares: string;
    description: {
      moniker: string;
      identity: string;
      website: string;
      security_contact: string;
      details: string;
    };
    unbonding_height: string;
    unbonding_time: string;
    commission: {
      commission_rates: {
        rate: string; // e.g., "0.050000000000000000" for 5%
        max_rate: string;
        max_change_rate: string;
      };
      update_time: string;
    };
    min_self_delegation: string;
  };
}

export interface CosmosPoolResponse {
  pool: {
    not_bonded_tokens: string;
    bonded_tokens: string;
  };
}

export interface ValidatorData {
  network: string;
  moniker: string;
  operatorAddress: string;
  status: 'bonded' | 'unbonding' | 'unbonded';
  jailed: boolean;
  tokens: number; // In full tokens (not smallest denomination)
  commission: number; // As percentage (e.g., 5 for 5%)
  rank?: number;
  totalValidators?: number;
  bondedTokens?: number; // Total bonded in the network
  votingPower?: number; // Percentage of total stake
}

// Token decimals for each Cosmos chain
const TOKEN_DECIMALS: Record<string, number> = {
  cosmos: 6,      // ATOM has 6 decimals (uatom)
  osmosis: 6,     // OSMO has 6 decimals (uosmo)
  celestia: 6,    // TIA has 6 decimals (utia)
  babylon: 6,     // BBN has 6 decimals (ubbn)
  terra: 6,       // LUNA has 6 decimals (uluna)
  union: 18,      // U has 18 decimals (au)
  neutron: 6,     // NTRN has 6 decimals (untrn)
  xpla: 18,       // XPLA has 18 decimals (axpla)
  agoric: 6,      // BLD has 6 decimals (ubld)
  zetachain: 18,  // ZETA has 18 decimals (azeta)
  dymension: 18,  // DYM has 18 decimals (adym)
  nolus: 6,       // NLS has 6 decimals (unls)
  seda: 18,       // SEDA has 18 decimals (aseda)
  persistence: 6, // XPRT has 6 decimals (uxprt)
  lava: 6,        // LAVA has 6 decimals (ulava)
  nibiru: 6,      // NIBI has 6 decimals (unibi)
  quicksilver: 6, // QCK has 6 decimals (uqck)
  sentinel: 6,    // DVPN has 6 decimals (udvpn)
  haqq: 18,       // ISLM has 18 decimals (aISLM)
};

/**
 * Fetch validator data from a Cosmos LCD endpoint
 * Endpoint: /cosmos/staking/v1beta1/validators/{validator_address}
 */
export async function fetchCosmosValidator(
  networkId: string
): Promise<ValidatorData | null> {
  const endpoint = ENDPOINTS[networkId as keyof typeof ENDPOINTS];
  const validatorAddress = VALIDATOR_ADDRESSES[networkId as keyof typeof VALIDATOR_ADDRESSES];
  
  if (!endpoint || !('lcd' in endpoint) || !validatorAddress) {
    console.warn(`No endpoint or validator address for ${networkId}`);
    return null;
  }

  try {
    // Fetch validator info (URL encode validator address for special chars like @)
    const encodedAddress = encodeURIComponent(validatorAddress);
    const validatorUrl = `${endpoint.lcd}/cosmos/staking/v1beta1/validators/${encodedAddress}`;
    const validatorRes = await fetch(validatorUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!validatorRes.ok) {
      console.error(`Failed to fetch validator for ${networkId}: ${validatorRes.status}`);
      return null;
    }

    const validatorData: CosmosValidatorResponse = await validatorRes.json();
    const validator = validatorData.validator;

    // Fetch pool data for total bonded tokens
    const poolUrl = `${endpoint.lcd}/cosmos/staking/v1beta1/pool`;
    const poolRes = await fetch(poolUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 },
    });

    let bondedTokens = 0;
    if (poolRes.ok) {
      const poolData: CosmosPoolResponse = await poolRes.json();
      const poolDecimals = TOKEN_DECIMALS[networkId] || 6;
      // Use BigInt for large numbers to avoid precision loss
      const rawBonded = BigInt(poolData.pool.bonded_tokens);
      const poolDivisor = BigInt(Math.pow(10, Math.min(poolDecimals, 18)));
      const poolRemainingDecimals = Math.max(0, poolDecimals - 18);
      bondedTokens = Number(rawBonded / poolDivisor) / Math.pow(10, poolRemainingDecimals);
    }

    // Parse validator data
    const decimals = TOKEN_DECIMALS[networkId] || 6;
    // Use BigInt for large numbers to avoid precision loss, then convert to number
    const rawTokens = BigInt(validator.tokens);
    const divisor = BigInt(Math.pow(10, Math.min(decimals, 18))); // Handle up to 18 decimals
    const remainingDecimals = Math.max(0, decimals - 18);
    const tokens = Number(rawTokens / divisor) / Math.pow(10, remainingDecimals);
    const commission = parseFloat(validator.commission.commission_rates.rate) * 100;
    const votingPower = bondedTokens > 0 ? (tokens / bondedTokens) * 100 : 0;

    // Map status
    const statusMap: Record<string, 'bonded' | 'unbonding' | 'unbonded'> = {
      'BOND_STATUS_BONDED': 'bonded',
      'BOND_STATUS_UNBONDING': 'unbonding',
      'BOND_STATUS_UNBONDED': 'unbonded',
    };

    return {
      network: networkId,
      moniker: validator.description.moniker,
      operatorAddress: validator.operator_address,
      status: statusMap[validator.status] || 'unbonded',
      jailed: validator.jailed,
      tokens,
      commission,
      bondedTokens,
      votingPower,
    };
  } catch (error) {
    console.error(`Error fetching ${networkId} validator:`, error);
    return null;
  }
}

/**
 * Fetch all validators to determine rank
 * Endpoint: /cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=500
 */
export async function fetchValidatorRank(
  networkId: string,
  validatorAddress: string
): Promise<{ rank: number; total: number } | null> {
  const endpoint = ENDPOINTS[networkId as keyof typeof ENDPOINTS];
  
  if (!endpoint || !('lcd' in endpoint)) {
    return null;
  }

  try {
    const url = `${endpoint.lcd}/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=500`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (!res.ok) return null;

    const data = await res.json();
    const validators = data.validators || [];
    
    // Sort by tokens (descending)
    validators.sort((a: { tokens: string }, b: { tokens: string }) => 
      parseInt(b.tokens) - parseInt(a.tokens)
    );

    const rank = validators.findIndex(
      (v: { operator_address: string }) => v.operator_address === validatorAddress
    ) + 1;

    return {
      rank: rank || validators.length,
      total: validators.length,
    };
  } catch (error) {
    console.error(`Error fetching validator rank for ${networkId}:`, error);
    return null;
  }
}

/**
 * Fetch complete validator data including rank
 */
export async function fetchCompleteCosmosValidator(
  networkId: string
): Promise<ValidatorData | null> {
  const validatorData = await fetchCosmosValidator(networkId);
  if (!validatorData) return null;

  const validatorAddress = VALIDATOR_ADDRESSES[networkId as keyof typeof VALIDATOR_ADDRESSES];
  const rankData = await fetchValidatorRank(networkId, validatorAddress as string);
  
  if (rankData) {
    validatorData.rank = rankData.rank;
    validatorData.totalValidators = rankData.total;
  }

  return validatorData;
}
