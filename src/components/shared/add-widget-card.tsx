'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useWidgetStore } from '@/store';

export function AddWidgetCard() {
  const { setIsAddingWidget } = useWidgetStore();

  const handleAddWidget = () => {
    setIsAddingWidget(true);
  };

  return (
    <Card 
      className="bg-slate-800 border-slate-700 border-dashed hover:border-green-500 hover:bg-slate-800/80 transition-all duration-300 cursor-pointer w-full group"
      onClick={handleAddWidget}
    >
      <CardContent className="flex flex-col items-center justify-center min-h-[300px] p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-slate-700 group-hover:bg-green-500/20 rounded-full flex items-center justify-center mx-auto transition-all duration-300">
            <Plus className="h-10 w-10 text-slate-400 group-hover:text-green-400 transition-colors duration-300" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">Add Widget</h3>
            <p className="text-slate-400 group-hover:text-slate-300 max-w-xs transition-colors duration-300">
              Connect to a finance API and create a custom widget
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
