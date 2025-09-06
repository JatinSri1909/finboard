import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WidgetData, WidgetConfig, WidgetField } from '@/types';

interface WidgetStore {
  widgets: WidgetData[];
  activeWidgetId: string | null;
  isAddingWidget: boolean;
  isEditingWidget: string | null;
  
  // Actions
  addWidget: (config: WidgetConfig) => void;
  updateWidget: (id: string, config: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  setActiveWidget: (id: string | null) => void;
  setIsAddingWidget: (isAdding: boolean) => void;
  setIsEditingWidget: (id: string | null) => void;
  updateWidgetData: (id: string, data: any, error?: string) => void;
  setWidgetLoading: (id: string, isLoading: boolean) => void;
  reorderWidgets: (widgets: WidgetData[]) => void;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      activeWidgetId: null,
      isAddingWidget: false,
      isEditingWidget: null,

      addWidget: (config: WidgetConfig) => {
        const newWidget: WidgetData = {
          id: config.id,
          config,
          data: null,
          lastUpdated: new Date().toISOString(),
          isLoading: false,
          error: null,
        };

        set((state) => ({
          widgets: [...state.widgets, newWidget],
        }));
      },

      updateWidget: (id: string, config: Partial<WidgetConfig>) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id
              ? {
                  ...widget,
                  config: { ...widget.config, ...config, updatedAt: new Date().toISOString() },
                }
              : widget
          ),
        }));
      },

      removeWidget: (id: string) => {
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
          activeWidgetId: state.activeWidgetId === id ? null : state.activeWidgetId,
        }));
      },

      setActiveWidget: (id: string | null) => {
        set({ activeWidgetId: id });
      },

      setIsAddingWidget: (isAdding: boolean) => {
        set({ isAddingWidget: isAdding });
      },

      setIsEditingWidget: (id: string | null) => {
        set({ isEditingWidget: id });
      },

      updateWidgetData: (id: string, data: any, error?: string) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id
              ? {
                  ...widget,
                  data,
                  error: error || null,
                  lastUpdated: new Date().toISOString(),
                  isLoading: false,
                }
              : widget
          ),
        }));
      },

      setWidgetLoading: (id: string, isLoading: boolean) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, isLoading } : widget
          ),
        }));
      },

      reorderWidgets: (widgets: WidgetData[]) => {
        set({ widgets });
      },
    }),
    {
      name: 'widget-store',
      partialize: (state) => ({ widgets: state.widgets }),
    }
  )
);
