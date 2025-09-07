import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore, Widget } from '@/stores/dashboard-store';
import { toast } from 'sonner';

interface WidgetConfigModalProps {
  widget: Widget | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetConfigModal = ({ widget, isOpen, onClose }: WidgetConfigModalProps) => {
  const { updateWidget } = useDashboardStore();
  const [config, setConfig] = useState<Widget['config']>({});
  const [name, setName] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    if (widget) {
      setConfig(widget.config);
      setName(widget.name);
      setRefreshInterval(widget.refreshInterval);
    }
  }, [widget]);

  const handleSave = () => {
    if (!widget) return;

    updateWidget(widget.id, {
      name,
      refreshInterval,
      config,
    });

    toast.success('Widget configuration updated!');
    onClose();
  };

  if (!widget) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-background shadow-modal border-widget-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Settings className="w-4 h-4" />
            Configure Widget
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Basic Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="widget-name" className="text-foreground">
                Widget Name
              </Label>
              <Input
                id="widget-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-widget-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh-interval" className="text-foreground">
                Refresh Interval (seconds)
              </Label>
              <Input
                id="refresh-interval"
                type="number"
                min="10"
                max="3600"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 30)}
                className="bg-input border-widget-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-foreground">
                Stock Symbol
              </Label>
              <Input
                id="symbol"
                value={config.symbol || ''}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))
                }
                placeholder="e.g., AAPL, GOOGL"
                className="bg-input border-widget-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Display Fields (comma-separated)</Label>
              <Input
                value={(config.displayFields || []).join(', ')}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    displayFields: e.target.value
                      .split(',')
                      .map((f) => f.trim())
                      .filter((f) => f),
                  }))
                }
                placeholder="Leave empty to show all fields"
                className="bg-input border-widget-border text-foreground"
              />
            </div>
          </div>

          {/* Right Column - Widget Specific Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Widget Settings</h3>

            {/* Widget Type Specific Settings */}
            {widget.type === 'table' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="max-rows" className="text-foreground">
                    Max Rows
                  </Label>
                  <Input
                    id="max-rows"
                    type="number"
                    min="5"
                    max="100"
                    value={config.maxRows || 10}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, maxRows: parseInt(e.target.value) || 10 }))
                    }
                    className="bg-input border-widget-border text-foreground"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Show Search</Label>
                  <Switch
                    checked={config.showSearch ?? true}
                    onCheckedChange={(checked) =>
                      setConfig((prev) => ({ ...prev, showSearch: checked }))
                    }
                  />
                </div>
              </>
            )}

            {widget.type === 'chart' && (
              <>
                <div className="space-y-2">
                  <Label className="text-foreground">Chart Type</Label>
                  <Select
                    value={config.chartType || 'line'}
                    onValueChange={(value: 'line') =>
                      setConfig((prev) => ({ ...prev, chartType: value }))
                    }
                  >
                    <SelectTrigger className="bg-input border-widget-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-widget-border">
                      <SelectItem value="line" className="text-foreground">
                        Line Chart
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - Full Width at Bottom */}
        <div className="flex gap-2 pt-4 border-t border-widget-border mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-widget-border hover:bg-widget-hover"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-foreground hover:opacity-90 shadow-button"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
