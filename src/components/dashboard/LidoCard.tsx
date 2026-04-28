'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Coins, Layers, ShieldCheck } from 'lucide-react';
import type { LidoDvtData } from '@/lib/api/lido';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface LidoCardProps {
  data: LidoDvtData | null;
  ethPrice?: number;
  isLoading?: boolean;
}

const FRAMEWORK_COLOR: Record<string, string> = {
  Obol: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
  'Obol Super Cluster': 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/30',
  SSV: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30',
};

export function LidoCard({ data, ethPrice, isLoading }: LidoCardProps) {
  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px]" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const totalEth = data.totalEthStaked;
  const totalUsd = ethPrice ? totalEth * ethPrice : undefined;

  return (
    <Card className="col-span-full overflow-hidden border-0 shadow-lg">
      <div className="h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                Lido Simple DVT Module
                <Badge variant="outline" className="bg-gradient-to-r from-violet-500/15 to-violet-500/5 text-violet-600 border-violet-500/30 font-semibold shadow-sm">
                  5 clusters · 4× Obol + 1× SSV
                </Badge>
              </CardTitle>
              <p className="text-[13px] text-muted-foreground mt-1">
                Distributed validator clusters · Ethereum mainnet
              </p>
            </div>
          </div>

          <a
            href="https://operatorsinfo.lido.fi/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Lido operators portal
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Aggregate stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              <ShieldCheck className="w-4 h-4 text-violet-500" />
              Active validators
            </div>
            <p className="text-3xl font-bold tracking-tight text-violet-600">
              {formatNumber(data.totalActiveValidators)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">across 5 clusters</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              <Coins className="w-4 h-4 text-cyan-500" />
              ETH operated
            </div>
            <p className="text-3xl font-bold tracking-tight text-cyan-600">
              {formatNumber(totalEth)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">32 ETH × validators</p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              USD value
            </div>
            <p className="text-3xl font-bold tracking-tight text-emerald-600">
              {totalUsd ? formatCurrency(totalUsd) : '—'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ETH @ {ethPrice ? `$${ethPrice.toFixed(0)}` : '—'}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-gradient-to-br from-muted/60 to-muted/30 border shadow-sm">
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-2">
              Module fee
            </div>
            <p className="text-3xl font-bold tracking-tight">8%</p>
            <p className="text-sm text-muted-foreground mt-1">
              shared with co-operators
            </p>
          </div>
        </div>

        {/* Per-cluster breakdown */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Cluster breakdown</h3>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Cluster</th>
                  <th className="text-left p-3 font-medium">Framework</th>
                  <th className="text-right p-3 font-medium">Active</th>
                  <th className="text-right p-3 font-medium">Exited</th>
                  <th className="text-right p-3 font-medium">Total keys</th>
                  <th className="text-right p-3 font-medium">ETH</th>
                  <th className="text-right p-3 font-medium">Operator ID</th>
                </tr>
              </thead>
              <tbody>
                {data.operators.map((op) => (
                  <tr key={op.id} className="border-t">
                    <td className="p-3 font-medium">{op.name}</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={FRAMEWORK_COLOR[op.framework] || ''}
                      >
                        {op.framework}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-medium text-emerald-600">
                      {formatNumber(op.activeValidators)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {op.stoppedValidators > 0 ? formatNumber(op.stoppedValidators) : '—'}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatNumber(op.totalKeys)}
                    </td>
                    <td className="p-3 text-right font-medium">
                      {formatNumber(op.ethStaked)}
                    </td>
                    <td className="p-3 text-right text-muted-foreground font-mono text-xs">
                      #{op.id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Source: on-chain SDVT NodeOperatorsRegistry
          (<code className="bg-muted px-1 rounded">0xae7b...b433</code>).
          Each cluster jointly operates Ethereum validators via Obol Charon or SSV.
          Active validators = deposited keys − exited validators.
        </p>
      </CardContent>
    </Card>
  );
}
