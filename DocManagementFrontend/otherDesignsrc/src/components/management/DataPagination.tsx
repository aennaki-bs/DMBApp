import React from "react";
import SmartPagination from "@/components/shared/SmartPagination";
import { cn } from "@/lib/utils";

interface DataPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  isVisible?: boolean;
}

export function DataPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 25, 50, 100],
  className,
  isVisible = true,
}: DataPaginationProps) {
  if (!isVisible || totalPages <= 1) return null;

  return (
    <div className={cn("flex-shrink-0 mt-3", className)}>
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}

export default DataPagination;
