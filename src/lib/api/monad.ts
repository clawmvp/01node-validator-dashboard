// Monad staking precompile API client
// Precompile address: 0x0000000000000000000000000000000000001000
// Docs: https://docs.monad.xyz/developer-essentials/staking/staking-precompile

import { ENDPOINTS, VALIDATOR_ADDRESSES } from './endpoints';

const STAKING_PRECOMPILE = '0x0000000000000000000000000000000000001000';
const MON_DECIMALS = 18;

// 25 MON per block, ~0.396s block time (50,000 blocks per ~5.5 hours)
const BLOCK_REWARD_MON = 25;
const APPROX_BLOCK_TIME_SECONDS = 0.396;
const SECONDS_PER_YEAR = 365.25 * 24 * 3600;
const BLOCKS_PER_YEAR = SECONDS_PER_YEAR / APPROX_BLOCK_TIME_SECONDS;

export interface MonadValidatorData {
  network: 'monad';
  validatorId: number;
  authAddress: string;
  stake: number;
  commission: number;
  consensusStake: number;
  rank?: number;
  totalValidators?: number;
  totalNetworkStake?: number;
  apr?: number;
}

function encodeUint64(value: number): string {
  return value.toString(16).padStart(64, '0');
}

async function ethCall(rpc: string, data: string): Promise<string> {
  const response = await fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: STAKING_PRECOMPILE, data }, 'latest'],
    }),
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Monad RPC error: ${response.status}`);
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(`Monad RPC error: ${result.error.message}`);
  }

  return result.result;
}

function decodeWord(hex: string, wordIndex: number): bigint {
  const start = wordIndex * 64;
  return BigInt('0x' + hex.slice(start, start + 64));
}

function toMON(wei: bigint): number {
  return Number(wei) / 10 ** MON_DECIMALS;
}

/**
 * Fetch all consensus validator IDs (paginated)
 */
async function fetchConsensusValidatorIds(rpc: string): Promise<number[]> {
  const allIds: number[] = [];
  let startIndex = 0;

  while (true) {
    // getConsensusValidatorSet(uint32): 0xfb29b729
    const data = '0xfb29b729' + encodeUint64(startIndex);
    const result = await ethCall(rpc, data);
    const hex = result.slice(2);

    const isDone = Number(decodeWord(hex, 0));
    const nextIndex = Number(decodeWord(hex, 1));
    const arrLen = Number(decodeWord(hex, 3));

    for (let i = 0; i < arrLen; i++) {
      allIds.push(Number(decodeWord(hex, 4 + i)));
    }

    if (isDone) break;
    startIndex = nextIndex;
  }

  return allIds;
}

/**
 * Fetch a single validator's data by ID
 * getValidator(uint64): 0x2b6d639a
 */
async function fetchValidatorById(
  rpc: string,
  validatorId: number
): Promise<{
  authAddress: string;
  stake: bigint;
  commission: bigint;
  consensusStake: bigint;
} | null> {
  try {
    const data = '0x2b6d639a' + encodeUint64(validatorId);
    const result = await ethCall(rpc, data);
    const hex = result.slice(2);

    if (hex.length < 512) return null;

    const authAddress = '0x' + hex.slice(24, 64);
    const stake = decodeWord(hex, 2);
    const commission = decodeWord(hex, 4);
    const consensusStake = decodeWord(hex, 6);

    return { authAddress, stake, commission, consensusStake };
  } catch {
    return null;
  }
}

/**
 * Fetch 01node Monad validator data
 */
export async function fetchMonadValidator(): Promise<MonadValidatorData | null> {
  const rpc = ENDPOINTS.monad.rpc;
  const validatorId = Number(VALIDATOR_ADDRESSES.monad);

  try {
    const [validatorData, consensusIds] = await Promise.all([
      fetchValidatorById(rpc, validatorId),
      fetchConsensusValidatorIds(rpc),
    ]);

    if (!validatorData) {
      console.error(`Monad validator ID ${validatorId} not found`);
      return null;
    }

    const totalValidators = consensusIds.length;
    const commissionPct = toMON(validatorData.commission) * 100;
    const stakeAmount = toMON(validatorData.stake);

    // Compute rank, total network stake, and APR by fetching all validators
    let rank: number | undefined;
    let totalNetworkStake: number | undefined;
    let apr: number | undefined;
    try {
      const batchSize = 10;
      const stakes: { id: number; stake: bigint }[] = [];

      for (let i = 0; i < consensusIds.length; i += batchSize) {
        const batch = consensusIds.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map((id) => fetchValidatorById(rpc, id))
        );
        results.forEach((r, idx) => {
          if (r) stakes.push({ id: batch[idx], stake: r.stake });
        });
      }

      stakes.sort((a, b) => (b.stake > a.stake ? 1 : b.stake < a.stake ? -1 : 0));
      const foundIdx = stakes.findIndex((s) => s.id === validatorId);
      if (foundIdx >= 0) rank = foundIdx + 1;

      const totalStakeWei = stakes.reduce((sum, s) => sum + s.stake, BigInt(0));
      totalNetworkStake = toMON(totalStakeWei);

      if (totalNetworkStake > 0) {
        const annualRewards = BLOCKS_PER_YEAR * BLOCK_REWARD_MON;
        apr = (annualRewards / totalNetworkStake) * 100;
      }
    } catch (err) {
      console.error('Monad rank/APR calculation failed:', err);
    }

    return {
      network: 'monad',
      validatorId,
      authAddress: validatorData.authAddress,
      stake: stakeAmount,
      commission: commissionPct,
      consensusStake: toMON(validatorData.consensusStake),
      rank,
      totalValidators,
      totalNetworkStake,
      apr,
    };
  } catch (error) {
    console.error('Error fetching Monad validator:', error);
    return null;
  }
}
