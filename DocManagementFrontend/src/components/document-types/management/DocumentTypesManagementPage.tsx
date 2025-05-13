import { useState } from "react";
import { useDocumentTypes } from "@/hooks/useDocumentTypes";
import DocumentTypesHeaderSection from "./DocumentTypesHeaderSection";
import DocumentTypesContent from "./DocumentTypesContent";
import DocumentTypeDrawer from "./DocumentTypeDrawer";
import DeleteConfirmDialog from "@/components/document-types/DeleteConfirmDialog";
import BottomActionBar from "@/components/document-types/BottomActionBar";
import DocumentTypeFilters from "@/components/document-types/DocumentTypeFilters";
import { DocumentType } from "@/models/document";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import { FilterContent } from "@/components/shared/FilterContent";
import { FilterBadges, FilterBadge } from "@/components/shared/FilterBadges";
import { Tag } from "lucide-react";

const DocumentTypesManagementPage = () => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentType, setCurrentType] = useState<DocumentType | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [attributeFilter, setAttributeFilter] = useState("any");

  const {
    types,
    isLoading,
    selectedTypes,
    handleSelectType,
    handleSelectAll,
    fetchTypes,
    searchQuery,
    setSearchQuery,
    // We still have access to all other properties from useDocumentTypes
    // but we're only explicitly listing the ones we use in this component
    ...documentTypesProps
  } = useDocumentTypes();

  const openDeleteDialog = (id: number) => {
    setTypeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (typeToDelete) {
        await documentService.deleteDocumentType(typeToDelete);
        toast.success("Document type deleted successfully");
        fetchTypes();
      }
    } catch (error) {
      console.error("Failed to delete document type:", error);
      toast.error("Failed to delete document type");
    } finally {
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };

  const handleEditType = (type: DocumentType) => {
    setCurrentType(type);
    setIsEditMode(true);
    setIsDrawerOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      await documentService.deleteMultipleDocumentTypes(selectedTypes);
      toast.success(
        `Successfully deleted ${selectedTypes.length} document types`
      );
      fetchTypes();
    } catch (error) {
      console.error("Failed to delete document types in bulk:", error);
      toast.error("Failed to delete some or all document types");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentType(null);
    setIsEditMode(false);
  };

  const handleViewModeChange = (value: "table" | "grid") => {
    if (value) setViewMode(value);
  };

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (filters: any) => {
    setAppliedFilters(filters);
    setAttributeFilter(filters.attributes || "any");
    // The actual filtering logic would be implemented in the useDocumentTypes hook
  };

  // Clear all filters
  const clearAllFilters = () => {
    setAttributeFilter("any");
    setAppliedFilters({});
    setShowFilters(false);
  };

  // Create filter badges
  const filterBadges: FilterBadge[] = [];

  if (attributeFilter !== "any") {
    filterBadges.push({
      id: "attribute",
      label: "Attributes",
      value:
        attributeFilter === "with" ? "With Attributes" : "Without Attributes",
      icon: <Tag className="h-3.5 w-3.5" />,
      onRemove: () => {
        setAttributeFilter("any");
        setAppliedFilters({ ...appliedFilters, attributes: "any" });
      },
    });
  }

  return (
    <div className="space-y-2 p-6 bg-[#070b28]">
      <DocumentTypesHeaderSection
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onNewTypeClick={() => setIsDrawerOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={showFilters}
        onToggleFilters={handleToggleFilters}
      />

      {showFilters && (
        <div className="px-6 pb-2">
          <FilterContent
            title="Filter Document Types"
            onClearAll={clearAllFilters}
            onApply={() => {
              setShowFilters(false);
              handleFilterChange(appliedFilters);
            }}
          >
            <DocumentTypeFilters
              onFilterChange={handleFilterChange}
              onClose={() => setShowFilters(false)}
              initialFilters={appliedFilters}
            />
          </FilterContent>
        </div>
      )}

      {filterBadges.length > 0 && (
        <div className="px-6 pb-1">
          <FilterBadges badges={filterBadges} />
        </div>
      )}

      <DocumentTypesContent
        isLoading={isLoading}
        types={types}
        viewMode={viewMode}
        selectedTypes={selectedTypes}
        onDeleteType={openDeleteDialog}
        onEditType={handleEditType}
        onSelectType={handleSelectType}
        onSelectAll={handleSelectAll}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        {...documentTypesProps}
      />

      <DocumentTypeDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        documentType={currentType}
        isEditMode={isEditMode}
        onSuccess={() => {
          handleCloseDrawer();
          fetchTypes();
          toast.success(
            isEditMode
              ? "Document type updated successfully"
              : "Document type created successfully"
          );
        }}
        onCancel={handleCloseDrawer}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        onConfirm={handleBulkDelete}
        isBulk={true}
        count={selectedTypes.length}
      />

      <BottomActionBar
        selectedCount={selectedTypes.length}
        onBulkDelete={() => setBulkDeleteDialogOpen(true)}
      />
    </div>
  );
};

export default DocumentTypesManagementPage;
