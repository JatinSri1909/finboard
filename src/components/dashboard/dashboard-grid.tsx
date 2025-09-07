import { useMemo } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useDashboardStore } from '@/stores/dashboard-store';
import { WidgetCard } from './widget-card';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const DashboardGrid = () => {
  const { widgets, updateWidgetLayout, setIsAddingWidget } = useDashboardStore();

  const layouts = useMemo(() => {
    return {
      lg: widgets.map(widget => ({
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.position.w,
        h: widget.position.h,
      })),
    };
  }, [widgets]);

  const handleLayoutChange = (layout: Layout[]) => {
    layout.forEach(item => {
      const widget = widgets.find(w => w.id === item.i);
      if (widget) {
        updateWidgetLayout(widget.id, {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        });
      }
    });
  };

  if (widgets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Build Your Finance Dashboard
          </h3>
          <p className="text-muted-foreground">
            Create custom widgets by connecting to any finance API. Track stocks, monitor performance, and visualize real-time data.
          </p>
          <Button 
            onClick={() => setIsAddingWidget(true)}
            className="bg-foreground hover:opacity-90 shadow-button"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <style>{`
        .react-grid-item.react-grid-placeholder {
          background: hsl(var(--primary) / 0.2) !important;
          border: 2px dashed hsl(var(--primary)) !important;
          border-radius: var(--radius) !important;
        }
        
        .react-grid-item > .react-resizable-handle::after {
          border-right: 2px solid hsl(var(--primary)) !important;
          border-bottom: 2px solid hsl(var(--primary)) !important;
        }

        .react-grid-item.react-draggable-dragging {
          z-index: 1000;
        }

        .react-grid-item {
          transition: var(--transition-smooth);
        }
      `}</style>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={true}
        isResizable={true}
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map(widget => (
          <div key={widget.id}>
            <WidgetCard widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};