'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, Trash2, Clock } from 'lucide-react';
import { useWidget } from '@/hooks';
import { DataMapper } from '@/lib/data-mapper';
import { WidgetData } from '@/types';

interface CardWidgetProps {
  widget: WidgetData;
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CardWidget({ widget, onRefresh, onEdit, onDelete }: CardWidgetProps) {
  const { isLoading, error, data } = useWidget(widget.id);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const renderFieldValue = (fieldPath: string) => {
    if (!data) return 'N/A';

    const value = DataMapper.getValueByPath(data, fieldPath);
    return DataMapper.formatValue(value, 'string');
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
              <span className="text-sm text-slate-400">Loading data...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {widget.config.selectedFields.map((fieldPath, index) => {
              const field = widget.config.fields.find((f) => f.path === fieldPath);
              if (!field) return null;

              return (
                <div
                  key={fieldPath}
                  className="group flex justify-between items-center p-4 bg-gradient-to-r from-slate-700/30 to-slate-600/20 rounded-xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
                    <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                      {field.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white bg-slate-800/50 px-3 py-1 rounded-lg">
                    {renderFieldValue(fieldPath)}
                  </span>
                </div>
              );
            })}

            <div className="flex items-center gap-2 text-xs text-slate-500 pt-6 border-t border-slate-700/50">
              <Clock className="h-3 w-3" />
              Last updated: {formatLastUpdated(widget.lastUpdated)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
