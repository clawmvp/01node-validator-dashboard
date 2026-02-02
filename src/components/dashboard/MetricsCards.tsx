'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Coins, 
  Server, 
  DollarSign,
  Percent,
  Activity
} from 'lucide-react';
import { NetworkMetrics } from '@/types/network';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  metrics: NetworkMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Stake Value',
      value: `$${metrics.totalStakeUsd.toLocaleString()}`,
      subtitle: 'Across all networks',
      icon: Coins,
      trend: '+12.5%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Networks',
      value: metrics.activeNetworks.toString(),
      subtitle: `of ${metrics.totalNetworks} total`,
      icon: Server,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Est. Monthly Revenue',
      value: `$${metrics.estimatedMonthlyRevenue.toLocaleString()}`,
      subtitle: 'Before costs',
      icon: DollarSign,
      trend: '+8.3%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Est. Yearly Revenue',
      value: `$${metrics.estimatedYearlyRevenue.toLocaleString()}`,
      subtitle: 'Projected',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Average APR',
      value: `${metrics.avgApr.toFixed(1)}%`,
      subtitle: 'Weighted by stake',
      icon: Percent,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Network Health',
      value: '99.99%',
      subtitle: 'Uptime',
      icon: Activity,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <card.icon className={cn("w-4 h-4", card.color)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{card.value}</span>
              {card.trend && (
                <span className={cn(
                  "text-xs font-medium",
                  card.trendUp ? "text-emerald-600" : "text-red-500"
                )}>
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
