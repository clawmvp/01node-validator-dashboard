# 📊 Charts Design - Specific Code Changes

## Quick Reference: Exact Code to Change

---

## 1. globals.css - Add Chart Color Variables

**Add after line 82 (before `.dark` section):**

```css
/* Chart-specific color variables */
:root {
  --chart-success-500: oklch(0.646 0.222 141.116); /* emerald-500 */
  --chart-success-400: oklch(0.696 0.17 141.48);
  --chart-success-600: oklch(0.577 0.245 141.325);
  --chart-warning-500: oklch(0.828 0.189 84.429); /* yellow-500 */
  --chart-danger-500: oklch(0.577 0.245 27.325); /* orange-500 */
  --chart-gray-500: oklch(0.556 0 0); /* gray-500 */
}

.dark {
  --chart-success-500: oklch(0.696 0.17 141.48);
  --chart-success-400: oklch(0.746 0.15 141.32);
  --chart-success-600: oklch(0.646 0.222 141.116);
  --chart-warning-500: oklch(0.769 0.188 70.08);
  --chart-danger-500: oklch(0.704 0.191 22.216);
  --chart-gray-500: oklch(0.708 0 0);
}
```

**Add utility classes at end of file:**

```css
@layer utilities {
  /* ... existing utilities ... */
  
  .chart-gradient-success {
    @apply bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent;
  }
  
  .chart-card {
    @apply shadow-lg hover:shadow-xl transition-all duration-300 border-border/50;
  }
  
  .chart-icon-wrapper {
    @apply p-2 rounded-lg bg-emerald-500/10;
  }
}
```

---

## 2. RevenueChart.tsx - Complete Component Update

### Replace getBarColor function (lines 40-47):

```typescript
const getBarColor = (revenue: number, hasLiveData: boolean): string => {
  if (!hasLiveData) return 'hsl(var(--chart-gray-500))';
  if (revenue >= 5000) return 'hsl(var(--chart-success-500))';
  if (revenue >= 2000) return 'hsl(var(--chart-success-400))';
  if (revenue >= 1000) return 'hsl(var(--chart-3))'; // lime
  if (revenue >= 500) return 'hsl(var(--chart-warning-500))';
  return 'hsl(var(--chart-danger-500))';
};

// Helper function to lighten color for gradients
const lightenColor = (color: string, percent: number): string => {
  // Simple implementation - adjust opacity or use a color manipulation library
  return color.replace(')', ` / ${1 + percent / 100})`).replace('hsl(', 'hsla(');
};
```

### Replace Card opening tag (line 70):

```typescript
<Card className="col-span-1 lg:col-span-2 chart-card bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
```

### Replace CardHeader (lines 71-83):

```typescript
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
```

### Replace BarChart section (lines 86-127):

```typescript
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
            // Create lighter version for gradient
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
          formatterStyle={{
            fontWeight: 500,
            color: 'hsl(var(--chart-success-600))',
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
```

---

## 3. APRChart.tsx - Similar Updates

### Replace Card (line 34):

```typescript
<Card className="col-span-1 lg:col-span-2 chart-card bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
```

### Replace CardHeader (lines 35-37):

```typescript
<CardHeader className="pb-4 border-b border-border/50">
  <div className="flex items-center gap-3">
    <div className="chart-icon-wrapper">
      <Percent className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div>
      <CardTitle className="text-xl font-bold tracking-tight">
        APR by Network
      </CardTitle>
      <p className="text-xs text-muted-foreground mt-1">
        Top 15 networks by average APR
      </p>
    </div>
  </div>
</CardHeader>
```

### Update getBarColor function (lines 25-31):

```typescript
const getBarColor = (apr: number): string => {
  if (apr >= 50) return 'hsl(var(--chart-success-500))';
  if (apr >= 25) return 'hsl(var(--chart-success-400))';
  if (apr >= 15) return 'hsl(var(--chart-3))';
  if (apr >= 10) return 'hsl(var(--chart-warning-500))';
  return 'hsl(var(--chart-danger-500))';
};
```

### Add Percent import at top:

```typescript
import { Percent } from 'lucide-react';
```

### Apply same BarChart improvements as RevenueChart (gradients, tooltips, etc.)

---

## 4. StakeDistributionChart.tsx - Updates

### Replace Card (line 43):

```typescript
<Card className="col-span-1 chart-card bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
```

### Replace CardHeader (lines 44-48):

```typescript
<CardHeader className="pb-4 border-b border-border/50">
  <div className="flex items-center gap-3">
    <div className="chart-icon-wrapper">
      <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
    </div>
    <div>
      <CardTitle className="text-xl font-bold tracking-tight">
        {hasStakeData ? 'Stake Distribution by Ecosystem' : 'Networks by Ecosystem'}
      </CardTitle>
    </div>
  </div>
</CardHeader>
```

### Update Pie component (lines 53-70):

```typescript
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
```

### Replace legend section (lines 94-105):

```typescript
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
```

### Add imports:

```typescript
import { PieChart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
```

---

## 5. page.tsx - Add APRChart to Charts Tab

### Add import at top (after line 8):

```typescript
import { APRChart } from '@/components/dashboard/APRChart';
```

### Replace Charts TabsContent (lines 279-284):

```typescript
<TabsContent value="charts" className="space-y-8">
  {/* Section Header */}
  <div className="mb-6">
    <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
    <p className="text-muted-foreground mt-2">
      Visual breakdown of validator performance metrics across all networks
    </p>
  </div>

  {/* Charts Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <StakeDistributionChart networks={networks} />
    <RevenueChart networks={networks} />
    <APRChart networks={networks} />
  </div>
</TabsContent>
```

---

## 6. Color Helper Function (Optional - Add to utils)

**Create or update `/src/lib/chartUtils.ts`:**

```typescript
/**
 * Lightens a CSS color by adjusting opacity
 * For use in gradient definitions
 */
export function lightenColorForGradient(color: string, opacity: number = 0.8): string {
  // If color is already in hsl format with opacity
  if (color.includes('hsla') || color.includes('rgba')) {
    return color;
  }
  
  // Convert hsl to hsla
  if (color.startsWith('hsl(')) {
    return color.replace('hsl(', 'hsla(').replace(')', `, ${opacity})`);
  }
  
  return color;
}

/**
 * Get chart color based on value thresholds
 */
export function getChartColor(
  value: number,
  thresholds: { min: number; color: string }[],
  defaultColor: string = 'hsl(var(--chart-gray-500))'
): string {
  // Sort thresholds descending
  const sorted = [...thresholds].sort((a, b) => b.min - a.min);
  
  for (const threshold of sorted) {
    if (value >= threshold.min) {
      return threshold.color;
    }
  }
  
  return defaultColor;
}
```

---

## Summary of Key Changes

1. **Colors**: All hard-coded hex → CSS variables
2. **Cards**: Added shadows, gradients, transitions
3. **Headers**: Added icons, better typography, descriptions
4. **Charts**: Added gradients, better tooltips, animations
5. **Legends**: Enhanced with hover effects, better spacing
6. **Layout**: Added APRChart, improved spacing
7. **Responsive**: Better mobile support

---

## Testing Checklist

- [ ] Light mode colors look good
- [ ] Dark mode colors look good
- [ ] Charts animate smoothly
- [ ] Tooltips display correctly
- [ ] Legends are readable
- [ ] Mobile layout works
- [ ] Hover effects work
- [ ] All three charts display
- [ ] No console errors
