'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { 
  Link2, 
  ExternalLink, 
  TrendingUp, 
  Wallet,
  Clock,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { ChainlinkPayment } from '@/lib/api/chainlink';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface ChainlinkStats {
  totalReceived: number;
  totalSent: number;
  netBalance: number;
  currentBalance: number;
  currentBalanceUsd?: number;
  payments: ChainlinkPayment[];
  last7Days: number;
  last30Days: number;
  last90Days: number;
  linkPrice?: number;
  hasTransferHistory?: boolean;
  config: {
    nodeOperatorAddress: string;
    joinedDate: string;
    description: string;
  };
}

type TimeFilter = '7d' | '30d' | '90d' | 'all';

export function ChainlinkCard() {
  const [stats, setStats] = useState<ChainlinkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30d');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/chainlink');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Chainlink data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter payments based on time filter
  const filteredPayments = useMemo(() => {
    if (!stats?.payments) return [];
    
    const now = Date.now();
    const filterMs = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    };
    
    const cutoff = now - filterMs[timeFilter];
    
    return stats.payments
      .filter(p => p.direction === 'in' && new Date(p.timestamp).getTime() >= cutoff)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [stats?.payments, timeFilter]);

  // Aggregate payments by day for chart
  const chartData = useMemo(() => {
    if (!filteredPayments.length) return [];
    
    const dailyData: Record<string, { date: string; amount: number; count: number }> = {};
    
    filteredPayments.forEach(payment => {
      const date = new Date(payment.timestamp).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, amount: 0, count: 0 };
      }
      dailyData[date].amount += payment.amount;
      dailyData[date].count += 1;
    });
    
    return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredPayments]);

  // Get total for selected period
  const periodTotal = useMemo(() => {
    if (!stats) return 0;
    switch (timeFilter) {
      case '7d': return stats.last7Days;
      case '30d': return stats.last30Days;
      case '90d': return stats.last90Days;
      default: return stats.totalReceived;
    }
  }, [stats, timeFilter]);

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-[300px]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Chainlink Node Operator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <Card className="col-span-full overflow-hidden border-0 shadow-lg">
      {/* Top accent */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />
      
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Link2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                Chainlink Node Operator
                <Badge variant="outline" className="bg-gradient-to-r from-blue-500/15 to-blue-500/5 text-blue-600 border-blue-500/30 font-semibold shadow-sm">
                  Since Oct 2021
                </Badge>
              </CardTitle>
              <p className="text-[13px] text-muted-foreground mt-1">
                Price Reference Data Feeds • Ethereum Mainnet
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a 
                href={`https://etherscan.io/address/${stats.config.nodeOperatorAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Etherscan
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 border shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              <Wallet className="w-4 h-4" />
              Current Balance
            </div>
            <p className="text-3xl font-bold tracking-tight">
              {formatNumber(stats.currentBalance)}
            </p>
            <p className="text-sm text-muted-foreground font-medium">LINK</p>
            {stats.currentBalanceUsd && (
              <p className="text-sm text-muted-foreground mt-1">
                ≈ {formatCurrency(stats.currentBalanceUsd)}
              </p>
            )}
          </div>
          
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
              Total Received
            </div>
            <p className="text-3xl font-bold tracking-tight text-emerald-600">
              {formatNumber(stats.totalReceived)}
            </p>
            <p className="text-sm text-emerald-600/80 font-medium">LINK</p>
            <p className="text-sm text-muted-foreground mt-1">
              All time
            </p>
          </div>
          
          <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Last 30 Days
            </div>
            <p className="text-3xl font-bold tracking-tight text-blue-600">
              {formatNumber(stats.last30Days)}
            </p>
            <p className="text-sm text-blue-600/80 font-medium">LINK</p>
            {stats.linkPrice && (
              <p className="text-sm text-muted-foreground mt-1">
                ≈ {formatCurrency(stats.last30Days * stats.linkPrice)}
              </p>
            )}
          </div>
          
          <div className="p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 border shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              LINK Price
            </div>
            <p className="text-3xl font-bold tracking-tight">
              ${stats.linkPrice?.toFixed(2) || 'N/A'}
            </p>
            <p className="text-sm text-muted-foreground font-medium">USD</p>
            <p className="text-sm text-muted-foreground mt-1">
              via CoinGecko
            </p>
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold">Payment History</h3>
          <div className="flex gap-1">
            {(['7d', '30d', '90d', 'all'] as const).map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter(filter)}
              >
                {filter === 'all' ? 'All Time' : filter.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Period Summary */}
        <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total received in selected period
            </span>
            <div className="text-right">
              <span className="text-xl font-bold text-blue-600">
                {formatNumber(periodTotal)} LINK
              </span>
              {stats.linkPrice && (
                <span className="text-sm text-muted-foreground ml-2">
                  ({formatCurrency(periodTotal * stats.linkPrice)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `${formatNumber(Number(value))} LINK`,
                    'Amount'
                  ]}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : stats.hasTransferHistory === false ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground p-6 bg-muted/30 rounded-lg border border-dashed">
            <p className="text-center mb-2">
              Payment history requires an Etherscan API key
            </p>
            <p className="text-xs text-center max-w-md">
              Add <code className="bg-muted px-1 rounded">ETHERSCAN_API_KEY</code> to your environment variables.
              Get a free key at{' '}
              <a 
                href="https://etherscan.io/apis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                etherscan.io/apis
              </a>
            </p>
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No payments in selected period
          </div>
        )}

        {/* Recent Payments Table */}
        {filteredPayments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Payments</h4>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-right p-3 font-medium">USD Value</th>
                    <th className="text-right p-3 font-medium">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.slice(0, 10).reverse().map((payment) => (
                    <tr key={payment.hash} className="border-t">
                      <td className="p-3">
                        {new Date(payment.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right font-medium text-emerald-600">
                        +{formatNumber(payment.amount)} LINK
                      </td>
                      <td className="p-3 text-right text-muted-foreground">
                        {stats.linkPrice 
                          ? formatCurrency(payment.amount * stats.linkPrice)
                          : '-'
                        }
                      </td>
                      <td className="p-3 text-right">
                        <a
                          href={`https://etherscan.io/tx/${payment.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {payment.hash.slice(0, 8)}...
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-muted-foreground">
          {stats.config.description}. Address:{' '}
          <code className="bg-muted px-1 rounded">
            {stats.config.nodeOperatorAddress}
          </code>
        </p>
      </CardContent>
    </Card>
  );
}
