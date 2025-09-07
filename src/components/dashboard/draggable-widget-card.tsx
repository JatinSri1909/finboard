'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WidgetCard } from './widget-card';
import type { Widget } from '@/lib/widget-store';
import { GripVertical } from 'lucide-react';

interface DraggableWidgetCardProps {
  widget: Widget;
}

export function DraggableWidgetCard({ widget }: DraggableWidgetCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: widget.id,
    data: {
      type: 'widget',
      widget,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative group ${isDragging ? 'z-50' : ''}`}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="p-1 rounded bg-background/80 backdrop-blur-sm border shadow-sm">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Widget Card */}
      <WidgetCard widget={widget} />
    </div>
  );
}
