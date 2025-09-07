'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWidgetStore, type Widget } from '@/lib/widget-store';
import { getWidgetTemplate } from '@/lib/widget-templates';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface WidgetConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widget: Widget;
}

export function WidgetConfigDialog({ open, onOpenChange, widget }: WidgetConfigDialogProps) {
  const { updateWidget } = useWidgetStore();
  const [config, setConfig] = useState(widget.config);
  const [title, setTitle] = useState(widget.title);
  const template = getWidgetTemplate(widget.type);

  useEffect(() => {
    setConfig(widget.config);
    setTitle(widget.title);
  }, [widget]);

  const handleSave = () => {
    updateWidget(widget.id, { config, title });
    onOpenChange(false);
  };

  const handleReset = () => {
    if (template) {
      setConfig(template.defaultConfig);
      setTitle(template.name);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const renderConfigField = (key: string, value: any) => {
    switch (key) {
      case 'symbols':
        return (
          <div className="space-y-2">
            <Label>Stock Symbols</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(value as string[]).map((symbol, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {symbol}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      const newSymbols = [...(value as string[])];
                      newSymbols.splice(index, 1);
                      updateConfig(key, newSymbols);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add symbol (e.g., AAPL)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    const symbol = input.value.toUpperCase().trim();
                    if (symbol && !value.includes(symbol)) {
                      updateConfig(key, [...value, symbol]);
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        );

      case 'provider':
        return (
          <div className="space-y-2">
            <Label>Data Provider</Label>
            <Select value={value} onValueChange={(v) => updateConfig(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alphavantage">Alpha Vantage (US Markets)</SelectItem>
                <SelectItem value="finnhub">Finnhub (Global Markets)</SelectItem>
                <SelectItem value="indian">Indian API (Indian Markets)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'dataType':
        return (
          <div className="space-y-2">
            <Label>Market Data Type</Label>
            <Select value={value} onValueChange={(v) => updateConfig(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gainers">Top Gainers</SelectItem>
                <SelectItem value="losers">Top Losers</SelectItem>
                <SelectItem value="mostActive">Most Active</SelectItem>
                <SelectItem value="indices">Market Indices</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'refreshInterval':
        return (
          <div className="space-y-2">
            <Label>Refresh Interval (seconds)</Label>
            <Select
              value={String(value / 1000)}
              onValueChange={(v) => updateConfig(key, Number.parseInt(v) * 1000)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="900">15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'timeframe':
        return (
          <div className="space-y-2">
            <Label>Time Frame</Label>
            <Select value={value} onValueChange={(v) => updateConfig(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="3M">3 Months</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'chartType':
        return (
          <div className="space-y-2">
            <Label>Chart Type</Label>
            <Select value={value} onValueChange={(v) => updateConfig(key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="candlestick">Candlestick</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        if (typeof value === 'boolean') {
          return (
            <div className="flex items-center space-x-2">
              <Switch checked={value} onCheckedChange={(checked) => updateConfig(key, checked)} />
              <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</Label>
            </div>
          );
        }

        if (typeof value === 'number') {
          return (
            <div className="space-y-2">
              <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => updateConfig(key, Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          );
        }

        if (typeof value === 'string') {
          return (
            <div className="space-y-2">
              <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</Label>
              <Input value={value} onChange={(e) => updateConfig(key, e.target.value)} />
            </div>
          );
        }

        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
          <DialogDescription>
            Customize the settings for your {template?.name} widget
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Widget Title */}
          <div className="space-y-2">
            <Label>Widget Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title"
            />
          </div>

          {/* Widget Configuration */}
          <div className="space-y-4">
            <h4 className="font-medium">Widget Settings</h4>
            {Object.entries(config).map(([key, value]) => (
              <div key={key}>{renderConfigField(key, value)}</div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
