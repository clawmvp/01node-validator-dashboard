'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/dashboard/Header';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { NetworkCard } from '@/components/dashboard/NetworkCard';
import { StakeDistributionChart } from '@/components/dashboard/StakeDistributionChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { NetworksTable } from '@/components/dashboard/NetworksTable';
import { ChainlinkCard } from '@/components/dashboard/ChainlinkCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useValidatorData } from '@/hooks/useValidatorData';
import { Network } from '@/types/network';
import { 
  LayoutGrid, 
  Table2, 
  BarChart3,
  Info,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowDownWideNarrow,
  Coins,
  DollarSign,
  Percent,
  Link2
} from 'lucide-react';

type SortBy = 'stake' | 'revenue' | 'apr';

export default function Dashboard() {
  const [sortBy, setSortBy] = useState<SortBy>('stake');
  
  const { 
    networks, 
    metrics, 
    isLoading, 
    error, 
    lastUpdated, 
    apiErrors,
    refresh 
  } = useValidatorData();

  // Sort function
  const sortNetworks = (networksToSort: Network[]): Network[] => {
    return [...networksToSort].sort((a, b) => {
      // Networks with live data come first
      const aHasData = a.stake?.usdValue || a.estimatedMonthlyRevenue;
      const bHasData = b.stake?.usdValue || b.estimatedMonthlyRevenue;
      
      if (aHasData && !bHasData) return -1;
      if (!aHasData && bHasData) return 1;
      
      // Then sort by selected criteria
      switch (sortBy) {
        case 'stake':
          return (b.stake?.usdValue || 0) - (a.stake?.usdValue || 0);
        case 'revenue':
          return (b.estimatedMonthlyRevenue || 0) - (a.estimatedMonthlyRevenue || 0);
        case 'apr':
          const aprA = a.apr ? (a.apr.min + a.apr.max) / 2 : 0;
          const aprB = b.apr ? (b.apr.min + b.apr.max) / 2 : 0;
          return aprB - aprA;
        default:
          return 0;
      }
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activeNetworks = useMemo(() => 
    sortNetworks(networks.filter(n => n.status === 'active')),
    [networks, sortBy]
  );
  
  const comingSoonNetworks = networks.filter(n => n.status === 'coming_soon');
  const networksWithLiveData = activeNetworks.filter(n => n.stake?.usdValue);

  return (
    <Tabs defaultValue="grid" className="min-h-screen bg-background">
      <Header onRefresh={refresh} isRefreshing={isLoading} />
      
      <main className="container py-6 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">Validator Analytics</h1>
              <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1">Beta</Badge>
            </div>
            
            {/* Data Status */}
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Badge variant="outline" className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Loading live data...
                </Badge>
              ) : error ? (
                <Badge variant="destructive" className="flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  Using cached data
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Live data ({networksWithLiveData.length} networks)
                </Badge>
              )}
              
              {lastUpdated && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-3 h-3 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground max-w-2xl">
            Monitor 01node validator performance across {metrics.activeNetworks} blockchain networks. 
            Track stake, APR, revenue, and profitability to optimize operations.
          </p>
        </div>

        {/* API Errors Warning */}
        {apiErrors.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-600">Some APIs returned errors</p>
              <ul className="text-xs text-amber-600/80 list-disc list-inside">
                {apiErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {apiErrors.length > 5 && (
                  <li>...and {apiErrors.length - 5} more errors</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Metrics Overview */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] rounded-lg" />
            ))}
          </div>
        ) : (
          <MetricsCards metrics={metrics} />
        )}

        {/* Mobile Navigation Tabs */}
        <TabsList className="md:hidden w-full justify-start overflow-x-auto">
          <TabsTrigger value="grid" className="flex items-center gap-1.5">
            <LayoutGrid className="w-4 h-4" />
            Grid
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-1.5">
            <Table2 className="w-4 h-4" />
            Table
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="chainlink" className="flex items-center gap-1.5">
            <Link2 className="w-4 h-4" />
            Chainlink
          </TabsTrigger>
        </TabsList>

        {/* Grid View */}
          <TabsContent value="grid" className="space-y-6">
            {/* Active Networks */}
            <section>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight">Active Networks</h2>
                  <Badge variant="outline" className="font-semibold">{activeNetworks.length}</Badge>
                  {networksWithLiveData.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {networksWithLiveData.length} with live data
                    </Badge>
                  )}
                </div>
                
                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <ArrowDownWideNarrow className="w-4 h-4" />
                    Sort by:
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant={sortBy === 'stake' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('stake')}
                      className="flex items-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      Stake
                    </Button>
                    <Button
                      variant={sortBy === 'revenue' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('revenue')}
                      className="flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Revenue
                    </Button>
                    <Button
                      variant={sortBy === 'apr' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy('apr')}
                      className="flex items-center gap-1.5"
                    >
                      <Percent className="w-3.5 h-3.5" />
                      APR
                    </Button>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} className="h-[300px] rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeNetworks.map((network) => (
                    <NetworkCard key={network.id} network={network} />
                  ))}
                </div>
              )}
            </section>

            {/* Coming Soon */}
            {comingSoonNetworks.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">Coming Soon</h2>
                  <Badge variant="secondary">{comingSoonNetworks.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {comingSoonNetworks.map((network) => (
                    <NetworkCard key={network.id} network={network} />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          {/* Table View */}
          <TabsContent value="table">
            <NetworksTable networks={networks} />
          </TabsContent>

          {/* Charts View */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <StakeDistributionChart networks={networks} />
              <RevenueChart networks={networks} />
            </div>
          </TabsContent>

          {/* Chainlink View */}
          <TabsContent value="chainlink" className="space-y-6">
            <ChainlinkCard />
          </TabsContent>

        {/* API Documentation */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Live Data Sources</p>
            <p className="text-sm text-muted-foreground">
              This dashboard fetches live data from blockchain APIs:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-0.5">
              <li><strong>Cosmos chains:</strong> LCD REST API <code className="text-xs bg-muted px-1 rounded">/cosmos/staking/v1beta1/validators</code></li>
              <li><strong>Solana:</strong> RPC method <code className="text-xs bg-muted px-1 rounded">getVoteAccounts</code></li>
              <li><strong>SUI:</strong> RPC method <code className="text-xs bg-muted px-1 rounded">suix_getLatestSuiSystemState</code></li>
              <li><strong>Prices:</strong> CoinGecko API <code className="text-xs bg-muted px-1 rounded">/simple/price</code></li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              API endpoints: <code className="bg-muted px-1 rounded">/api/validators</code>, <code className="bg-muted px-1 rounded">/api/validators/[network]</code>, <code className="bg-muted px-1 rounded">/api/prices</code>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t pt-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built for</span>
              <a 
                href="https://01node.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                01node
              </a>
              <span>validator operations</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Inspired by</span>
              <a 
                href="https://observatory.zone" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Observatory.zone
              </a>
              <span>&</span>
              <a 
                href="https://www.mintscan.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Mintscan
              </a>
            </div>
          </div>
        </footer>
      </main>
    </Tabs>
  );
}
