import { Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/dashboard-store';

export const DashboardHeader = () => {
  const { setIsAddingWidget, widgets } = useDashboardStore();

  return (
    <header className="flex items-center justify-between p-6 border-b border-widget-border bg-gradient-secondary">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {widgets.length} active widget{widgets.length !== 1 ? 's' : ''} • Real-time data
          </p>
        </div>
      </div>
      
      <Button 
        onClick={() => setIsAddingWidget(true)}
        className="bg-foreground hover:opacity-90 transition-opacity shadow-button"
        size="lg"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Widget
      </Button>
    </header>
  );
};