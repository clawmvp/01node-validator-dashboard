'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Moon, 
  Sun, 
  RefreshCw, 
  Settings,
  ExternalLink,
  Github,
  LayoutGrid,
  Table2,
  BarChart3,
  Link2
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ onRefresh, isRefreshing = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              01
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">01node</h1>
              <p className="text-xs text-muted-foreground leading-none">Validator Dashboard</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge variant="outline" className="hidden sm:flex bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Live
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Tabs */}
          <TabsList className="hidden md:flex">
            <TabsTrigger value="grid" className="flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden lg:inline">Grid</span>
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-1.5">
              <Table2 className="w-4 h-4" />
              <span className="hidden lg:inline">Table</span>
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">Charts</span>
            </TabsTrigger>
            <TabsTrigger value="chainlink" className="flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />
              <span className="hidden lg:inline">Chainlink</span>
            </TabsTrigger>
          </TabsList>

          <div className="hidden md:block w-px h-6 bg-border mx-1" />

          {/* Quick Links */}
          <Button variant="ghost" size="sm" className="hidden lg:flex" asChild>
            <a href="https://01node.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              01node.com
            </a>
          </Button>
          
          <Button variant="ghost" size="sm" className="hidden lg:flex" asChild>
            <a href="https://www.mintscan.io/visualization/validators/01node" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" />
              Mintscan
            </a>
          </Button>

          {/* Refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* GitHub */}
          <Button variant="outline" size="icon" asChild>
            <a href="https://github.com/clawmvp/01node-validator-dashboard" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
