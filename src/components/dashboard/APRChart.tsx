'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Network } from '@/types/network';
import { Percent } from 'lucide-react';

interface APRChartProps {
  networks: Network[];
}

export function APRChart({ networks }: APRChartProps) {
  // Filter networks with APR data and sort by APR
  const chartData = useMemo(() => networks
    .filter(n => n.apr && n.status === 'active')
    .map(n => ({
      name: n.token,
      fullName: n.name,
      apr: n.apr ? (n.apr.min + n.apr.max) / 2 : 0,
      minApr: n.apr?.min || 0,
      maxApr: n.apr?.max || 0,
    }))
    .sort((a, b) => b.apr - a.apr)
    .slice(0, 15), [networks]); // Top 15 by APR

  const getBarColor = (apr: number): string => {
    if (apr >= 50) return 'hsl(var(--chart-success-500))';
    if (apr >= 25) return 'hsl(var(--chart-success-400))';
    if (apr >= 15) return 'hsl(var(--chart-3))';
    if (apr >= 10) return 'hsl(var(--chart-warning-500))';
    return 'hsl(var(--chart-danger-500))';
  };

  const avgApr = useMemo(() => chartData.length > 0 
    ? (chartData.reduce((sum, n) => sum + n.apr, 0) / chartData.length).toFixed(1)
    : '0', [chartData]);

  return (
    <Card className="col-span-1 lg:col-span-2 chart-card bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="chart-icon-wrapper">
              <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
                APR by Network
                <span className="text-sm font-normal text-muted-foreground">(Top 15)</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Annual percentage rate for staking rewards
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold chart-gradient-success">
              {avgApr}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg. APR (Top 15)</p>
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
                  const color = getBarColor(entry.apr);
                  const lighterColor = color.replace(')', ' / 0.8)').replace('hsl(', 'hsla(');
                  return (
                    <linearGradient key={`gradient-apr-${index}`} id={`gradient-apr-${index}`} x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(value) => `${value}%`}
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
                formatter={(value) => [`${Number(value).toFixed(1)}%`, 'APR']}
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
                dataKey="apr" 
                radius={[0, 8, 8, 0]}
                animationDuration={800}
                animationBegin={0}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-apr-${index})`}
                    className="transition-opacity duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Enhanced APR Legend */}
        <div className="flex flex-wrap gap-4 mt-6 justify-center p-4 bg-muted/30 rounded-lg">
          {[
            { label: '50%+', color: 'hsl(var(--chart-success-500))' },
            { label: '25-50%', color: 'hsl(var(--chart-success-400))' },
            { label: '15-25%', color: 'hsl(var(--chart-3))' },
            { label: '10-15%', color: 'hsl(var(--chart-warning-500))' },
            { label: '<10%', color: 'hsl(var(--chart-danger-500))' },
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
      </CardContent>
    </Card>
  );
}
