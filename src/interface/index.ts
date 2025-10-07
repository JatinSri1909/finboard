export interface Widget {
  id: string;
  name: string;
  type: "card" | "table" | "chart";
  apiUrl: string;
  refreshInterval: number;
  config: {
    displayFields?: string[];
    chartType?: "line" | "candlestick";
    timeInterval?: "daily" | "weekly" | "monthly";
    maxRows?: number;
    symbol?: string;
    exchange?: string;
    watchlistSymbols?: string[];
    showSearch?: boolean;
    showFilters?: boolean;
    cardStyle?: "single" | "list" | "grid";
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

export interface DashboardState {
  widgets: Widget[];
  isAddingWidget: boolean;
  editingWidget: Widget | null;

  // Actions
  addWidget: (widget: Omit<Widget, "id">) => void;
  removeWidget: (widgetId: string) => void;
  updateWidget: (widgetId: string, updates: Partial<Widget>) => void;
  updateWidgetData: (widgetId: string, data: any, error?: string) => void;
  setIsAddingWidget: (isAdding: boolean) => void;
  setEditingWidget: (widget: Widget | null) => void;
  updateWidgetLayout: (widgetId: string, layout: Widget["position"]) => void;
  findNextAvailablePosition: (
    width: number,
    height: number,
  ) => { x: number; y: number };
}