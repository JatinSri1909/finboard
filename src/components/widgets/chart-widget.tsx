'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, Trash2, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { useWidget } from '@/hooks';
import { DataMapper } from '@/lib/data-mapper';
import { WidgetData } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ChartWidgetProps {
  widget: WidgetData;
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ChartWidget({ widget, onRefresh, onEdit, onDelete }: ChartWidgetProps) {
  const { isLoading, error, data } = useWidget(widget.id);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const chartData = useMemo(() => {
    if (!data) return [];

    // Try to extract time series data
    let timeSeriesData: any[] = [];

    // Common patterns for time series data
    if (data['Time Series (Daily)']) {
      timeSeriesData = Object.entries(data['Time Series (Daily)']).map(
        ([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume']),
        })
      );
    } else if (data['Time Series (5min)']) {
      timeSeriesData = Object.entries(data['Time Series (5min)']).map(
        ([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume']),
        })
      );
    } else if (data.data && Array.isArray(data.data)) {
      // Generic array data
      timeSeriesData = data.data.map((item: any, index: number) => {
        const chartPoint: any = { index };

        widget.config.selectedFields.forEach((fieldPath) => {
          const value = DataMapper.getValueByPath(item, fieldPath);
          const field = widget.config.fields.find((f) => f.path === fieldPath);
          if (field) {
            chartPoint[field.label] = typeof value === 'number' ? value : parseFloat(value) || 0;
          }
        });

        return chartPoint;
      });
    } else if (Array.isArray(data)) {
      // Direct array data
      timeSeriesData = data.map((item: any, index: number) => {
        const chartPoint: any = { index };

        widget.config.selectedFields.forEach((fieldPath) => {
          const value = DataMapper.getValueByPath(item, fieldPath);
          const field = widget.config.fields.find((f) => f.path === fieldPath);
          if (field) {
            chartPoint[field.label] = typeof value === 'number' ? value : parseFloat(value) || 0;
          }
        });

        return chartPoint;
      });
    } else {
      // Single object data - create a single point chart
      const chartPoint: any = { index: 0 };

      widget.config.selectedFields.forEach((fieldPath) => {
        const value = DataMapper.getValueByPath(data, fieldPath);
        const field = widget.config.fields.find((f) => f.path === fieldPath);
        if (field) {
          chartPoint[field.label] = typeof value === 'number' ? value : parseFloat(value) || 0;
        }
      });

      timeSeriesData = [chartPoint];
    }

    // Sort by date if available
    if (timeSeriesData.length > 0 && timeSeriesData[0].date) {
      timeSeriesData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return timeSeriesData.slice(-50); // Show last 50 data points
  }, [data, widget.config.selectedFields, widget.config.fields]);

  const getChartColors = () => {
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];
    return widget.config.selectedFields.map((_, index) => colors[index % colors.length]);
  };

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-400">{widget.config.name}</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-sm">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50 text-white w-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-slate-600/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            {widget.config.name}
          </CardTitle>
          <span className="text-xs text-slate-400 bg-slate-700/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-600/50">
            {widget.config.refreshInterval}s
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 w-9 hover:bg-slate-700/50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-green-400' : 'text-slate-400'}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-9 w-9 hover:bg-slate-700/50 transition-colors">
            <Settings className="h-4 w-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-9 w-9 hover:bg-red-500/20 transition-colors">
            <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-400" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-green-400" />
              <span className="text-sm text-slate-400">Loading chart data...</span>
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <div className="text-center">
              <div className="text-lg mb-2 font-medium">No chart data available</div>
              <div className="text-sm">Select numeric fields to display in the chart</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey={chartData[0]?.date ? 'date' : 'index'}
                    stroke="#9CA3AF"
                    fontSize={12}
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />

                  {widget.config.selectedFields.map((fieldPath, index) => {
                    const field = widget.config.fields.find((f) => f.path === fieldPath);
                    if (!field) return null;

                    const color = getChartColors()[index];
                    return (
                      <Line
                        key={fieldPath}
                        type="monotone"
                        dataKey={field.label}
                        stroke={color}
                        strokeWidth={3}
                        dot={{ fill: color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#fff' }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <Clock className="h-3 w-3" />
              Last updated: {formatLastUpdated(widget.lastUpdated)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
