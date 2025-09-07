'use client';

import { createContext, useContext, type ReactNode } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  KeyboardSensor,
  TouchSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useWidgetStore } from './widget-store';
import { getWidgetTemplate } from './widget-templates';

interface DragAndDropContextType {
  activeId: string | null;
  isDragging: boolean;
}

const DragAndDropContext = createContext<DragAndDropContextType>({
  activeId: null,
  isDragging: false,
});

export const useDragAndDrop = () => useContext(DragAndDropContext);

interface DragAndDropProviderProps {
  children: ReactNode;
}

export function DragAndDropProvider({ children }: DragAndDropProviderProps) {
  const { widgets, addWidget, updateWidgetPosition, reorderWidgets } = useWidgetStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    // Handle drag start
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for real-time feedback
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Handle widget reordering
    if (active.id !== over.id && widgets.find((w) => w.id === active.id)) {
      const activeIndex = widgets.findIndex((w) => w.id === active.id);
      const overIndex = widgets.findIndex((w) => w.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        reorderWidgets(activeIndex, overIndex);
      }
    }

    // Handle adding new widget from sidebar
    if (active.data.current?.type === 'widget-template' && over.id === 'dashboard-drop-zone') {
      const template = getWidgetTemplate(active.id as string);
      if (template) {
        addWidget(template);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <DragAndDropContext.Provider value={{ activeId: null, isDragging: false }}>
        {children}
      </DragAndDropContext.Provider>
    </DndContext>
  );
}

export { SortableContext, verticalListSortingStrategy, rectSortingStrategy };
