import { useMemo, useState } from 'react';
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
  const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');

  const layouts = useMemo(() => {
    const baseLayout = widgets.map((widget) => ({
      i: widget.id,
      x: widget.position.x,
      y: widget.position.y,
      w: widget.position.w,
      h: widget.position.h,
    }));

    return {
      lg: baseLayout,
      md: baseLayout.map((item) => ({
        ...item,
        w: Math.min(item.w, 10), // Constrain width for medium screens
        x: Math.min(item.x, 10 - Math.min(item.w, 10)), // Ensure it fits
      })),
      sm: baseLayout.map((item) => ({
        ...item,
        w: Math.min(item.w, 6), // Constrain width for small screens
        x: Math.min(item.x, 6 - Math.min(item.w, 6)), // Ensure it fits
      })),
      xs: baseLayout.map((item) => ({
        ...item,
        w: Math.min(item.w, 4), // Constrain width for extra small screens
        x: Math.min(item.x, 4 - Math.min(item.w, 4)), // Ensure it fits
      })),
      xxs: baseLayout.map((item, index) => ({
        ...item,
        w: 2, // Full width on mobile
        x: 0, // Always start at left
        y: index * item.h, // Stack vertically
      })),
    };
  }, [widgets]);

  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    // Only save layout changes for desktop (lg) breakpoint to avoid overwriting with mobile layouts
    if (currentBreakpoint === 'lg') {
      layout.forEach((item) => {
        const widget = widgets.find((w) => w.id === item.i);
        if (widget) {
          updateWidgetLayout(widget.id, {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          });
        }
      });
    }
  };

  const handleBreakpointChange = (breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  };

  if (widgets.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Build Your Finance Dashboard</h3>
          <p className="text-muted-foreground">
            Create custom widgets by connecting to any finance API. Track stocks, monitor
            performance, and visualize real-time data.
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
    <div className="flex-1 p-2 sm:p-4 lg:p-6">
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

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .react-grid-item > .react-resizable-handle {
            display: none !important;
          }
          
          .react-grid-layout {
            margin: 0 -8px;
          }
          
          .react-grid-item {
            touch-action: none;
            position: relative !important;
          }
          
          /* Force proper stacking on mobile */
          .react-grid-item.react-grid-placeholder {
            display: none !important;
          }
        }

        /* Tablet optimizations */
        @media (max-width: 996px) and (min-width: 769px) {
          .react-grid-item > .react-resizable-handle {
            display: none !important;
          }
        }

        /* Prevent collision issues */
        .react-grid-layout {
          position: relative;
          min-height: 100vh;
        }
        
        /* Smooth transitions only on desktop */
        @media (min-width: 1200px) {
          .react-grid-item {
            transition: var(--transition-smooth);
          }
        }
      `}</style>

      <ResponsiveGridLayout
        key={`grid-${currentBreakpoint}`}
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable={currentBreakpoint === 'lg'} // Only allow dragging on desktop
        isResizable={currentBreakpoint === 'lg'} // Only allow resizing on desktop
        compactType="vertical"
        preventCollision={true}
        autoSize={true}
        useCSSTransforms={true}
      >
        {widgets.map((widget) => (
          <div key={widget.id}>
            <WidgetCard widget={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
