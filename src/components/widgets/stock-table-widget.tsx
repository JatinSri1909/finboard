'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
} from 'lucide-react';

interface StockTableWidgetProps {
  data: any[];
  config: {
    pageSize: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    showFilters: boolean;
    columns: string[];
  };
}

export function StockTableWidget({ data = [], config }: StockTableWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState(config.sortBy);
  const [sortOrder, setSortOrder] = useState(config.sortOrder);

  const safeData = data || [];

  const filteredAndSortedData = useMemo(() => {
    const filtered = safeData.filter(
      (stock) =>
        stock?.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const multiplier = sortOrder === 'asc' ? 1 : -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * multiplier;
      }
      return String(aVal).localeCompare(String(bVal)) * multiplier;
    });

    return filtered;
  }, [safeData, searchQuery, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedData.length / config.pageSize);
  const startIndex = (currentPage - 1) * config.pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + config.pageSize);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  if (safeData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Search className="h-8 w-8 mx-auto mb-2" />
        <p>No stock data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {config.showFilters && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.includes('symbol') && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('symbol')}
                    className="h-auto p-0 font-medium"
                  >
                    Symbol
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              )}
              {config.columns.includes('name') && (
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium"
                  >
                    Name
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              )}
              {config.columns.includes('price') && (
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('price')}
                    className="h-auto p-0 font-medium"
                  >
                    Price
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              )}
              {config.columns.includes('change') && (
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('change')}
                    className="h-auto p-0 font-medium"
                  >
                    Change
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              )}
              {config.columns.includes('changePercent') && (
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('changePercent')}
                    className="h-auto p-0 font-medium"
                  >
                    Change %
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              )}
              {config.columns.includes('volume') && (
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('volume')}
                    className="h-auto p-0 font-medium"
                  >
                    Volume
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((stock, index) => (
              <TableRow key={index}>
                {config.columns.includes('symbol') && (
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                )}
                {config.columns.includes('name') && (
                  <TableCell>
                    <div className="max-w-[200px] truncate">{stock.name}</div>
                  </TableCell>
                )}
                {config.columns.includes('price') && (
                  <TableCell className="text-right font-medium">
                    ${stock.price?.toFixed(2)}
                  </TableCell>
                )}
                {config.columns.includes('change') && (
                  <TableCell className="text-right">
                    <div
                      className={`flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {stock.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      ${Math.abs(stock.change).toFixed(2)}
                    </div>
                  </TableCell>
                )}
                {config.columns.includes('changePercent') && (
                  <TableCell className="text-right">
                    <Badge
                      variant={stock.changePercent >= 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent?.toFixed(2)}%
                    </Badge>
                  </TableCell>
                )}
                {config.columns.includes('volume') && (
                  <TableCell className="text-right text-muted-foreground">
                    {stock.volume ? (stock.volume / 1000000).toFixed(1) + 'M' : 'N/A'}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to{' '}
            {Math.min(startIndex + config.pageSize, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
