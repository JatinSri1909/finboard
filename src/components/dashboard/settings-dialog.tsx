'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppSettingsStore } from '@/lib/app-settings-store';
import { useDataCacheStore } from '@/lib/data-cache-store';
import { useWidgetStore } from '@/lib/widget-store';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Upload, RefreshCw } from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, preferences, updateSettings, exportData, importData, clearRecentSearches } =
    useAppSettingsStore();
  const { clear: clearCache, cleanup: cleanupCache, getSize: getCacheSize } = useDataCacheStore();
  const { clearAllWidgets, exportLayout } = useWidgetStore();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const success = importData(text);
      if (success) {
        alert('Data imported successfully!');
        setImportFile(null);
      } else {
        alert('Failed to import data. Please check the file format.');
      }
    } catch (error) {
      alert('Error reading file.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
          <DialogDescription>
            Customize your dashboard preferences and manage your data
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="general" className="space-y-6 p-1">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Display Settings</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value: any) => updateSettings({ currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="JPY">JPY (¥)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value: any) => updateSettings({ dateFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Use smaller widgets and reduced spacing
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically refresh widget data
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => updateSettings({ autoRefresh: checked })}
                  />
                </div>

                {settings.autoRefresh && (
                  <div className="space-y-2">
                    <Label>Refresh Interval (seconds)</Label>
                    <Select
                      value={String(settings.refreshInterval / 1000)}
                      onValueChange={(value) =>
                        updateSettings({ refreshInterval: Number.parseInt(value) * 1000 })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6 p-1">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Management</h3>

                <div className="space-y-2">
                  <Label>API Provider</Label>
                  <Select
                    value={settings.apiProvider}
                    onValueChange={(value: any) => updateSettings({ apiProvider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo Data</SelectItem>
                      <SelectItem value="alphavantage">Alpha Vantage</SelectItem>
                      <SelectItem value="finnhub">Finnhub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Cache Management</h4>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Data Cache</p>
                      <p className="text-sm text-muted-foreground">
                        {getCacheSize()} cached entries
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={cleanupCache}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Cleanup
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearCache}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 p-1">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Preferences</h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Favorite Symbols</Label>
                      <Badge variant="secondary">{preferences.favoriteSymbols.length}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.favoriteSymbols.map((symbol) => (
                        <Badge key={symbol} variant="outline">
                          {symbol}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Recent Searches</Label>
                      <Button variant="outline" size="sm" onClick={clearRecentSearches}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {preferences.recentSearches.map((search, index) => (
                        <Badge key={index} variant="outline">
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Custom Watchlists</Label>
                      <Badge variant="secondary">{preferences.customWatchlists.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {preferences.customWatchlists.map((watchlist) => (
                        <div key={watchlist.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{watchlist.name}</h4>
                            <Badge variant="outline">{watchlist.symbols.length} symbols</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6 p-1">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Backup & Restore</h3>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Export Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Export all your settings, preferences, and widget configurations
                    </p>
                    <Button onClick={handleExportData}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Import Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Import previously exported settings and configurations
                    </p>
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept=".json"
                        onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                      />
                      <Button onClick={handleImportData} disabled={!importFile}>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg border-destructive/20">
                    <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <Button variant="destructive" onClick={clearAllWidgets}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All Widgets
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
