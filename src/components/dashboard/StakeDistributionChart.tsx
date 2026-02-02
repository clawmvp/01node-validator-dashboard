'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Network } from '@/types/network';
import { ecosystemColors } from '@/data/networks';
import { formatCurrency } from '@/lib/utils';

interface StakeDistributionChartProps {
  networks: Network[];
}

export function StakeDistributionChart({ networks }: StakeDistributionChartProps) {
  // Group by ecosystem
  const ecosystemData = useMemo(() => networks.reduce((acc, network) => {
    if (network.status !== 'active') return acc;
    
    const ecosystem = network.ecosystem;
    if (!acc[ecosystem]) {
      acc[ecosystem] = {
        name: ecosystem.charAt(0).toUpperCase() + ecosystem.slice(1),
        count: 0,
        value: 0,
      };
    }
    acc[ecosystem].count += 1;
    acc[ecosystem].value += network.stake?.usdValue || 0;
    return acc;
  }, {} as Record<string, { name: string; count: number; value: number }>), [networks]);

  const chartData = useMemo(() => Object.entries(ecosystemData).map(([key, data]) => ({
    ...data,
    ecosystem: key,
    fill: ecosystemColors[key] || '#888888',
  })), [ecosystemData]);

  // If no stake data, show by network count
  const hasStakeData = useMemo(() => chartData.some(d => d.value > 0), [chartData]);
  const displayData = useMemo(() => hasStakeData 
    ? chartData 
    : chartData.map(d => ({ ...d, value: d.count })), [chartData, hasStakeData]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-emerald-600" />
          {hasStakeData ? 'Stake by Ecosystem' : 'Networks by Ecosystem'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                animationDuration={800}
                animationBegin={0}
              >
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  hasStakeData ? formatCurrency(Number(value)) : `${value} networks`,
                  String(name)
                ]}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{
                  fontWeight: 600,
                  color: '#f9fafb',
                }}
                itemStyle={{
                  color: '#f9fafb',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced Legend with Cards */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {displayData.map((item) => (
            <div 
              key={item.ecosystem} 
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <div 
                className="w-4 h-4 rounded-full transition-transform group-hover:scale-125" 
                style={{ 
                  backgroundColor: item.fill,
                  boxShadow: `0 2px 8px ${item.fill}50`
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground block truncate">{item.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{item.count} networks</span>
                  {hasStakeData && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(item.value)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
