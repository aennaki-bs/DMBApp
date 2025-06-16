import { useState } from "react";
import { toast } from "sonner";
import { ResponsibilityCentreTableContent } from "./table/ResponsibilityCentreTableContent";
import { BulkActionsBar } from "./table/BulkActionsBar";
import { EditResponsibilityCentreDialog } from "./EditResponsibilityCentreDialog";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { AssociateUsersDialog } from "./AssociateUsersDialog";
import { ViewCentreDetailsDialog } from "./ViewCentreDetailsDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResponsibilityCentreManagement } from "./hooks/useResponsibilityCentreManagement";
import { AlertTriangle, Filter, X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BulkDeleteDialog } from "./dialogs/BulkDeleteDialog";
import { useTranslation } from "@/hooks/useTranslation";

const DEFAULT_SEARCH_FIELDS = [
  { id: "all", label: "All fields" },
  { id: "code", label: "Code" },
  { id: "descr", label: "Description" },
];

export function ResponsibilityCentreTable() {
  const { t } = useTranslation();
  const [filterOpen, setFilterOpen] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");

  // Dialog states
  const [editingCentre, setEditingCentre] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingCentre, setDeletingCentre] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [associatingCentre, setAssociatingCentre] = useState(null);
  const [associateDialogOpen, setAssociateDialogOpen] = useState(false);
  const [viewingCentre, setViewingCentre] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const {
    centres,
    filteredCentres,
    selectedCentres,
    isLoading,
    isError,
    handleSelectCentre,
    handleSelectAll,
    handleEditCentre,
    handleDeleteCentre,
    handleBulkDelete,
    refreshCentres,
    sortBy,
    sortDirection,
    handleSort,
  } = useResponsibilityCentreManagement({
    searchQuery,
    searchField,
  });

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setFilterOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-destructive py-10 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
        {t("responsibilityCentres.errorLoading")}
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-5 w-full px-1"
      style={{ minHeight: "100%" }}
    >
      {/* Search + Filter Bar */}
      <div className="p-4 rounded-xl table-glass-container shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          {/* Search and field select */}
          <div className="flex-1 flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-[130px] h-9 text-sm hover:bg-muted/50 focus:ring-1 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                  <SelectValue>
                    {DEFAULT_SEARCH_FIELDS.find((opt) => opt.id === searchField)
                      ?.label || t("common.allFields")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-xl">
                  {DEFAULT_SEARCH_FIELDS.map((opt) => (
                    <SelectItem
                      key={opt.id}
                      value={opt.id as string}
                      className="text-xs hover:bg-muted/50 focus:bg-muted/50 rounded-md"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
              <Input
                placeholder={t("responsibilityCentres.searchCentres")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="relative h-9 text-sm pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                <Search className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center gap-2">
            {searchQuery && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-1 cursor-pointer transition-colors duration-150"
                onClick={clearAllFilters}
              >
                Search: {searchQuery}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            )}

            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8 px-2 text-xs hover:bg-muted/50 transition-all duration-200"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsibilityCentreTableContent
          centres={filteredCentres}
          selectedCentres={selectedCentres}
          onSelectAll={() => handleSelectAll(filteredCentres || [])}
          onSelectCentre={handleSelectCentre}
          onEdit={(centre) => {
            setEditingCentre(centre);
            setEditDialogOpen(true);
          }}
          onDelete={(centre) => {
            setDeletingCentre(centre);
            setDeleteDialogOpen(true);
          }}
          onAssociateUsers={(centre) => {
            setAssociatingCentre(centre);
            setAssociateDialogOpen(true);
          }}
          onViewDetails={(centre) => {
            setViewingCentre(centre);
            setViewDialogOpen(true);
          }}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {selectedCentres.length > 0 && (
        <BulkActionsBar
          selectedCount={selectedCentres.length}
          onDelete={() => setBulkDeleteDialogOpen(true)}
        />
      )}

      {/* Edit Dialog */}
      <EditResponsibilityCentreDialog
        centre={editingCentre}
        isOpen={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setEditingCentre(null);
        }}
        onSave={handleEditCentre}
      />

      {/* Delete Dialog */}
      <DeleteConfirmDialog
        centre={deletingCentre}
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingCentre(null);
        }}
        onConfirm={handleDeleteCentre}
      />

      {/* Associate Users Dialog */}
      <AssociateUsersDialog
        centre={associatingCentre}
        isOpen={associateDialogOpen}
        onClose={() => {
          setAssociateDialogOpen(false);
          setAssociatingCentre(null);
        }}
        onSuccess={refreshCentres}
      />

      {/* View Details Dialog */}
      <ViewCentreDetailsDialog
        centre={viewingCentre}
        isOpen={viewDialogOpen}
        onClose={() => {
          setViewDialogOpen(false);
          setViewingCentre(null);
        }}
      />

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        selectedCount={selectedCentres.length}
        isOpen={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={() => {
          handleBulkDelete();
          setBulkDeleteDialogOpen(false);
        }}
      />
    </div>
  );
}
