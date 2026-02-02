'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Network } from '@/types/network';
import { DollarSign } from 'lucide-react';

interface RevenueChartProps {
  networks: Network[];
}

export function RevenueChart({ networks }: RevenueChartProps) {
  // Filter networks with revenue data and sort by revenue
  const chartData = networks
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
    .slice(0, 15); // Top 15 by revenue

  const getBarColor = (revenue: number, hasLiveData: boolean) => {
    if (!hasLiveData) return '#6b7280'; // gray for estimated
    if (revenue >= 5000) return '#10b981'; // emerald-500
    if (revenue >= 2000) return '#22c55e'; // green-500
    if (revenue >= 1000) return '#84cc16'; // lime-500
    if (revenue >= 500) return '#eab308'; // yellow-500
    return '#f97316'; // orange-500
  };

  const totalRevenue = chartData.reduce((sum, n) => sum + n.revenue, 0);

  if (chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Monthly Revenue by Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <p>Loading revenue data from APIs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Monthly Revenue by Network (Top 15)
          </CardTitle>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Est. Total Monthly</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                domain={[0, 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={50}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Monthly Revenue']}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item?.fullName || String(label);
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
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
        
        {/* Revenue Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {[
            { label: '$5,000+', color: '#10b981' },
            { label: '$2,000-5,000', color: '#22c55e' },
            { label: '$1,000-2,000', color: '#84cc16' },
            { label: '$500-1,000', color: '#eab308' },
            { label: '<$500', color: '#f97316' },
            { label: 'Estimated', color: '#6b7280' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-3">
          Revenue = Stake × APR ÷ 12 × Commission Rate
        </p>
      </CardContent>
    </Card>
  );
}
