'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Search, Check, X, Plus, Minus, ChartLine, Table, BarChart } from 'lucide-react';
import { useWidgetStore } from '@/store';
import { useApi } from '@/hooks';
import { DataMapper } from '@/lib/data-mapper';
import { WidgetConfig, WidgetField, WidgetDisplayMode } from '@/types';

interface WidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWidgetId?: string;
}

export function WidgetConfigModal({ isOpen, onClose, editingWidgetId }: WidgetConfigModalProps) {
  const { widgets, addWidget, updateWidget } = useWidgetStore();
  const { testApiConnection, isLoading: isTestingConnection } = useApi();

  const [formData, setFormData] = useState({
    name: '',
    apiUrl: '',
    refreshInterval: 30,
    displayMode: 'card' as WidgetDisplayMode,
  });

  const [availableFields, setAvailableFields] = useState<WidgetField[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArraysOnly, setShowArraysOnly] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<{
    success: boolean;
    message: string;
    fields?: WidgetField[];
  } | null>(null);

  const editingWidget = editingWidgetId ? widgets.find((w) => w.id === editingWidgetId) : null;

  useEffect(() => {
    if (editingWidget) {
      setFormData({
        name: editingWidget.config.name,
        apiUrl: editingWidget.config.apiUrl,
        refreshInterval: editingWidget.config.refreshInterval,
        displayMode: editingWidget.config.displayMode,
      });
      setSelectedFields(editingWidget.config.selectedFields);
      setAvailableFields(editingWidget.config.fields);
    } else {
      setFormData({
        name: '',
        apiUrl: '',
        refreshInterval: 30,
        displayMode: 'card',
      });
      setSelectedFields([]);
      setAvailableFields([]);
    }
    setApiTestResult(null);
    setSearchQuery('');
  }, [editingWidget, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestApi = async () => {
    if (!formData.apiUrl.trim()) return;

    try {
      console.log('Testing API:', formData.apiUrl);
      const result = await testApiConnection(formData.apiUrl);
      console.log('API test result:', result);

      if (result.success && result.fields) {
        console.log('Fields found:', result.fields);
        setAvailableFields(result.fields);
        setApiTestResult({
          success: true,
          message: `API connection successful! ${result.fields.length} fields found.`,
          fields: result.fields,
        });
      } else {
        console.log('API test failed:', result.error);
        setApiTestResult({
          success: false,
          message: result.error || 'API connection failed',
        });
      }
    } catch (error) {
      console.error('API test error:', error);
      setApiTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleFieldToggle = (fieldPath: string) => {
    setSelectedFields((prev) => {
      if (prev.includes(fieldPath)) {
        return prev.filter((path) => path !== fieldPath);
      } else {
        return [...prev, fieldPath];
      }
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.apiUrl.trim() || selectedFields.length === 0) {
      return;
    }

    const config: WidgetConfig = {
      id: editingWidget?.id || `widget-${Date.now()}`,
      name: formData.name,
      apiUrl: formData.apiUrl,
      refreshInterval: formData.refreshInterval,
      displayMode: formData.displayMode,
      selectedFields,
      fields: availableFields,
      position: editingWidget?.config.position || { x: 0, y: 0, width: 1, height: 1 },
      createdAt: editingWidget?.config.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingWidget) {
      updateWidget(editingWidget.id, config);
    } else {
      addWidget(config);
    }

    onClose();
  };

  const filteredFields = DataMapper.filterFields(availableFields, searchQuery).filter((field) => {
    if (!showArraysOnly) return true;
    // Show arrays and also show fields that are inside arrays
    return field.type === 'array' || field.path.includes('[');
  });

  const displayModes: { value: WidgetDisplayMode; label: string; icon: React.ReactNode }[] = [
    { value: 'card', label: 'Card', icon: <BarChart /> },
    { value: 'table', label: 'Table', icon: <Table /> },
    { value: 'chart', label: 'Chart', icon: <ChartLine /> },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingWidget ? 'Edit Widget' : 'Add New Widget'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Widget Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Widget Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Bitcoin Price Tracker"
                className="bg-slate-700 border-slate-600"
              />
            </div>

            <div>
              <Label htmlFor="apiUrl" className="text-sm font-medium mb-2 block">
                API URL
              </Label>
              <div className="flex gap-2">
                <Input
                  id="apiUrl"
                  value={formData.apiUrl}
                  onChange={(e) => handleInputChange('apiUrl', e.target.value)}
                  placeholder="e.g., https://api.coinbase.com/v2/exchange-rates?currency=BTC"
                  className="bg-slate-700 border-slate-600"
                />
                <Button
                  onClick={handleTestApi}
                  disabled={!formData.apiUrl.trim() || isTestingConnection}
                  size="sm"
                >
                  {isTestingConnection ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test'}
                </Button>
              </div>
              {apiTestResult && (
                <div
                  className={`flex items-center gap-2 mt-2 text-sm ${
                    apiTestResult.success ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {apiTestResult.success ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {apiTestResult.message}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="refreshInterval" className="text-sm font-medium mb-2 block">
                Refresh Interval (seconds)
              </Label>
              <Input
                id="refreshInterval"
                type="number"
                value={formData.refreshInterval}
                onChange={(e) =>
                  handleInputChange('refreshInterval', parseInt(e.target.value) || 30)
                }
                min="10"
                max="3600"
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          {/* Field Selection Section */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Select Fields to Display</Label>

            <div>
              <Label className="text-sm font-medium mb-2 block">Display Mode</Label>
              <div className="flex gap-2">
                {displayModes.map((mode) => (
                  <Button
                    key={mode.value}
                    variant={formData.displayMode === mode.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleInputChange('displayMode', mode.value)}
                    className="flex items-center gap-2"
                  >
                    <span>{mode.icon}</span>
                    {mode.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Search Fields</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search for fields..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showArraysOnly"
                checked={showArraysOnly}
                onCheckedChange={(checked) => setShowArraysOnly(checked === true)}
              />
              <Label htmlFor="showArraysOnly" className="text-sm">
                Show arrays only (for table view)
              </Label>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Available Fields */}
              <div className="flex flex-col">
                <Label className="text-sm font-medium mb-2">Available Fields</Label>
                <Card className="bg-slate-800 border-slate-700 flex-1">
                  <CardContent className="max-h-64 overflow-y-auto px-2">
                    <div className="space-y-1">
                      {filteredFields.length === 0 && availableFields.length > 0 ? (
                        <div className="text-center text-slate-400 py-4">
                          <div className="text-sm">No fields match the current filter.</div>
                          <div className="text-xs mt-1">Try unchecking "Show arrays only" or clearing the search.</div>
                        </div>
                      ) : (
                        filteredFields.map((field) => (
                        <div
                          key={field.path}
                          className="flex items-center justify-between p-1 bg-slate-700 rounded hover:bg-slate-600 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {field.path}
                            </div>
                            <div className="text-xs text-slate-400">
                              {field.type} | {JSON.stringify(field.sampleValue).slice(0, 50)}
                              {JSON.stringify(field.sampleValue).length > 50 ? '...' : ''}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFieldToggle(field.path)}
                            className="ml-2"
                          >
                            {selectedFields.includes(field.path) ? (
                              <Minus className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Selected Fields */}
              <div className="flex flex-col">
                <Label className="text-sm font-medium mb-2">Selected Fields</Label>
                <Card className="bg-slate-800 border-slate-700 flex-1">
                  <CardContent className="max-h-64 overflow-y-auto px-2">
                    <div className="space-y-2">
                      {selectedFields.map((fieldPath) => (
                        <div
                          key={fieldPath}
                          className="flex items-center justify-between p-2 bg-slate-700 rounded"
                        >
                          <span className="text-sm text-white truncate">{fieldPath}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFieldToggle(fieldPath)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              !formData.name.trim() || !formData.apiUrl.trim() || selectedFields.length === 0
            }
          >
            {editingWidget ? 'Update Widget' : 'Add Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
