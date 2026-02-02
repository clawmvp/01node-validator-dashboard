'use client';

import { useMemo } from 'react';
import { Header } from '@/components/dashboard/Header';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { NetworkCard } from '@/components/dashboard/NetworkCard';
import { StakeDistributionChart } from '@/components/dashboard/StakeDistributionChart';
import { APRChart } from '@/components/dashboard/APRChart';
import { NetworksTable } from '@/components/dashboard/NetworksTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { networks } from '@/data/networks';
import { NetworkMetrics } from '@/types/network';
import { 
  LayoutGrid, 
  Table2, 
  BarChart3,
  Info
} from 'lucide-react';

export default function Dashboard() {
  // Calculate metrics
  const metrics: NetworkMetrics = useMemo(() => {
    const activeNetworks = networks.filter(n => n.status === 'active');
    
    // Calculate total stake (placeholder - will be from API)
    const totalStakeUsd = activeNetworks.reduce((sum, n) => sum + (n.stake?.usdValue || 0), 0);
    
    // Calculate average APR (only for networks with APR data)
    const networksWithApr = activeNetworks.filter(n => n.apr);
    const avgApr = networksWithApr.length > 0
      ? networksWithApr.reduce((sum, n) => sum + ((n.apr!.min + n.apr!.max) / 2), 0) / networksWithApr.length
      : 0;
    
    // Estimated revenue (placeholder calculation)
    const estimatedMonthlyRevenue = activeNetworks.reduce((sum, n) => 
      sum + (n.estimatedMonthlyRevenue || 0), 0);
    
    return {
      totalStakeUsd: totalStakeUsd || 540000000, // From stakingrewards.com
      totalNetworks: networks.length,
      activeNetworks: activeNetworks.length,
      estimatedMonthlyRevenue: estimatedMonthlyRevenue || 45000, // Placeholder
      estimatedYearlyRevenue: (estimatedMonthlyRevenue || 45000) * 12,
      avgApr,
    };
  }, []);

  const activeNetworks = networks.filter(n => n.status === 'active');
  const comingSoonNetworks = networks.filter(n => n.status === 'coming_soon');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6">
        {/* Page Title */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Validator Analytics</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Monitor 01node validator performance across {metrics.activeNetworks} blockchain networks. 
            Track stake, APR, revenue, and profitability to optimize operations.
          </p>
        </div>

        {/* Metrics Overview */}
        <MetricsCards metrics={metrics} />

        {/* Main Content Tabs */}
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table2 className="w-4 h-4" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Charts
            </TabsTrigger>
          </TabsList>

          {/* Grid View */}
          <TabsContent value="grid" className="space-y-6">
            {/* Active Networks */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">Active Networks</h2>
                <Badge variant="outline">{activeNetworks.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeNetworks.map((network) => (
                  <NetworkCard key={network.id} network={network} />
                ))}
              </div>
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
              <APRChart networks={networks} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Data Notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
          <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Data Sources & Next Steps</p>
            <p className="text-sm text-muted-foreground">
              This dashboard shows static data from 01node.com. To display live stake amounts, 
              revenue estimates, and profitability analytics, API integrations are needed for:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>Cosmos ecosystem (via Mintscan API or direct chain queries)</li>
              <li>Solana (via Solana Beach API or direct RPC)</li>
              <li>Sui (via Suiscan API)</li>
              <li>Token prices (via CoinGecko or similar)</li>
              <li>Infrastructure costs (manual input or from your cost tracking system)</li>
            </ul>
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
    </div>
  );
}
