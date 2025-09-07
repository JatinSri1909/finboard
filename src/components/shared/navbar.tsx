import { ChartColumn } from 'lucide-react';
import { AddWidgetButton } from './add-widget-button';
import { useWidgetStore } from '@/store';

export default function Navbar() {
  const { widgets } = useWidgetStore();
  const activeWidgets = widgets.length;

  return (
    <nav className="bg-slate-950 h-16 flex items-center justify-between p-4 py-10 border-b border-neutral-500">
      <div className="flex ml-2">
        <div className="bg-primary text-primary-foreground rounded-sm mr-3">
          <ChartColumn className="h-6 w-6 m-3 " />
        </div>
        <div className="flex flex-col">
          <span className="text-primary font-bold text-2xl">Finance Dashboard</span>
          <span className="text-muted-foreground text-xs">
            {activeWidgets} active widget{activeWidgets !== 1 ? 's' : ''} • Real-time data
          </span>
        </div>
      </div>
      <AddWidgetButton />
    </nav>
  );
}
