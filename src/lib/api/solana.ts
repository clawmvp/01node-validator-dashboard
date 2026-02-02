// Solana RPC API client
// Documentation: https://solana.com/docs/rpc/http/getvoteaccounts

import { ENDPOINTS, VALIDATOR_ADDRESSES } from './endpoints';

interface VoteAccount {
  votePubkey: string;
  nodePubkey: string;
  activatedStake: number; // in lamports
  epochVoteAccount: boolean;
  commission: number; // 0-100
  lastVote: number;
  epochCredits: Array<[number, number, number]>;
  rootSlot: number;
}

interface GetVoteAccountsResponse {
  result: {
    current: VoteAccount[];
    delinquent: VoteAccount[];
  };
}

export interface SolanaValidatorData {
  network: 'solana';
  votePubkey: string;
  nodePubkey: string;
  activatedStake: number; // in SOL
  activatedStakeLamports: number;
  commission: number;
  isDelinquent: boolean;
  lastVote: number;
  rank?: number;
  totalValidators?: number;
  totalStake?: number; // Total network stake in SOL
  votingPower?: number; // Percentage
}

const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Fetch Solana validator data using getVoteAccounts RPC method
 * 
 * RPC Method: getVoteAccounts
 * Params: { votePubkey: "validator_vote_pubkey" }
 */
export async function fetchSolanaValidator(): Promise<SolanaValidatorData | null> {
  const votePubkey = VALIDATOR_ADDRESSES.solana;
  const rpcEndpoint = ENDPOINTS.solana.rpc;

  try {
    // First, get all vote accounts to calculate rank and total stake
    const allAccountsResponse = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getVoteAccounts',
        params: [{ commitment: 'finalized' }],
      }),
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!allAccountsResponse.ok) {
      console.error(`Solana RPC error: ${allAccountsResponse.status}`);
      return null;
    }

    const allData: GetVoteAccountsResponse = await allAccountsResponse.json();
    
    if (!allData.result) {
      console.error('Invalid Solana RPC response');
      return null;
    }

    const allValidators = [...allData.result.current, ...allData.result.delinquent];
    
    // Find our validator
    const ourValidator = allValidators.find(v => v.votePubkey === votePubkey);
    
    if (!ourValidator) {
      console.error(`Validator ${votePubkey} not found`);
      return null;
    }

    // Calculate total stake
    const totalStakeLamports = allValidators.reduce((sum, v) => sum + v.activatedStake, 0);
    const totalStake = totalStakeLamports / LAMPORTS_PER_SOL;

    // Sort by stake to find rank
    const sortedValidators = [...allData.result.current].sort(
      (a, b) => b.activatedStake - a.activatedStake
    );
    const rank = sortedValidators.findIndex(v => v.votePubkey === votePubkey) + 1;

    const isDelinquent = allData.result.delinquent.some(v => v.votePubkey === votePubkey);
    const activatedStake = ourValidator.activatedStake / LAMPORTS_PER_SOL;
    const votingPower = (ourValidator.activatedStake / totalStakeLamports) * 100;

    return {
      network: 'solana',
      votePubkey: ourValidator.votePubkey,
      nodePubkey: ourValidator.nodePubkey,
      activatedStake,
      activatedStakeLamports: ourValidator.activatedStake,
      commission: ourValidator.commission,
      isDelinquent,
      lastVote: ourValidator.lastVote,
      rank: isDelinquent ? undefined : rank,
      totalValidators: allData.result.current.length,
      totalStake,
      votingPower,
    };
  } catch (error) {
    console.error('Error fetching Solana validator:', error);
    return null;
  }
}

/**
 * Get current Solana epoch info
 * RPC Method: getEpochInfo
 */
export async function fetchSolanaEpochInfo(): Promise<{
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
} | null> {
  try {
    const response = await fetch(ENDPOINTS.solana.rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getEpochInfo',
        params: [{ commitment: 'finalized' }],
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error fetching Solana epoch info:', error);
    return null;
  }
}
