// SUI RPC API client
// Documentation: https://docs.sui.io/sui-api-ref

import { ENDPOINTS, VALIDATOR_ADDRESSES } from './endpoints';

interface SuiValidatorApy {
  address: string;
  apy: number;
}

interface SuiValidatorInfo {
  suiAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  projectUrl: string;
  netAddress: string;
  p2pAddress: string;
  primaryAddress: string;
  workerAddress: string;
  nextEpochProtocolPubkeyBytes: string | null;
  nextEpochProofOfPossession: string | null;
  nextEpochNetworkAddress: string | null;
  nextEpochP2pAddress: string | null;
  nextEpochPrimaryAddress: string | null;
  nextEpochWorkerAddress: string | null;
  votingPower: string;
  operationCapId: string;
  gasPrice: string;
  commissionRate: string;
  nextEpochStake: string;
  nextEpochGasPrice: string;
  nextEpochCommissionRate: string;
  stakingPoolId: string;
  stakingPoolActivationEpoch: string;
  stakingPoolDeactivationEpoch: string | null;
  stakingPoolSuiBalance: string;
  rewardsPool: string;
  poolTokenBalance: string;
  pendingStake: string;
  pendingTotalSuiWithdraw: string;
  pendingPoolTokenWithdraw: string;
  exchangeRatesId: string;
  exchangeRatesSize: string;
}

interface SuiSystemState {
  epoch: string;
  protocolVersion: string;
  systemStateVersion: string;
  storageFundTotalObjectStorageRebates: string;
  storageFundNonRefundableBalance: string;
  referenceGasPrice: string;
  safeMode: boolean;
  safeModeStorageRewards: string;
  safeModeComputationRewards: string;
  safeModeStorageRebates: string;
  safeModeNonRefundableStorageFee: string;
  epochStartTimestampMs: string;
  epochDurationMs: string;
  stakeSubsidyStartEpoch: string;
  maxValidatorCount: string;
  minValidatorJoiningStake: string;
  validatorLowStakeThreshold: string;
  validatorVeryLowStakeThreshold: string;
  validatorLowStakeGracePeriod: string;
  stakeSubsidyBalance: string;
  stakeSubsidyDistributionCounter: string;
  stakeSubsidyCurrentDistributionAmount: string;
  stakeSubsidyPeriodLength: string;
  stakeSubsidyDecreaseRate: number;
  totalStake: string;
  activeValidators: SuiValidatorInfo[];
  pendingActiveValidatorsId: string;
  pendingActiveValidatorsSize: string;
  pendingRemovals: string[];
  stakingPoolMappingsId: string;
  stakingPoolMappingsSize: string;
  inactivePoolsId: string;
  inactivePoolsSize: string;
  validatorCandidatesId: string;
  validatorCandidatesSize: string;
  atRiskValidators: Array<[string, string]>;
  validatorReportRecords: Array<[string, string[]]>;
}

export interface SuiValidatorData {
  network: 'sui';
  address: string;
  name: string;
  stakingPoolSuiBalance: number; // in SUI
  votingPower: number; // percentage
  commissionRate: number; // percentage
  apy?: number; // percentage
  rank?: number;
  totalValidators?: number;
  totalStake?: number; // Total network stake in SUI
  gasPrice: number;
  nextEpochStake: number;
}

const MIST_PER_SUI = 1_000_000_000; // 10^9

/**
 * Fetch SUI validator data using suix_getLatestSuiSystemState
 * 
 * RPC Method: suix_getLatestSuiSystemState
 */
export async function fetchSuiValidator(): Promise<SuiValidatorData | null> {
  const validatorAddress = VALIDATOR_ADDRESSES.sui;
  const rpcEndpoint = ENDPOINTS.sui.rpc;

  try {
    // Fetch system state which includes all validators
    const systemStateResponse = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getLatestSuiSystemState',
        params: [],
      }),
      next: { revalidate: 300 },
    });

    if (!systemStateResponse.ok) {
      console.error(`SUI RPC error: ${systemStateResponse.status}`);
      return null;
    }

    const systemStateData = await systemStateResponse.json();
    
    if (!systemStateData.result) {
      console.error('Invalid SUI RPC response');
      return null;
    }

    const systemState: SuiSystemState = systemStateData.result;
    const validators = systemState.activeValidators;
    
    // Find our validator
    const ourValidator = validators.find(v => v.suiAddress === validatorAddress);
    
    if (!ourValidator) {
      console.error(`SUI Validator ${validatorAddress} not found`);
      return null;
    }

    // Fetch APY data
    let apy: number | undefined;
    try {
      const apyResponse = await fetch(rpcEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'suix_getValidatorsApy',
          params: [],
        }),
        next: { revalidate: 300 },
      });

      if (apyResponse.ok) {
        const apyData = await apyResponse.json();
        if (apyData.result?.apys) {
          const validatorApy = apyData.result.apys.find(
            (a: SuiValidatorApy) => a.address === validatorAddress
          );
          if (validatorApy) {
            apy = Math.round(validatorApy.apy * 100 * 100) / 100; // Convert to percentage and round to 2 decimals
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch SUI APY:', e);
    }

    // Calculate totals and rank
    const totalStakeMist = BigInt(systemState.totalStake);
    const totalStake = Number(totalStakeMist) / MIST_PER_SUI;
    
    // Sort validators by stake to find rank
    const sortedValidators = [...validators].sort((a, b) => {
      const stakeA = BigInt(a.stakingPoolSuiBalance);
      const stakeB = BigInt(b.stakingPoolSuiBalance);
      return stakeB > stakeA ? 1 : stakeB < stakeA ? -1 : 0;
    });
    
    const rank = sortedValidators.findIndex(v => v.suiAddress === validatorAddress) + 1;
    
    const stakingPoolBalance = Number(BigInt(ourValidator.stakingPoolSuiBalance)) / MIST_PER_SUI;
    const votingPower = parseFloat(ourValidator.votingPower) / 100; // Already in basis points
    const commissionRate = parseInt(ourValidator.commissionRate) / 100; // Commission in basis points

    return {
      network: 'sui',
      address: ourValidator.suiAddress,
      name: ourValidator.name,
      stakingPoolSuiBalance: stakingPoolBalance,
      votingPower,
      commissionRate,
      apy,
      rank,
      totalValidators: validators.length,
      totalStake,
      gasPrice: parseInt(ourValidator.gasPrice),
      nextEpochStake: Number(BigInt(ourValidator.nextEpochStake)) / MIST_PER_SUI,
    };
  } catch (error) {
    console.error('Error fetching SUI validator:', error);
    return null;
  }
}
