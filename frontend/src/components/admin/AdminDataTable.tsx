import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, Plus, ArrowUpDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: any) => React.ReactNode;
}

interface AdminDataTableProps {
  columns: Column[];
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearch: (query: string) => void;
  onSort: (key: string) => void;
  onAdd: () => void;
  title: string;
}

export default function AdminDataTable({
  columns,
  data,
  pagination,
  isLoading,
  onPageChange,
  onSearch,
  onSort,
  onAdd,
  title
}: AdminDataTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
        <Search className="h-4 w-4 text-gray-500 ml-2" />
        <Input 
          placeholder="Search..." 
          value={searchQuery}
          onChange={handleSearch}
          className="border-0 focus-visible:ring-0 bg-transparent"
        />
      </div>

      <Card>
        <CardContent className="p-0">
            {isLoading ? (
                <div className="p-12 text-center text-gray-500">Loading data...</div>
            ) : data.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No records found.</div>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead 
                                        key={col.key} 
                                        className={col.sortable ? "cursor-pointer select-none" : ""}
                                        onClick={() => col.sortable && onSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            {col.sortable && <ArrowUpDown className="h-3 w-3" />}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row) => (
                                <TableRow key={row._id}>
                                    {columns.map((col) => (
                                        <TableCell key={`${row._id}-${col.key}`}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {!isLoading && data.length > 0 && (
          <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex items-center gap-2">
                  <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onPageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                  >
                      <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                      Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onPageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                  >
                      <ChevronRight className="h-4 w-4" />
                  </Button>
              </div>
          </div>
      )}
    </div>
  );
}
