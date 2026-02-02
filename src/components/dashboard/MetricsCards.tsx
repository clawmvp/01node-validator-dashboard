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
        <Card key={card.title} className="relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/80 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.1),_0_1px_2px_-1px_rgb(0_0_0_/_0.1)] hover:shadow-[0_4px_6px_-1px_rgb(0_0_0_/_0.1),_0_2px_4px_-2px_rgb(0_0_0_/_0.1)] transition-all duration-200">
          {/* Subtle gradient overlay */}
          <div className={cn("absolute inset-0 opacity-[0.03]", card.bgColor.replace('/10', ''))} />
          
          <CardHeader className="pb-3 relative">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[13px] font-medium text-muted-foreground tracking-wide">
                {card.title}
              </CardTitle>
              <div className={cn("p-2.5 rounded-xl shadow-sm", card.bgColor)}>
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">{card.value}</span>
              {card.trend && (
                <span className={cn(
                  "text-xs font-semibold px-1.5 py-0.5 rounded-md",
                  card.trendUp ? "text-emerald-600 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
                )}>
                  {card.trend}
                </span>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground mt-1.5">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
