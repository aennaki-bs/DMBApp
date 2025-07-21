import { LocationDto } from "@/models/location";
import { Table } from "@/components/ui/table";
import { LocationsTableHeader } from "./content/LocationsTableHeader";
import { LocationsTableBody } from "./content/LocationsTableBody";
import { LocationsTableEmpty } from "./LocationsTableEmpty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { Loader2, Trash2 } from "lucide-react";

interface LocationsTableContentProps {
  locations: LocationDto[] | undefined;
  allLocations?: LocationDto[] | undefined;
  selectedItems: string[]; // Array of location codes from bulk selection
  bulkSelection: any; // Using any to match ElementTypes pattern
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    handlePageChange: (page: number) => void;
    handlePageSizeChange: (size: number) => void;
  };
  onEdit: (location: LocationDto) => void;
  onView: (location: LocationDto) => void;
  onDelete: (code: string) => void;
  sortBy: string;
  sortDirection: string;
  onSort: (field: string) => void;
  onClearFilters: () => void;
  onBulkDelete?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  searchQuery?: string; // Add searchQuery prop
}

export function LocationsTableContent({
  locations,
  allLocations,
  selectedItems,
  bulkSelection,
  pagination,
  onEdit,
  onView,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
  onClearFilters,
  onBulkDelete,
  isLoading = false,
  isError = false,
  searchQuery = "", // Add searchQuery with default value
}: LocationsTableContentProps) {
  // Use pagination from props
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    handlePageChange,
    handlePageSizeChange,
  } = pagination;

  // Check if we have locations to display
  const hasLocations = locations && locations.length > 0;

  // Define bulk actions (disabled)
  const bulkActions: BulkAction[] = [
    {
      id: 'delete',
      label: 'Delete Locations (Disabled)',
      icon: <Trash2 className="h-4 w-4 opacity-50" />,
      variant: 'outline', // Use outline instead of destructive to appear disabled
      onClick: () => {
        // Disabled - no action
      },
      requiresConfirmation: false,
      shortcut: 'Del',
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading locations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-destructive/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive font-bold">!</span>
              </div>
              <p className="text-destructive">
                Failed to load locations. Please try again.
              </p>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
        {/* Subtle animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

        {hasLocations ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
              <div className="min-w-[778px]">
                <Table className="table-fixed w-full table-compact">
                  <LocationsTableHeader
                    selectedCount={bulkSelection.currentPageSelectedCount}
                    totalCount={locations?.length || 0} // Current page items count
                    onSelectAll={bulkSelection.toggleSelectCurrentPage}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 260px)" }}
            >
              <ScrollArea className="table-scroll-area h-full w-full">
                <div className="min-w-[778px] pb-4">
                  <Table className="table-fixed w-full table-compact">
                    <LocationsTableBody
                      locations={locations || []}
                      selectedItems={bulkSelection.selectedItems} // Pass keys array directly
                      onSelectLocation={(code) => {
                        const location = locations?.find(l => l.locationCode === code);
                        if (location) bulkSelection.toggleItem(location);
                      }}
                      onEdit={onEdit}
                      onView={onView}
                      onDelete={onDelete}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <LocationsTableEmpty hasSearchQuery={!!searchQuery} onClearSearch={onClearFilters} />
          </div>
        )}
      </div>

      {/* Smart Pagination with Bulk Actions */}
      {hasLocations && (
        <PaginationWithBulkActions
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          bulkSelection={bulkSelection}
          bulkActions={bulkActions}
        />
      )}
    </div>
  );
} 