'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Network } from '@/types/network';

interface APRChartProps {
  networks: Network[];
}

export function APRChart({ networks }: APRChartProps) {
  // Filter networks with APR data and sort by APR
  const chartData = networks
    .filter(n => n.apr && n.status === 'active')
    .map(n => ({
      name: n.token,
      fullName: n.name,
      apr: n.apr ? (n.apr.min + n.apr.max) / 2 : 0,
      minApr: n.apr?.min || 0,
      maxApr: n.apr?.max || 0,
    }))
    .sort((a, b) => b.apr - a.apr)
    .slice(0, 15); // Top 15 by APR

  const getBarColor = (apr: number) => {
    if (apr >= 50) return '#10b981'; // emerald-500
    if (apr >= 25) return '#22c55e'; // green-500
    if (apr >= 15) return '#84cc16'; // lime-500
    if (apr >= 10) return '#eab308'; // yellow-500
    return '#f97316'; // orange-500
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg">APR by Network (Top 15)</CardTitle>
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
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={50}
                tick={{ fontSize: 12 }}
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
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="apr" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.apr)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* APR Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {[
            { label: '50%+', color: '#10b981' },
            { label: '25-50%', color: '#22c55e' },
            { label: '15-25%', color: '#84cc16' },
            { label: '10-15%', color: '#eab308' },
            { label: '<10%', color: '#f97316' },
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
      </CardContent>
    </Card>
  );
}
