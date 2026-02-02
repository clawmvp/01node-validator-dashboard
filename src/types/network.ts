export interface Network {
  id: string;
  name: string;
  token: string;
  logo: string;
  apr: {
    min: number;
    max: number;
  } | null;
  status: 'active' | 'coming_soon' | 'inactive';
  ecosystem: 'cosmos' | 'ethereum' | 'solana' | 'sui' | 'near' | 'other';
  
  // Staking data (to be fetched from APIs)
  stake?: {
    amount: number;
    usdValue: number;
  };
  commission?: number;
  rank?: number;
  totalValidators?: number;
  
  // Validator addresses
  validatorAddress?: string;
  explorerUrl?: string;
  stakeUrl?: string;
  
  // Profitability data
  estimatedMonthlyRevenue?: number;
  estimatedYearlyRevenue?: number;
  
  // Infrastructure costs (to be provided by user)
  infrastructureCost?: number;
  operationalCost?: number;
}

export interface NetworkMetrics {
  totalStakeUsd: number;
  totalNetworks: number;
  activeNetworks: number;
  estimatedMonthlyRevenue: number;
  estimatedYearlyRevenue: number;
  avgApr: number;
}

export interface InfrastructureCosts {
  networkId: string;
  serverCost: number;
  bandwidthCost: number;
  storageCost: number;
  operationalCost: number;
  totalMonthlyCost: number;
}

export type SortOption = 'stake' | 'apr' | 'revenue' | 'name' | 'profitability';
export type FilterOption = 'all' | 'cosmos' | 'ethereum' | 'solana' | 'sui' | 'other' | 'profitable' | 'unprofitable';
