'use client';

import { useState } from 'react';
import { Network, SortOption, FilterOption } from '@/types/network';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowUpDown, 
  ExternalLink, 
  Search,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NetworksTableProps {
  networks: Network[];
}

export function NetworksTable({ networks }: NetworksTableProps) {
  const [sortBy, setSortBy] = useState<SortOption>('stake');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [search, setSearch] = useState('');

  const filteredNetworks = networks
    .filter(n => {
      // Search filter
      if (search && !n.name.toLowerCase().includes(search.toLowerCase()) && 
          !n.token.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      // Ecosystem filter
      if (filter !== 'all' && filter !== 'profitable' && filter !== 'unprofitable') {
        return n.ecosystem === filter;
      }
      
      // Profitability filter
      if (filter === 'profitable' && n.estimatedMonthlyRevenue && n.infrastructureCost) {
        return n.estimatedMonthlyRevenue > n.infrastructureCost;
      }
      if (filter === 'unprofitable' && n.estimatedMonthlyRevenue && n.infrastructureCost) {
        return n.estimatedMonthlyRevenue <= n.infrastructureCost;
      }
      
      return true;
    })
    .filter(n => n.status === 'active')
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'stake':
          comparison = (a.stake?.usdValue || 0) - (b.stake?.usdValue || 0);
          break;
        case 'apr':
          const aprA = a.apr ? (a.apr.min + a.apr.max) / 2 : 0;
          const aprB = b.apr ? (b.apr.min + b.apr.max) / 2 : 0;
          comparison = aprA - aprB;
          break;
        case 'revenue':
          comparison = (a.estimatedMonthlyRevenue || 0) - (b.estimatedMonthlyRevenue || 0);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'profitability':
          const profitA = (a.estimatedMonthlyRevenue || 0) - (a.infrastructureCost || 0);
          const profitB = (b.estimatedMonthlyRevenue || 0) - (b.infrastructureCost || 0);
          comparison = profitA - profitB;
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const toggleSort = (column: SortOption) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortableHeader = ({ column, children }: { column: SortOption; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => toggleSort(column)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg">All Networks</CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search networks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-[200px]"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterOption)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Networks</SelectItem>
                <SelectItem value="cosmos">Cosmos</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="solana">Solana</SelectItem>
                <SelectItem value="sui">Sui</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="profitable">Profitable</SelectItem>
                <SelectItem value="unprofitable">Unprofitable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <SortableHeader column="name">Network</SortableHeader>
                </TableHead>
                <TableHead>Ecosystem</TableHead>
                <TableHead className="text-right">
                  <SortableHeader column="apr">APR</SortableHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader column="stake">Stake Value</SortableHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader column="revenue">Monthly Revenue</SortableHeader>
                </TableHead>
                <TableHead className="text-right">
                  <SortableHeader column="profitability">Profit/Loss</SortableHeader>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNetworks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No networks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredNetworks.map((network) => {
                  const profit = network.estimatedMonthlyRevenue && network.infrastructureCost
                    ? network.estimatedMonthlyRevenue - network.infrastructureCost
                    : null;
                  
                  return (
                    <TableRow key={network.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-xs">
                            {network.token.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{network.name}</p>
                            <p className="text-xs text-muted-foreground">{network.token}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {network.ecosystem}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {network.apr ? (
                          <span className="text-emerald-600 font-medium">
                            {network.apr.min === network.apr.max 
                              ? `${network.apr.min}%`
                              : `${network.apr.min}-${network.apr.max}%`
                            }
                          </span>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {network.stake ? (
                          <span className="font-medium">
                            ${Math.round(network.stake.usdValue).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {network.estimatedMonthlyRevenue ? (
                          <span className="font-medium text-emerald-600">
                            ${Math.round(network.estimatedMonthlyRevenue).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {profit !== null ? (
                          <span className={cn(
                            "font-medium flex items-center justify-end gap-1",
                            profit > 0 ? "text-emerald-600" : profit < 0 ? "text-red-500" : "text-muted-foreground"
                          )}>
                            {profit > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : profit < 0 ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <Minus className="w-4 h-4" />
                            )}
                            ${Math.round(Math.abs(profit)).toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {network.explorerUrl && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={network.explorerUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Showing {filteredNetworks.length} of {networks.filter(n => n.status === 'active').length} active networks
        </p>
      </CardContent>
    </Card>
  );
}
