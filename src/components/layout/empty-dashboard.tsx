'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartColumn, Plus, Zap, Globe, BarChart3 } from 'lucide-react';
import { useWidgetStore } from '@/store';

export function EmptyDashboard() {
  const { setIsAddingWidget } = useWidgetStore();

  const handleAddWidget = () => {
    setIsAddingWidget(true);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChartColumn className="h-12 w-12 text-slate-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Build Your Finance Dashboard</h1>
          <p className="text-lg text-slate-400 mb-8">
            Create custom widgets by connecting to any finance API. Track stocks, crypto, forex, or
            economic indicators - all in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Globe className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Connect APIs</h3>
              <p className="text-sm text-slate-400">
                Connect to any financial API with a simple URL
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Custom Widgets</h3>
              <p className="text-sm text-slate-400">
                Choose from cards, tables, or charts to display your data
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">Real-time Updates</h3>
              <p className="text-sm text-slate-400">
                Auto-refresh data at your preferred intervals
              </p>
            </CardContent>
          </Card>
        </div>

        <Button onClick={handleAddWidget} size="lg" className="text-lg px-8 py-3">
          <Plus className="h-5 w-5 mr-2" />
          Add Widget
        </Button>
      </div>
    </div>
  );
}
