import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Widget {
  id: string;
  name: string;
  type: 'card' | 'table' | 'chart';
  apiUrl: string;
  refreshInterval: number;
  config: {
    displayFields?: string[];
    chartType?: 'line' | 'candlestick';
    timeInterval?: 'daily' | 'weekly' | 'monthly';
    maxRows?: number;
    symbol?: string;
    exchange?: string;
    watchlistSymbols?: string[];
    showSearch?: boolean;
    showFilters?: boolean;
    cardStyle?: 'single' | 'list' | 'grid';
  };
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  data?: any;
  lastUpdated?: Date;
  loading?: boolean;
  error?: string;
}

interface DashboardState {
  widgets: Widget[];
  isAddingWidget: boolean;
  editingWidget: Widget | null;
  
  // Actions
  addWidget: (widget: Omit<Widget, 'id'>) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  updateWidgetData: (widgetId: string, data: any, error?: string) => void;
  setIsAddingWidget: (isAdding: boolean) => void;
  setEditingWidget: (widget: Widget | null) => void;
  updateWidgetLayout: (widgetId: string, layout: Widget['position']) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      isAddingWidget: false,
      editingWidget: null,

      addWidget: (widget) => {
        const newWidget: Widget = {
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            w.id === widgetId ? { ...w, ...updates } : w
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
                  error,
                  lastUpdated: new Date(),
                  loading: false,
                }
              : w
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
            w.id === widgetId ? { ...w, position: layout } : w
          ),
        }));
      },
    }),
    {
      name: 'finance-dashboard',
      partialize: (state) => ({
        widgets: state.widgets,
      }),
    }
  )
);