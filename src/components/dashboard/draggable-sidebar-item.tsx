'use client';

import { useDraggable } from '@dnd-kit/core';
import type { WidgetTemplate } from '@/lib/widget-templates';
import { Badge } from '@/components/ui/badge';

interface DraggableSidebarItemProps {
  template: WidgetTemplate;
  onClick?: () => void;
}

export function DraggableSidebarItem({ template, onClick }: DraggableSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: template.id,
    data: {
      type: 'widget-template',
      template,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors ${
        isDragging ? 'shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10">
          <template.icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-card-foreground">{template.name}</h4>
            {template.popular && (
              <Badge variant="secondary" className="text-xs">
                Popular
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
        </div>
      </div>
    </div>
  );
}
