'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Network } from '@/types/network';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  networks: Network[];
}

export function RevenueChart({ networks }: RevenueChartProps) {
  // Filter networks with revenue data and sort by revenue
  const chartData = useMemo(() => networks
    .filter(n => n.status === 'active' && (n.estimatedMonthlyRevenue || n.stake?.usdValue))
    .map(n => {
      // If we have estimated revenue, use it
      // Otherwise, estimate from stake and APR
      let revenue = n.estimatedMonthlyRevenue || 0;
      
      if (!revenue && n.stake?.usdValue && n.apr) {
        const avgApr = (n.apr.min + n.apr.max) / 2 / 100;
        const commission = (n.commission || 5) / 100;
        revenue = (n.stake.usdValue * avgApr / 12) * commission;
      }
      
      return {
        name: n.token,
        fullName: n.name,
        revenue: Math.round(revenue),
        stake: n.stake?.usdValue || 0,
        hasLiveData: !!n.estimatedMonthlyRevenue,
      };
    })
    .filter(n => n.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15), [networks]); // Top 15 by revenue

  const getBarColor = (revenue: number, hasLiveData: boolean): string => {
    if (!hasLiveData) return '#9ca3af'; // gray
    if (revenue >= 5000) return '#10b981'; // emerald
    if (revenue >= 2000) return '#22c55e'; // green
    if (revenue >= 1000) return '#84cc16'; // lime
    if (revenue >= 500) return '#eab308'; // yellow
    return '#f97316'; // orange
  };

  const totalRevenue = useMemo(() => chartData.reduce((sum, n) => sum + n.revenue, 0), [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Monthly Revenue by Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <p>Loading revenue data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Monthly Revenue
            <span className="text-sm font-normal text-muted-foreground">(Top 15)</span>
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground">Total Monthly</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] sm:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 70, bottom: 10 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true} 
                vertical={false}
                opacity={0.3}
              />
              <XAxis 
                type="number" 
                domain={[0, 'auto']}
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={70}
                fontSize={12}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item?.fullName || String(label);
                }}
                contentStyle={{
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
              <Bar 
                dataKey="revenue" 
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.revenue, entry.hasLiveData)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
          {[
            { label: '$5K+', color: '#10b981' },
            { label: '$2K-5K', color: '#22c55e' },
            { label: '$1K-2K', color: '#84cc16' },
            { label: '$500-1K', color: '#eab308' },
            { label: '<$500', color: '#f97316' },
            { label: 'Estimated', color: '#9ca3af' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Revenue = Stake × APR ÷ 12 × Commission Rate
        </p>
      </CardContent>
    </Card>
  );
}
