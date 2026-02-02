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
    if (!hasLiveData) return 'hsl(var(--chart-gray-500))';
    if (revenue >= 5000) return 'hsl(var(--chart-success-500))';
    if (revenue >= 2000) return 'hsl(var(--chart-success-400))';
    if (revenue >= 1000) return 'hsl(var(--chart-3))'; // lime
    if (revenue >= 500) return 'hsl(var(--chart-warning-500))';
    return 'hsl(var(--chart-danger-500))';
  };

  const totalRevenue = useMemo(() => chartData.reduce((sum, n) => sum + n.revenue, 0), [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2 chart-card bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="chart-icon-wrapper">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">
                Monthly Revenue by Network
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated monthly revenue from validator commissions
              </p>
            </div>
          </div>
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
    <Card className="col-span-1 lg:col-span-2 chart-card bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="chart-icon-wrapper">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                Monthly Revenue by Network
                <span className="text-sm font-normal text-muted-foreground">(Top 15)</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Estimated monthly revenue from validator commissions
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold chart-gradient-success">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Est. Total Monthly</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] sm:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            >
              <defs>
                {chartData.map((entry, index) => {
                  const color = getBarColor(entry.revenue, entry.hasLiveData);
                  const lighterColor = color.replace(')', ' / 0.8)').replace('hsl(', 'hsla(');
                  return (
                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lighterColor} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={color} stopOpacity={1} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true} 
                vertical={false}
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis 
                type="number" 
                domain={[0, 'auto']}
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80}
                tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Monthly Revenue']}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item?.fullName || String(label);
                }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px 16px',
                }}
                labelStyle={{
                  fontWeight: 600,
                  marginBottom: '4px',
                  color: 'hsl(var(--foreground))',
                }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
              />
              <Bar 
                dataKey="revenue" 
                radius={[0, 8, 8, 0]}
                animationDuration={800}
                animationBegin={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index})`}
                    className="transition-opacity duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center p-4 bg-muted/30 rounded-lg">
          {[
            { label: '$5,000+', color: 'hsl(var(--chart-success-500))' },
            { label: '$2,000-5,000', color: 'hsl(var(--chart-success-400))' },
            { label: '$1,000-2,000', color: 'hsl(var(--chart-3))' },
            { label: '$500-1,000', color: 'hsl(var(--chart-warning-500))' },
            { label: '<$500', color: 'hsl(var(--chart-danger-500))' },
            { label: 'Estimated', color: 'hsl(var(--chart-gray-500))' },
          ].map((item) => (
            <div 
              key={item.label} 
              className="flex items-center gap-2 text-sm group cursor-pointer transition-colors"
            >
              <div 
                className="w-4 h-4 rounded transition-transform group-hover:scale-110" 
                style={{ 
                  backgroundColor: item.color,
                  boxShadow: `0 2px 8px ${item.color}40`
                }}
              />
              <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                {item.label}
              </span>
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
