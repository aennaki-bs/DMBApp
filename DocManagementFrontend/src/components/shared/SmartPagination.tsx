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
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 pagination-container rounded-lg shadow-md ${className}`}
    >
      {/* Left section: Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs pagination-text font-medium whitespace-nowrap">
          Show
        </span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[60px] h-7 text-xs pagination-button focus:ring-1 transition-all duration-200 shadow-sm rounded-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="pagination-button rounded-lg shadow-xl">
            {pageSizeOptions.map((size) => (
              <SelectItem
                key={size}
                value={size.toString()}
                className="text-xs hover:pagination-button focus:pagination-button rounded-md"
              >
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs pagination-text font-medium whitespace-nowrap">
          entries
        </span>
      </div>

      {/* Center section: Entry count display */}
      <div className="text-xs pagination-info font-medium px-2 py-1 rounded-md">
        {totalItems > 0 ? (
          <>
            Showing{" "}
            <span className="pagination-info-accent font-semibold">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="pagination-info-accent font-semibold">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="pagination-info-accent font-semibold">
              {totalItems}
            </span>{" "}
            entries
          </>
        ) : (
          <span className="pagination-info">No entries found</span>
        )}
      </div>

      {/* Right section: Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center gap-0.5">
          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-7 w-7 p-0 text-xs pagination-button disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              title="First page"
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-7 w-7 p-0 text-xs pagination-button disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Previous page"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          {visiblePages.map((page, index) => {
            if (page === "ellipsis") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="h-7 w-7 flex items-center justify-center pagination-text"
                >
                  <MoreHorizontal className="h-3 w-3" />
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
                    ? "h-7 min-w-[28px] px-1.5 text-xs pagination-button-active shadow-md font-semibold"
                    : "h-7 min-w-[28px] px-1.5 text-xs pagination-button transition-all duration-200 shadow-sm"
                }
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
            className="h-7 w-7 p-0 text-xs pagination-button disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title="Next page"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>

          {showFirstLast && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-7 w-7 p-0 text-xs pagination-button disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              title="Last page"
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartPagination;
