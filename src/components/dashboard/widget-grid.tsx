'use client';

import { useEffect } from 'react';
import { useWidgetStore } from '@/lib/widget-store';
import { DraggableWidgetCard } from './draggable-widget-card';
import { DashboardDropZone } from './dashboard-drop-zone';
import { SortableContext, rectSortingStrategy } from '@/lib/drag-and-drop';
import { useWidgetData } from '@/hooks/use-financial-data';
import { TrendingUp } from 'lucide-react';

export function WidgetGrid() {
  const { widgets, updateWidgetData } = useWidgetStore();

  if (widgets.length === 0) {
    return (
      <DashboardDropZone>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No widgets added yet</h3>
          <p className="text-muted-foreground mb-4 max-w-sm">
            Start building your dashboard by adding widgets from the sidebar or drag them here.
          </p>
        </div>
      </DashboardDropZone>
    );
  }

  return (
    <DashboardDropZone>
      <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className={`
                ${widget.size.width === 2 ? 'md:col-span-2' : ''}
                ${widget.size.width === 3 ? 'md:col-span-3' : ''}
                ${widget.size.width === 4 ? 'md:col-span-4' : ''}
                ${widget.size.height === 2 ? 'row-span-2' : ''}
              `}
            >
              <WidgetCardWithData widget={widget} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DashboardDropZone>
  );
}

// Wrapper component to handle data fetching for each widget
function WidgetCardWithData({ widget }: { widget: any }) {
  const { data, isLoading, error } = useWidgetData(widget.type, widget.config);
  const { updateWidgetData } = useWidgetStore();

  useEffect(() => {
    if (data && !isLoading) {
      updateWidgetData(widget.id, data);
    }
  }, [data, isLoading, widget.id, updateWidgetData]);

  return <DraggableWidgetCard widget={{ ...widget, data, isLoading, error }} />;
}
