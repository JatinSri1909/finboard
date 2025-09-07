import { useState } from 'react';
import { X, TestTube, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDashboardStore, Widget } from '@/stores/dashboard-store';
import { toast } from 'sonner';
import { API_PRESETS } from '@/config/environment';

export const AddWidgetModal = () => {
  const { isAddingWidget, setIsAddingWidget, addWidget } = useDashboardStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'card' as Widget['type'],
    apiUrl: '',
    refreshInterval: 30,
  });
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'card',
      apiUrl: '',
      refreshInterval: 30,
    });
    setApiTestResult(null);
  };

  const handleClose = () => {
    setIsAddingWidget(false);
    resetForm();
  };

  const testApiConnection = async () => {
    if (!formData.apiUrl) {
      toast.error('Please enter an API URL first');
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const response = await fetch(formData.apiUrl);
      const data = await response.json();
      
      if (response.ok) {
        setApiTestResult({
          success: true,
          message: `API connection successful! Found ${Object.keys(data).length} top-level fields.`
        });
        toast.success('API connection test successful!');
      } else {
        setApiTestResult({
          success: false,
          message: `API returned error: ${response.status} - ${data.message || 'Unknown error'}`
        });
      }
    } catch (error) {
      setApiTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Network error'}`
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.apiUrl) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newWidget: Omit<Widget, 'id'> = {
      name: formData.name,
      type: formData.type,
      apiUrl: formData.apiUrl,
      refreshInterval: formData.refreshInterval,
      config: {
        maxRows: formData.type === 'table' ? 10 : undefined,
        chartType: formData.type === 'chart' ? 'line' : undefined,
        timeInterval: formData.type === 'chart' ? 'daily' : undefined,
      },
      position: {
        x: 0,
        y: 0,
        w: formData.type === 'table' ? 8 : 4,
        h: formData.type === 'table' ? 6 : formData.type === 'chart' ? 5 : 3,
      },
    };

    addWidget(newWidget);
    toast.success(`Widget "${formData.name}" added successfully!`);
    handleClose();
  };

  const selectApiPreset = (preset: string) => {
    setFormData(prev => ({
      ...prev,
      apiUrl: API_PRESETS[preset as keyof typeof API_PRESETS],
      name: prev.name || preset.split(' - ')[1] || preset
    }));
  };

  return (
    <Dialog open={isAddingWidget} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background shadow-modal border-widget-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            Add New Widget
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='space-y-2'>
            <Label htmlFor="name" className="text-foreground">Widget Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Bitcoin Price Tracker"
              className="bg-input border-widget-border text-foreground"
              required
            />
          </div>

          <div className='space-y-2'>
            <Label className="text-foreground mb-2 block">API URL</Label>
            <div className="space-y-2">
              <Select onValueChange={selectApiPreset}>
                <SelectTrigger className="bg-input border-widget-border text-foreground">
                  <SelectValue placeholder="Choose from presets or enter custom URL" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-widget-border">
                  {Object.keys(API_PRESETS).map((preset) => (
                    <SelectItem key={preset} value={preset} className="text-foreground">
                      {preset}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Input
                  value={formData.apiUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, apiUrl: e.target.value }))}
                  placeholder="https://api.example.com/data"
                  className="bg-input border-widget-border text-foreground flex-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={testApiConnection}
                  disabled={isTestingApi || !formData.apiUrl}
                  className="border-widget-border hover:bg-widget-hover"
                >
                  {isTestingApi ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                  Test
                </Button>
              </div>

              {apiTestResult && (
                <Badge 
                  variant={apiTestResult.success ? "default" : "destructive"}
                  className="w-full justify-start text-xs py-2"
                >
                  {apiTestResult.message}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <Label className="text-foreground">Display Mode</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value: Widget['type']) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger className="bg-input border-widget-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-widget-border">
                <SelectItem value="card" className="text-foreground">Card</SelectItem>
                <SelectItem value="table" className="text-foreground">Table</SelectItem>
                <SelectItem value="chart" className="text-foreground">Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="interval" className="text-foreground">Refresh Interval (seconds)</Label>
            <Input
              id="interval"
              type="number"
              min="10"
              max="3600"
              value={formData.refreshInterval}
              onChange={(e) => setFormData(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) || 30 }))}
              className="bg-input border-widget-border text-foreground"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              className="flex-1 border-widget-border hover:bg-widget-hover"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-foreground hover:opacity-90 shadow-button"
            >
              Add Widget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};