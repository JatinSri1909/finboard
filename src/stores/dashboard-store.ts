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
  findNextAvailablePosition: (width: number, height: number) => { x: number; y: number };
}

// Helper function to find next available position
const findNextPosition = (
  widgets: Widget[],
  targetWidth: number,
  targetHeight: number,
  gridCols = 12
): { x: number; y: number } => {
  if (widgets.length === 0) {
    return { x: 0, y: 0 };
  }

  // Create a grid to track occupied spaces
  const maxY = Math.max(...widgets.map((w) => w.position.y + w.position.h)) + targetHeight;
  const grid: boolean[][] = Array(maxY)
    .fill(null)
    .map(() => Array(gridCols).fill(false));

  // Mark occupied positions
  widgets.forEach((widget) => {
    for (let y = widget.position.y; y < widget.position.y + widget.position.h; y++) {
      for (
        let x = widget.position.x;
        x < widget.position.x + widget.position.w && x < gridCols;
        x++
      ) {
        if (grid[y]) grid[y][x] = true;
      }
    }
  });

  // Find first available position
  for (let y = 0; y <= maxY - targetHeight; y++) {
    for (let x = 0; x <= gridCols - targetWidth; x++) {
      let canPlace = true;

      // Check if the target area is free
      for (let dy = 0; dy < targetHeight && canPlace; dy++) {
        for (let dx = 0; dx < targetWidth && canPlace; dx++) {
          if (grid[y + dy] && grid[y + dy][x + dx]) {
            canPlace = false;
          }
        }
      }

      if (canPlace) {
        return { x, y };
      }
    }
  }

  // If no space found, place at the bottom
  return { x: 0, y: maxY };
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      isAddingWidget: false,
      editingWidget: null,

      addWidget: (widget) => {
        const state = get();
        const nextPosition = findNextPosition(state.widgets, widget.position.w, widget.position.h);
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
          widgets: state.widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)),
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
          widgets: state.widgets.map((w) => (w.id === widgetId ? { ...w, position: layout } : w)),
        }));
      },

      findNextAvailablePosition: (width, height) => {
        const state = get();
        return findNextPosition(state.widgets, width, height);
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
