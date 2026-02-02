'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Network } from '@/types/network';
import { ecosystemColors } from '@/data/networks';

interface StakeDistributionChartProps {
  networks: Network[];
}

export function StakeDistributionChart({ networks }: StakeDistributionChartProps) {
  // Group by ecosystem
  const ecosystemData = networks.reduce((acc, network) => {
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
  }, {} as Record<string, { name: string; count: number; value: number }>);

  const chartData = Object.entries(ecosystemData).map(([key, data]) => ({
    ...data,
    ecosystem: key,
    fill: ecosystemColors[key] || '#888888',
  }));

  // If no stake data, show by network count
  const hasStakeData = chartData.some(d => d.value > 0);
  const displayData = hasStakeData 
    ? chartData 
    : chartData.map(d => ({ ...d, value: d.count }));

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-lg">
          {hasStakeData ? 'Stake Distribution by Ecosystem' : 'Networks by Ecosystem'}
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
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name) => [
                  hasStakeData ? `$${Number(value).toLocaleString()}` : `${value} networks`,
                  String(name)
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with counts */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {displayData.map((item) => (
            <div key={item.ecosystem} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-muted-foreground">{item.name}:</span>
              <span className="font-medium">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
