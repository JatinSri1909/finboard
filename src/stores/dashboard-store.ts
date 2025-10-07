import { Widget, DashboardState } from "@/interface";
import { findNextPosition } from "@/lib/next-position";
import { create } from "zustand";
import { persist } from "zustand/middleware";




export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      isAddingWidget: false,
      editingWidget: null,

      addWidget: (widget) => {
        const state = get();
        const nextPosition = findNextPosition(
          state.widgets,
          widget.position.w,
          widget.position.h,
        );
        const newWidget: Widget = {
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: { ...widget.position, ...nextPosition },
        };
        set((state) => ({
          widgets: [...state.widgets, newWidget],
          isAddingWidget: false,
        }));
      },

      removeWidget: (widgetId) => {
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== widgetId),
        }));
      },

      updateWidget: (widgetId, updates) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === widgetId ? { ...w, ...updates } : w,
          ),
        }));
      },

      updateWidgetData: (widgetId, data, error) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === widgetId
              ? {
                  ...w,
                  data,
                  error: error || undefined,
                  lastUpdated: new Date(),
                  loading: false,
                }
              : w,
          ),
        }));
      },

      setIsAddingWidget: (isAdding) => {
        set({ isAddingWidget: isAdding });
      },

      setEditingWidget: (widget) => {
        set({ editingWidget: widget });
      },

      updateWidgetLayout: (widgetId, layout) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === widgetId ? { ...w, position: layout } : w,
          ),
        }));
      },

      findNextAvailablePosition: (width, height) => {
        const state = get();
        return findNextPosition(state.widgets, width, height);
      },
    }),
    {
      name: "finance-dashboard",
      partialize: (state) => ({
        widgets: state.widgets,
      }),
    },
  ),
);
