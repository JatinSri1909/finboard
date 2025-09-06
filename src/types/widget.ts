export type WidgetType = 'card' | 'table' | 'chart';

export type WidgetDisplayMode = 'card' | 'table' | 'chart';

export interface WidgetField {
  path: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  sampleValue: any;
  isSelected: boolean;
}

export interface WidgetConfig {
  id: string;
  name: string;
  apiUrl: string;
  refreshInterval: number; // in seconds
  displayMode: WidgetDisplayMode;
  selectedFields: string[];
  fields: WidgetField[];
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WidgetData {
  id: string;
  config: WidgetConfig;
  data: any;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
}

export interface WidgetState {
  widgets: WidgetData[];
  activeWidgetId: string | null;
  isAddingWidget: boolean;
  isEditingWidget: string | null;
}
