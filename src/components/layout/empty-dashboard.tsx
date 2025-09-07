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
      </div>
    </div>
  );
}
