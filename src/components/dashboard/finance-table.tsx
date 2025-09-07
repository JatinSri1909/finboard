import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface FinanceTableProps {
  data: any;
  config: {
    maxRows?: number;
    displayFields?: string[];
    showSearch?: boolean;
    showFilters?: boolean;
    watchlistSymbols?: string[];
    cardStyle?: 'single' | 'list' | 'grid';
  };
}

export const FinanceTable = ({ data, config }: FinanceTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const maxRows = config.maxRows || 10;

  // Extract table data from various API response formats
  const extractTableData = (data: any): any[] => {
    // Handle Alpha Vantage TOP_GAINERS_LOSERS format
    if (data.top_gainers) return data.top_gainers;
    if (data.most_actively_traded) return data.most_actively_traded;

    // Handle array data
    if (Array.isArray(data)) return data;

    // Handle object with array properties
    const arrayFields = Object.values(data).find((value) => Array.isArray(value));
    if (arrayFields) return arrayFields as any[];

    // Convert single object to array
    if (typeof data === 'object' && data !== null) {
      return [data];
    }

    return [];
  };

  const tableData = extractTableData(data);

  if (!tableData.length) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No table data available
      </div>
    );
  }

  // Get column headers from first row
  const headers = Object.keys(tableData[0]);
  const displayHeaders = config.displayFields?.length
    ? headers.filter((header) => config.displayFields!.includes(header))
    : headers;

  // Filter data based on search term
  const filteredData = tableData.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / maxRows);
  const startIndex = (currentPage - 1) * maxRows;
  const paginatedData = filteredData.slice(startIndex, startIndex + maxRows);

  const formatCellValue = (value: any, header: string) => {
    if (typeof value === 'number') {
      if (header.includes('price') || header.includes('change_amount')) {
        return `$${value.toFixed(2)}`;
      }
      if (header.includes('change_percentage')) {
        const numValue = parseFloat(String(value).replace('%', ''));
        return (
          <Badge variant={numValue >= 0 ? 'default' : 'destructive'} className="text-xs">
            {numValue >= 0 ? '+' : ''}
            {numValue.toFixed(2)}%
          </Badge>
        );
      }
      return value.toLocaleString();
    }

    if (typeof value === 'string' && value.includes('%')) {
      const numValue = parseFloat(value.replace('%', ''));
      return (
        <Badge variant={numValue >= 0 ? 'default' : 'destructive'} className="text-xs">
          {value}
        </Badge>
      );
    }

    return String(value);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {config.showSearch !== false && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-widget-border text-foreground"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-widget-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-widget-border hover:bg-widget-hover">
              {displayHeaders.map((header) => (
                <TableHead key={header} className="text-foreground font-medium">
                  {header.replace(/[_-]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow key={index} className="border-widget-border hover:bg-widget-hover">
                {displayHeaders.map((header) => (
                  <TableCell key={header} className="text-foreground">
                    {formatCellValue(row[header], header)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + maxRows, filteredData.length)} of{' '}
            {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-widget-border hover:bg-widget-hover"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-foreground">
              {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-widget-border hover:bg-widget-hover"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
