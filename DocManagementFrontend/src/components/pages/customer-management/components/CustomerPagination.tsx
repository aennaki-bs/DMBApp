import SmartPagination from "@/components/shared/SmartPagination";

interface VendorPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function VendorPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: VendorPaginationProps) {
  return (
    <div className="flex-shrink-0 table-glass-pagination p-3 rounded-2xl shadow-lg backdrop-blur-md border border-primary/20 bg-background/95">
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className="justify-center"
        pageSizeOptions={[10, 15, 25, 50, 100]}
        showFirstLast={true}
        maxVisiblePages={5}
      />
    </div>
  );
}
