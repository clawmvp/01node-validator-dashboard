// NEAR Protocol RPC API client
// Documentation: https://docs.near.org/api/rpc/introduction

import { ENDPOINTS, VALIDATOR_ADDRESSES } from './endpoints';

export interface NearValidatorData {
  poolId: string;
  totalStakedBalance: number; // In NEAR tokens
  totalStakedBalanceYocto: string; // In yoctoNEAR (24 decimals)
  ownersBalance: number;
  rewardFeeFraction: number; // Fee percentage (e.g., 3 for 3%)
  delegatorsCount?: number;
}

interface NearRpcResponse {
  jsonrpc: string;
  id: string;
  result?: {
    result: number[]; // Byte array that needs to be decoded
    logs: string[];
    block_height: number;
    block_hash: string;
  };
  error?: {
    name: string;
    cause: {
      name: string;
      info: Record<string, unknown>;
    };
    code: number;
    message: string;
    data: string;
  };
}

// NEAR has 24 decimals (yoctoNEAR)
const NEAR_DECIMALS = 24;

/**
 * Call a view function on a NEAR contract
 */
async function callViewFunction(
  accountId: string,
  methodName: string,
  args: Record<string, unknown> = {}
): Promise<unknown> {
  const endpoint = ENDPOINTS.near;
  
  // Encode args to base64
  const argsBase64 = Buffer.from(JSON.stringify(args)).toString('base64');
  
  const response = await fetch(endpoint.rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'dontcare',
      method: 'query',
      params: {
        request_type: 'call_function',
        finality: 'final',
        account_id: accountId,
        method_name: methodName,
        args_base64: argsBase64,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`NEAR RPC error: ${response.status}`);
  }

  const data: NearRpcResponse = await response.json();
  
  if (data.error) {
    throw new Error(`NEAR RPC error: ${data.error.message}`);
  }

  if (!data.result?.result) {
    throw new Error('No result in NEAR RPC response');
  }

  // Decode the byte array to string and parse as JSON
  const resultString = String.fromCharCode(...data.result.result);
  return JSON.parse(resultString);
}

/**
 * Fetch staking pool total staked balance
 */
async function getStakedBalance(poolId: string): Promise<string> {
  const result = await callViewFunction(poolId, 'get_total_staked_balance', {});
  return result as string;
}

/**
 * Fetch staking pool owner's balance
 */
async function getOwnerBalance(poolId: string): Promise<string> {
  const result = await callViewFunction(poolId, 'get_owner_total_balance', {});
  return result as string;
}

/**
 * Fetch reward fee fraction
 */
async function getRewardFeeFraction(poolId: string): Promise<{ numerator: number; denominator: number }> {
  const result = await callViewFunction(poolId, 'get_reward_fee_fraction', {});
  return result as { numerator: number; denominator: number };
}

/**
 * Fetch number of accounts (delegators)
 */
async function getNumberOfAccounts(poolId: string): Promise<number> {
  try {
    const result = await callViewFunction(poolId, 'get_number_of_accounts', {});
    return result as number;
  } catch {
    // Some pools may not have this method
    return 0;
  }
}

/**
 * Fetch complete NEAR validator data
 */
export async function fetchNearValidator(): Promise<NearValidatorData | null> {
  const poolId = VALIDATOR_ADDRESSES.near;
  
  if (!poolId) {
    console.warn('No NEAR validator address configured');
    return null;
  }

  try {
    // Fetch all data in parallel
    const [
      totalStakedBalanceYocto,
      ownersBalanceYocto,
      rewardFeeFraction,
      delegatorsCount,
    ] = await Promise.all([
      getStakedBalance(poolId),
      getOwnerBalance(poolId).catch(() => '0'),
      getRewardFeeFraction(poolId),
      getNumberOfAccounts(poolId),
    ]);

    // Convert from yoctoNEAR (24 decimals) to NEAR
    const totalStakedBalance = Number(BigInt(totalStakedBalanceYocto) / BigInt(10 ** (NEAR_DECIMALS - 6))) / 1e6;
    const ownersBalance = Number(BigInt(ownersBalanceYocto) / BigInt(10 ** (NEAR_DECIMALS - 6))) / 1e6;
    
    // Calculate fee percentage
    const feePercentage = (rewardFeeFraction.numerator / rewardFeeFraction.denominator) * 100;

    return {
      poolId,
      totalStakedBalance,
      totalStakedBalanceYocto,
      ownersBalance,
      rewardFeeFraction: feePercentage,
      delegatorsCount,
    };
  } catch (error) {
    console.error('Error fetching NEAR validator:', error);
    return null;
  }
}
