'use client';

import { Network } from '@/types/network';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ExternalLink, 
  TrendingUp, 
  TrendingDown,
  Coins,
  Users,
  Percent,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworkCardProps {
  network: Network;
  showProfitability?: boolean;
}

export function NetworkCard({ network, showProfitability = true }: NetworkCardProps) {
  const avgApr = network.apr ? (network.apr.min + network.apr.max) / 2 : 0;
  const isProfitable = network.estimatedMonthlyRevenue && network.infrastructureCost
    ? network.estimatedMonthlyRevenue > network.infrastructureCost
    : null;

  const profitMargin = network.estimatedMonthlyRevenue && network.infrastructureCost
    ? ((network.estimatedMonthlyRevenue - network.infrastructureCost) / network.infrastructureCost) * 100
    : null;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.01] group border-2 border-transparent hover:border-primary/10",
      network.status === 'coming_soon' && "opacity-60"
    )}>
      {/* Top accent line */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
        network.ecosystem === 'cosmos' && "from-blue-500 to-purple-500",
        network.ecosystem === 'solana' && "from-purple-500 to-green-500",
        network.ecosystem === 'sui' && "from-blue-400 to-cyan-500",
        network.ecosystem === 'ethereum' && "from-blue-600 to-indigo-600",
        !['cosmos', 'solana', 'sui', 'ethereum'].includes(network.ecosystem) && "from-gray-400 to-gray-500"
      )} />
      
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center font-bold text-base shadow-inner">
              {network.token.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-[15px] group-hover:text-primary transition-colors">
                {network.name}
              </h3>
              <p className="text-sm text-muted-foreground font-medium">{network.token}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge 
              variant={network.status === 'active' ? 'default' : 'secondary'}
              className={cn(
                "shadow-sm",
                network.status === 'active' && "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-600 border-emerald-500/30",
                network.status === 'coming_soon' && "bg-gradient-to-r from-amber-500/15 to-amber-500/5 text-amber-600 border-amber-500/30"
              )}
            >
              {network.status === 'active' ? 'Active' : 'Coming Soon'}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize font-medium">
              {network.ecosystem}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* APR Section */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Percent className="w-3 h-3" />
              APR
            </p>
            {network.apr ? (
              <p className="text-lg font-bold text-emerald-600">
                {network.apr.min === network.apr.max 
                  ? `${network.apr.min}%`
                  : `${network.apr.min}-${network.apr.max}%`
                }
              </p>
            ) : (
              <p className="text-lg font-bold text-muted-foreground">N/A</p>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Percent className="w-3 h-3" />
              Commission
            </p>
            <p className="text-lg font-bold">
              {network.commission !== undefined ? `${network.commission}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Stake Info */}
        {network.stake && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Coins className="w-3 h-3" />
                Staked
              </span>
              <span className="font-medium">
                {network.stake.amount.toLocaleString()} {network.token}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Value
              </span>
              <span className="font-medium">
                ${network.stake.usdValue.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Rank */}
        {network.rank && network.totalValidators && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                Validator Rank
              </span>
              <span className="font-medium">
                #{network.rank} / {network.totalValidators}
              </span>
            </div>
            <Progress 
              value={(1 - network.rank / network.totalValidators) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Profitability */}
        {showProfitability && network.estimatedMonthlyRevenue !== undefined && (
          <div className="pt-2 border-t space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Est. Monthly Revenue</span>
              <span className="font-medium text-emerald-600">
                ${network.estimatedMonthlyRevenue.toLocaleString()}
              </span>
            </div>
            {network.infrastructureCost !== undefined && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Infrastructure Cost</span>
                  <span className="font-medium text-red-500">
                    -${network.infrastructureCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>Net Profit</span>
                  <span className={cn(
                    isProfitable ? "text-emerald-600" : "text-red-500"
                  )}>
                    {isProfitable ? <TrendingUp className="w-4 h-4 inline mr-1" /> : <TrendingDown className="w-4 h-4 inline mr-1" />}
                    ${Math.abs((network.estimatedMonthlyRevenue || 0) - (network.infrastructureCost || 0)).toLocaleString()}
                    {profitMargin !== null && (
                      <span className="text-xs ml-1">({profitMargin > 0 ? '+' : ''}{profitMargin.toFixed(0)}%)</span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* No data warning */}
        {!network.stake && network.status === 'active' && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 rounded-md p-2">
            <AlertCircle className="w-3 h-3" />
            <span>Stake data not available - add API integration</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {network.explorerUrl && (
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <a href={network.explorerUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3 mr-1" />
                Explorer
              </a>
            </Button>
          )}
          {network.stakeUrl && (
            <Button variant="default" size="sm" className="flex-1" asChild>
              <a href={network.stakeUrl} target="_blank" rel="noopener noreferrer">
                Stake
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
