'use client';

import { useWidgetStore } from '@/store';
import { WidgetContainer } from './widget-container';
import { AddWidgetCard } from '@/components/shared/add-widget-card';
import { EmptyDashboard } from './empty-dashboard';

export function WidgetGrid() {
  const { widgets } = useWidgetStore();

  if (widgets.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div 
        className="grid gap-6"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gridAutoRows: 'max-content',
        }}
      >
        {widgets.map((widget, index) => {
          // Create staggered heights based on widget type and content
          const getWidgetHeight = () => {
            const fieldCount = widget.config.selectedFields.length;
            
            if (widget.config.displayMode === 'chart') {
              return 'h-96'; // Charts are always tall
            } else if (widget.config.displayMode === 'table') {
              return fieldCount > 3 ? 'h-96' : 'h-80'; // Tables vary by field count
            } else {
              // Card widgets vary by field count
              if (fieldCount <= 2) return 'h-64';
              if (fieldCount <= 4) return 'h-80';
              return 'h-96';
            }
          };

          return (
            <div 
              key={widget.id} 
              className={`${getWidgetHeight()} w-full`}
              style={{
                gridRow: `span ${widget.config.displayMode === 'chart' ? 3 : widget.config.selectedFields.length > 4 ? 3 : 2}`,
              }}
            >
              <WidgetContainer widget={widget} />
            </div>
          );
        })}
        
        {/* Add Widget Card */}
        <div className="h-64 w-full" style={{ gridRow: 'span 2' }}>
          <AddWidgetCard />
        </div>
      </div>
    </div>
  );
}
