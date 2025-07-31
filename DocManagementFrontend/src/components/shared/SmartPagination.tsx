import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

interface SmartPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
  pageSizeOptions?: (number | "all")[];
  showFirstLast?: boolean;
  maxVisiblePages?: number;
}

const SmartPagination: React.FC<SmartPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className = "",
  pageSizeOptions = [10, 15, 25, 50, 100, "all"],
  showFirstLast = true,
  maxVisiblePages = 7,
}) => {
  // Calculate visible page numbers with smart ellipsis
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];
    const sidePages = Math.floor((maxVisiblePages - 3) / 2); // Reserve space for first, last, and ellipsis

    if (currentPage <= sidePages + 2) {
      // Show pages from start
      for (let i = 1; i <= Math.min(maxVisiblePages - 2, totalPages); i++) {
        pages.push(i);
      }
      if (totalPages > maxVisiblePages - 2) {
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    } else if (currentPage >= totalPages - sidePages - 1) {
      // Show pages from end
      pages.push(1);
      if (totalPages > maxVisiblePages - 2) {
        pages.push("ellipsis");
      }
      for (
        let i = Math.max(totalPages - maxVisiblePages + 3, 2);
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }
    } else {
      // Show pages around current
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - sidePages; i <= currentPage + sidePages; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  // Handle page size change with "all" option
  const handlePageSizeChange = (value: string) => {
    if (value === "all") {
      onPageSizeChange(totalItems);
    } else {
      onPageSizeChange(Number(value));
    }
  };

  // Get current page size value for display
  const getCurrentPageSizeValue = () => {
    if (pageSize >= totalItems) {
      return "all";
    }
    return pageSize.toString();
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-center gap-4 p-3 bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl rounded-xl border border-primary/20 shadow-lg ${className}`}
    >
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-foreground font-medium whitespace-nowrap">
          Show
        </span>
        <Select
          value={getCurrentPageSizeValue()}
          onValueChange={handlePageSizeChange}
        >
          <SelectTrigger className="w-[60px] h-8 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
            {pageSizeOptions.map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md text-sm"
              >
                {size === "all" ? "All" : size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 bg-white dark:bg-[#1e2a4a] text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50 hover:text-blue-900 dark:hover:text-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 bg-white dark:bg-[#1e2a4a] text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50 hover:text-blue-900 dark:hover:text-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {visiblePages.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="h-8 w-8 flex items-center justify-center text-blue-600 dark:text-blue-400"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }

            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={
                  page === currentPage
                    ? "h-8 min-w-[32px] px-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-blue-500 shadow-md font-semibold"
                    : "h-8 min-w-[32px] px-2 bg-white dark:bg-[#1e2a4a] text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50 hover:text-blue-900 dark:hover:text-blue-100 transition-all duration-200 shadow-sm"
                }
                title={`Page ${page}`}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 bg-white dark:bg-[#1e2a4a] text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50 hover:text-blue-900 dark:hover:text-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 bg-white dark:bg-[#1e2a4a] text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-800/50 hover:text-blue-900 dark:hover:text-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartPagination;
