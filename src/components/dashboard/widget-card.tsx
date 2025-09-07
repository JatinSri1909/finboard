import { useState, useEffect } from 'react';
import { MoreVertical, RefreshCw, Trash2, Settings, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore, Widget } from '@/stores/dashboard-store';
import { FinanceTable } from './finance-table';
import { FinanceChart } from './finance-chart';
import { WidgetConfigModal } from './widget-config-modal';

interface WidgetCardProps {
  widget: Widget;
}

export const WidgetCard = ({ widget }: WidgetCardProps) => {
  const { removeWidget, updateWidgetData, updateWidget } = useDashboardStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setIsRefreshing(true);
    }
    
    // Always set loading state when fetching
    updateWidget(widget.id, { loading: true, error: undefined });

    try {
      // Validate URL
      if (!widget.apiUrl || widget.apiUrl.includes('undefined')) {
        throw new Error('Invalid API URL - please check your environment variables');
      }

      const response = await fetch(widget.apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      updateWidgetData(widget.id, data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      updateWidgetData(widget.id, null, errorMessage);
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    // Initial data fetch only if no data exists
    if (!widget.data && !widget.loading && !widget.error) {
      fetchData(false);
    }

    // Set up interval for auto-refresh
    const interval = setInterval(() => {
      fetchData(false);
    }, widget.refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [widget.id, widget.apiUrl, widget.refreshInterval]);

  const handleRefresh = async () => {
    await fetchData(true);
  };  const handleRemove = () => {
    removeWidget(widget.id);
  };

  const formatLastUpdated = (date?: Date | string) => {
    if (!date) return 'Never';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid date';

    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    return dateObj.toLocaleTimeString();
  };

  const renderContent = () => {
    if (widget.loading && !widget.data) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading data...
          </div>
        </div>
      );
    }

    if (widget.error) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{widget.error}</span>
          </div>
        </div>
      );
    }

    if (!widget.data) {
      return (
        <div className="flex items-center justify-center h-32 text-muted-foreground">
          No data available
        </div>
      );
    }

    switch (widget.type) {
      case 'table':
        return <FinanceTable data={widget.data} config={widget.config} />;
      case 'chart':
        return <FinanceChart data={widget.data} config={widget.config} />;
      case 'card':
      default:
        return (
          <div className="space-y-3">
            {Object.entries(widget.data)
              .filter(
                ([key]) => !widget.config.displayFields || widget.config.displayFields.includes(key)
              )
              .slice(0, 6)
              .map(([key, value]) => {
                const displayValue =
                  typeof value === 'number' && key.includes('price')
                    ? `$${value.toFixed(2)}`
                    : typeof value === 'number' && key.includes('change')
                      ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}${key.includes('percent') ? '%' : ''}`
                      : typeof value === 'object'
                        ? JSON.stringify(value)
                        : String(value);

                return (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground capitalize">
                      {key.replace(/[_-]/g, ' ').replace(/^\d+\.\s*/, '')}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        typeof value === 'number' && key.includes('change') && value !== 0
                          ? value > 0
                            ? 'text-green-400'
                            : 'text-red-400'
                          : 'text-foreground'
                      }`}
                    >
                      {displayValue}
                    </span>
                  </div>
                );
              })}
          </div>
        );
    }
  };

  return (
    <>
      <Card className="bg-widget border-widget-border shadow-widget hover:shadow-lg transition-all duration-300 hover:border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground text-sm">{widget.name}</h3>
            <Badge variant="outline" className="text-xs border-widget-border">
              {widget.type}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0 hover:bg-widget-hover"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-widget-hover">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-widget-border">
                <DropdownMenuItem
                  onClick={() => setShowConfigModal(true)}
                  className="text-foreground hover:bg-widget-hover"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRemove}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {renderContent()}

          <div className="flex justify-between items-center mt-4 pt-2 border-t border-widget-border text-xs text-muted-foreground">
            <span>Last updated: {formatLastUpdated(widget.lastUpdated)}</span>
            <span>Refresh: {widget.refreshInterval}s</span>
          </div>
        </CardContent>
      </Card>

      <WidgetConfigModal
        widget={widget}
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </>
  );
};
