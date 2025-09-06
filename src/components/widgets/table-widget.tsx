'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Settings, Trash2, Clock, Search, ArrowUpDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useWidget } from '@/hooks';
import { DataMapper } from '@/lib/data-mapper';
import { WidgetData } from '@/types';

interface TableWidgetProps {
  widget: WidgetData;
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export function TableWidget({ widget, onRefresh, onEdit, onDelete }: TableWidgetProps) {
  const { isLoading, error, data } = useWidget(widget.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const formatLastUpdated = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const tableData = useMemo(() => {
    if (!data) return [];

    // Extract array data from the response
    let arrayData: any[] = [];

    // Try to find array data in common locations
    if (Array.isArray(data)) {
      arrayData = data;
    } else if (data.data && Array.isArray(data.data)) {
      arrayData = data.data;
    } else if (data.results && Array.isArray(data.results)) {
      arrayData = data.results;
    } else {
      // If no array found, create a single row from the data
      arrayData = [data];
    }

    // Filter data based on search query
    let filteredData = arrayData;
    if (searchQuery.trim()) {
      filteredData = arrayData.filter((item) => {
        return widget.config.selectedFields.some((fieldPath) => {
          const value = DataMapper.getValueByPath(item, fieldPath);
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }

    // Sort data
    if (sortConfig) {
      filteredData = [...filteredData].sort((a, b) => {
        const aValue = DataMapper.getValueByPath(a, sortConfig.key);
        const bValue = DataMapper.getValueByPath(b, sortConfig.key);

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, searchQuery, sortConfig, widget.config.selectedFields]);

  const handleSort = (fieldPath: string) => {
    setSortConfig((prev) => {
      if (prev?.key === fieldPath) {
        return {
          key: fieldPath,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return {
        key: fieldPath,
        direction: 'asc',
      };
    });
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
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search table..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600"
                />
              </div>
              <div className="text-sm text-slate-400 whitespace-nowrap">
                {tableData.length} of{' '}
                {data ? (Array.isArray(data) ? data.length : data.data?.length || 1) : 0} items
              </div>
            </div>

            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      {widget.config.selectedFields.map((fieldPath) => {
                        const field = widget.config.fields.find((f) => f.path === fieldPath);
                        if (!field) return null;

                        return (
                          <TableHead key={fieldPath} className="text-slate-300 min-w-[120px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSort(fieldPath)}
                              className="h-auto p-0 font-medium hover:bg-transparent w-full justify-start"
                            >
                              <span className="truncate">{field.label}</span>
                              <ArrowUpDown className="ml-2 h-3 w-3 flex-shrink-0" />
                            </Button>
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={index} className="border-slate-700 hover:bg-slate-700/50">
                        {widget.config.selectedFields.map((fieldPath) => {
                          const value = DataMapper.getValueByPath(row, fieldPath);
                          return (
                            <TableCell key={fieldPath} className="text-slate-200 min-w-[120px]">
                              <div className="truncate" title={String(value)}>
                                {DataMapper.formatValue(value, 'string')}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
