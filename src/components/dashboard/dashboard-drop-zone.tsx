'use client';

import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DashboardDropZoneProps {
  children: ReactNode;
}

export function DashboardDropZone({ children }: DashboardDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'dashboard-drop-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] transition-colors ${
        isOver ? 'bg-accent/20 border-2 border-dashed border-primary' : ''
      }`}
    >
      {children}
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-primary/10 border-2 border-dashed border-primary rounded-lg p-8">
            <p className="text-primary font-medium">Drop widget here</p>
          </div>
        </div>
      )}
    </div>
  );
}
