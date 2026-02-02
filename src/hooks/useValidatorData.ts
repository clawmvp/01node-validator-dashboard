'use client';

import { useState, useEffect, useCallback } from 'react';
import { Network, NetworkMetrics } from '@/types/network';
import { networks as staticNetworks } from '@/data/networks';

interface ValidatorDataState {
  networks: Network[];
  metrics: NetworkMetrics;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  apiErrors: string[];
}

const calculateStaticMetrics = (networks: Network[]): NetworkMetrics => {
  const activeNetworks = networks.filter(n => n.status === 'active');
  const networksWithApr = activeNetworks.filter(n => n.apr);
  
  const avgApr = networksWithApr.length > 0
    ? networksWithApr.reduce((sum, n) => sum + ((n.apr!.min + n.apr!.max) / 2), 0) / networksWithApr.length
    : 0;

  return {
    totalStakeUsd: 540000000, // From stakingrewards.com
    totalNetworks: networks.length,
    activeNetworks: activeNetworks.length,
    estimatedMonthlyRevenue: 0,
    estimatedYearlyRevenue: 0,
    avgApr,
  };
};

export function useValidatorData() {
  const [state, setState] = useState<ValidatorDataState>({
    networks: staticNetworks,
    metrics: calculateStaticMetrics(staticNetworks),
    isLoading: true,
    error: null,
    lastUpdated: null,
    apiErrors: [],
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch('/api/validators', {
        next: { revalidate: 300 },
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      setState({
        networks: data.networks,
        metrics: data.metrics,
        isLoading: false,
        error: null,
        lastUpdated: data.lastUpdated,
        apiErrors: data.errors || [],
      });
    } catch (error) {
      console.error('Failed to fetch validator data:', error);
      
      // Keep static data on error
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refresh,
  };
}

/**
 * Hook to fetch data for a single network
 */
export function useNetworkData(networkId: string) {
  const [data, setData] = useState<{
    network: Network | null;
    isLoading: boolean;
    error: string | null;
  }>({
    network: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const response = await fetch(`/api/validators/${networkId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Merge with static network data
        const staticNetwork = staticNetworks.find(n => n.id === networkId);
        if (staticNetwork && result.data) {
          setData({
            network: {
              ...staticNetwork,
              stake: result.data.usdValue ? {
                amount: result.data.tokens || result.data.activatedStake || result.data.stakingPoolSuiBalance,
                usdValue: result.data.usdValue,
              } : undefined,
              commission: result.data.commission || result.data.commissionRate,
              rank: result.data.rank,
              totalValidators: result.data.totalValidators,
            },
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch',
        }));
      }
    };

    fetchNetwork();
  }, [networkId]);

  return data;
}
