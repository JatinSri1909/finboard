import { useCallback, useEffect, useRef } from 'react';
import { useWidgetStore } from '@/store';
import { useApi } from './use-api';
import { WidgetConfig } from '@/types';

export function useWidget(widgetId: string) {
  const { widgets, updateWidgetData, setWidgetLoading } = useWidgetStore();
  const { fetchData } = useApi();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const widget = widgets.find(w => w.id === widgetId);

  const fetchWidgetData = useCallback(async () => {
    if (!widget) return;

    setWidgetLoading(widgetId, true);
    
    try {
      const response = await fetchData(widget.config.apiUrl);
      updateWidgetData(widgetId, response.data);
    } catch (error) {
      updateWidgetData(widgetId, null, error instanceof Error ? error.message : 'Failed to fetch data');
    }
  }, [widget, widgetId, fetchData, updateWidgetData, setWidgetLoading]);

  const startAutoRefresh = useCallback(() => {
    if (!widget || intervalRef.current) return;

    const interval = widget.config.refreshInterval * 1000; // Convert to milliseconds
    
    intervalRef.current = setInterval(() => {
      fetchWidgetData();
    }, interval);
  }, [widget, fetchWidgetData]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refreshWidget = useCallback(() => {
    fetchWidgetData();
  }, [fetchWidgetData]);

  // Auto-refresh effect
  useEffect(() => {
    if (widget && widget.config.refreshInterval > 0) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [widget?.config.refreshInterval, startAutoRefresh, stopAutoRefresh]);

  // Initial data fetch
  useEffect(() => {
    if (widget && !widget.data && !widget.isLoading) {
      fetchWidgetData();
    }
  }, [widget, fetchWidgetData]);

  return {
    widget,
    fetchWidgetData,
    refreshWidget,
    startAutoRefresh,
    stopAutoRefresh,
    isLoading: widget?.isLoading || false,
    error: widget?.error || null,
    data: widget?.data || null,
  };
}
