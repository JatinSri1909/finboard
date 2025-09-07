'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWidgetStore, type Widget } from '@/lib/widget-store';
import { getWidgetTemplate } from '@/lib/widget-templates';
import { WidgetConfigDialog } from './widget-config-dialog';
import { StockTableWidget } from '@/components/widgets/stock-table-widget';
import { PriceChartWidget } from '@/components/widgets/price-chart-widget';
import { CandlestickChartWidget } from '@/components/widgets/candlestick-chart-widget';
import { PortfolioSummaryWidget } from '@/components/widgets/portfolio-summary-widget';
import {
  MoreVertical,
  Trash2,
  Settings,
  Copy,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WidgetCardProps {
  widget: Widget;
}

export function WidgetCard({ widget }: WidgetCardProps) {
  const { removeWidget, duplicateWidget, selectWidget } = useWidgetStore();
  const [configOpen, setConfigOpen] = useState(false);
  const template = getWidgetTemplate(widget.type);

  const handleConfigure = () => {
    selectWidget(widget.id);
    setConfigOpen(true);
  };

  const handleDuplicate = () => {
    duplicateWidget(widget.id);
  };

  const handleRemove = () => {
    removeWidget(widget.id);
  };

  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'stock-table':
        return <StockTableWidget data={widget.data} config={widget.config} />;

      case 'price-chart':
        return <PriceChartWidget data={widget.data} config={widget.config} />;

      case 'candlestick-chart':
        return <CandlestickChartWidget data={widget.data} config={widget.config} />;

      case 'portfolio-summary':
        return <PortfolioSummaryWidget data={widget.data} config={widget.config} />;

      case 'watchlist':
      case 'market-gainers':
      case 'market-losers':
        return (
          <div className="space-y-3">
            {widget.data?.map((stock: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{stock.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {stock.name?.split(' ')[0] || 'Stock'}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">${stock.price}</div>
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stock.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stock.changePercent?.toFixed(2)}%
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center text-muted-foreground py-4">
                <RefreshCw className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">Loading data...</p>
              </div>
            )}
          </div>
        );

      case 'market-overview':
        return (
          <div className="grid grid-cols-2 gap-3">
            {['SPY', 'QQQ', 'DIA', 'IWM'].map((symbol) => (
              <div key={symbol} className="text-center p-2 rounded bg-muted/50">
                <div className="font-medium text-sm">{symbol}</div>
                <div className="text-xs text-green-600">+1.2%</div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <div className="p-3 rounded-full bg-muted inline-block mb-2">
              {template?.icon && <template.icon className="h-6 w-6" />}
            </div>
            <p className="text-sm">Widget content will appear here</p>
          </div>
        );
    }
  };

  return (
    <>
      <Card className="relative group h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {template?.icon && <template.icon className="h-4 w-4" />}
            {widget.title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {widget.lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                <Clock className="h-3 w-3" />
                {new Date(widget.lastUpdated).toLocaleTimeString()}
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleConfigure}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDuplicate}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRemove} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-1">{renderWidgetContent()}</CardContent>
      </Card>

      <WidgetConfigDialog open={configOpen} onOpenChange={setConfigOpen} widget={widget} />
    </>
  );
}
