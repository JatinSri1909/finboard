'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';

export interface Widget {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  data?: any;
  lastUpdated?: Date;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  popular: boolean;
  defaultConfig: Record<string, any>;
  defaultSize: { width: number; height: number };
}

interface WidgetStore {
  widgets: Widget[];
  selectedWidget: string | null;
  isConfiguring: boolean;

  // Widget management
  addWidget: (template: WidgetTemplate, position?: { x: number; y: number }) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  duplicateWidget: (id: string) => void;

  // Widget selection and configuration
  selectWidget: (id: string | null) => void;
  setConfiguring: (configuring: boolean) => void;

  // Widget data
  updateWidgetData: (id: string, data: any) => void;

  // Layout management
  updateWidgetPosition: (id: string, position: { x: number; y: number }) => void;
  updateWidgetSize: (id: string, size: { width: number; height: number }) => void;

  // Drag and drop methods
  reorderWidgets: (activeIndex: number, overIndex: number) => void;

  // Bulk operations
  clearAllWidgets: () => void;
  exportLayout: () => string;
  importLayout: (layout: string) => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      selectedWidget: null,
      isConfiguring: false,

      addWidget: (template, position = { x: 0, y: 0 }) => {
        const newWidget: Widget = {
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: template.id,
          title: template.name,
          position,
          size: template.defaultSize,
          config: { ...template.defaultConfig },
          lastUpdated: new Date(),
        };

        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
          selectedWidget: state.selectedWidget === id ? null : state.selectedWidget,
        }));
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, lastUpdated: new Date() } : w
          ),
        }));
      },

      duplicateWidget: (id) => {
        const widget = get().widgets.find((w) => w.id === id);
        if (widget) {
          const newWidget: Widget = {
            ...widget,
            id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: `${widget.title} (Copy)`,
            position: { x: widget.position.x + 20, y: widget.position.y + 20 },
            lastUpdated: new Date(),
          };

          set((state) => ({
            widgets: [...state.widgets, newWidget],
          }));
        }
      },

      selectWidget: (id) => {
        set({ selectedWidget: id });
      },

      setConfiguring: (configuring) => {
        set({ isConfiguring: configuring });
      },

      updateWidgetData: (id, data) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, data, lastUpdated: new Date() } : w
          ),
        }));
      },

      updateWidgetPosition: (id, position) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, position, lastUpdated: new Date() } : w
          ),
        }));
      },

      updateWidgetSize: (id, size) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, size, lastUpdated: new Date() } : w
          ),
        }));
      },

      reorderWidgets: (activeIndex, overIndex) => {
        set((state) => ({
          widgets: arrayMove(state.widgets, activeIndex, overIndex),
        }));
      },

      clearAllWidgets: () => {
        set({ widgets: [], selectedWidget: null });
      },

      exportLayout: () => {
        const { widgets } = get();
        return JSON.stringify({ widgets, version: '1.0', exportedAt: new Date() });
      },

      importLayout: (layout) => {
        try {
          const parsed = JSON.parse(layout);
          if (parsed.widgets && Array.isArray(parsed.widgets)) {
            set({ widgets: parsed.widgets, selectedWidget: null });
          }
        } catch (error) {
          console.error('Failed to import layout:', error);
        }
      },
    }),
    {
      name: 'finboard-widgets',
      version: 1,
    }
  )
);
