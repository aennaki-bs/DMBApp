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
  pageSizeOptions?: number[];
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
  pageSizeOptions = [10, 25, 50, 100],
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

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const visiblePages = getVisiblePages();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-blue-50 dark:bg-gradient-to-r dark:from-[#1a2332] dark:to-[#1e2a4a] rounded-lg border border-blue-200 dark:border-blue-900/30 ${className}`}
    >
      {/* Left section: Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-blue-800 dark:text-blue-300 whitespace-nowrap">
          Show
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[70px] h-8 bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-800/40 shadow-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#22306e] text-blue-900 dark:text-blue-100 border border-blue-300 dark:border-blue-900/40">
            {pageSizeOptions.map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="hover:bg-blue-100 dark:hover:bg-blue-800/40 focus:bg-blue-100 dark:focus:bg-blue-800/40"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-blue-800 dark:text-blue-300 whitespace-nowrap">
          entries
        </span>
      </div>

      {/* Center section: Entry count display */}
      <div className="text-sm text-blue-800 dark:text-blue-300 font-medium bg-blue-100 dark:bg-blue-900/20 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-900/30">
        {totalItems > 0 ? (
          <>
            Showing{" "}
            <span className="text-blue-900 dark:text-blue-100 font-semibold">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="text-blue-900 dark:text-blue-100 font-semibold">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="text-blue-900 dark:text-blue-100 font-semibold">
              {totalItems}
            </span>{" "}
            entries
          </>
        ) : (
          <span className="text-blue-600 dark:text-blue-400">
            No entries found
          </span>
        )}
      </div>

      {/* Right section: Page navigation */}
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
