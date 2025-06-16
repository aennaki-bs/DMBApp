import { useState, useEffect } from "react";
import { useDocumentsData } from "./hooks/useDocumentsData";
import DocumentsHeader from "./components/DocumentsHeader";
import DocumentsTable from "./components/DocumentsTable";
import DocumentsEmptyState from "./components/DocumentsEmptyState";
import SelectedDocumentsBar from "./components/SelectedDocumentsBar";
import DeleteConfirmDialog from "./components/DeleteConfirmDialog";
import { Document } from "@/models/document";

import { toast } from "sonner";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import {
  FileText,
  Plus,
  GitBranch,
  Trash2,
  AlertCircle,
  Filter,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AnimatePresence, motion } from "framer-motion";
import { BulkActionsBar } from "@/components/shared/BulkActionsBar";
import CreateDocumentWizard from "@/components/create-document/CreateDocumentWizard";
import { useDocumentsFilter } from "./hooks/useDocumentsFilter";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import {
  DEFAULT_STATUS_FILTERS,
  DEFAULT_TYPE_FILTERS,
  DEFAULT_DOCUMENT_SEARCH_FIELDS,
} from "@/components/table";

const DocumentsPage = () => {
  const { t, tWithParams } = useTranslation();
  const { user } = useAuth();
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

  const {
    documents,
    filteredItems,
    isLoading,
    fetchDocuments,
    deleteDocument,
    deleteMultipleDocuments,
    useFakeData,
    sortConfig,
    setSortConfig,
    requestSort,
  } = useDocumentsData();

  // Get filter state to check if filters are applied
  const {
    searchQuery,
    setSearchQuery,
    activeFilters,
    applyFilters,
    resetFilters,
  } = useDocumentsFilter();

  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<number | null>(null);
  const [assignCircuitDialogOpen, setAssignCircuitDialogOpen] = useState(false);
  const [documentToAssign, setDocumentToAssign] = useState<Document | null>(
    null
  );
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Filter state
  const [searchField, setSearchField] = useState(
    activeFilters.searchField || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    activeFilters.statusFilter || "any"
  );
  const [typeFilter, setTypeFilter] = useState(
    activeFilters.typeFilter || "any"
  );
  const [filterOpen, setFilterOpen] = useState(false);

  // Use pagination hook for better pagination management
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedDocuments,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredItems,
    initialPageSize: 10,
  });

  // Check if any filters are applied
  const hasActiveFilters =
    activeFilters.searchQuery !== "" ||
    activeFilters.statusFilter !== "any" ||
    activeFilters.typeFilter !== "any" ||
    activeFilters.dateRange !== undefined;

  // Update local state when activeFilters change
  useEffect(() => {
    setSearchField(activeFilters.searchField || "all");
    setStatusFilter(activeFilters.statusFilter || "any");
    setTypeFilter(activeFilters.typeFilter || "any");
  }, [activeFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters({
      ...activeFilters,
      searchQuery: query,
      searchField,
    });
  };

  const handleSearchFieldChange = (field: string) => {
    setSearchField(field);
    applyFilters({
      ...activeFilters,
      searchField: field,
    });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters({
      ...activeFilters,
      statusFilter: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    applyFilters({
      ...activeFilters,
      typeFilter: value,
    });
  };

  const clearAllFilters = () => {
    setStatusFilter("any");
    setTypeFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
    resetFilters();
  };

  const handleSelectDocument = (documentId: number) => {
    setSelectedDocuments((prev) => {
      if (prev.includes(documentId)) {
        return prev.filter((id) => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === paginatedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(paginatedDocuments.map((doc) => doc.id));
    }
  };

  const openDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  const openDeleteSingleDialog = (documentId: number) => {
    setDocumentToDelete(documentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (documentToDelete !== null) {
        // Single document delete
        await deleteDocument(documentToDelete);
        toast.success(t("documents.documentDeleted"));
      } else if (selectedDocuments.length > 0) {
        // Multiple documents delete with improved error handling
        try {
          const results = await deleteMultipleDocuments(selectedDocuments);

          // All deletions were successful
          if (results.successful.length === selectedDocuments.length) {
            toast.success(
              tWithParams("documents.documentsDeleted", {
                count: results.successful.length,
              })
            );
          }
        } catch (error: any) {
          // Handle partial success/failure
          if (error.results) {
            const { successful, failed } = error.results;

            if (successful.length > 0 && failed.length > 0) {
              // Partial success
              toast.success(
                tWithParams("documents.documentsDeleted", {
                  count: successful.length,
                })
              );
              toast.error(`Failed to delete ${failed.length} documents`);
            } else if (successful.length === 0) {
              // Complete failure
              toast.error(`Failed to delete all ${failed.length} documents`);
            }
          } else {
            // Generic error
            toast.error(t("documents.failedToDelete"));
          }

          // Don't return early - we still want to clean up the UI state
        }
      }

      // Clean up UI state regardless of success/failure
      setSelectedDocuments([]);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);

      // Fetch documents to refresh the list (this will show what was actually deleted)
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document(s):", error);
      toast.error(t("documents.failedToDelete"));

      // Still clean up UI state on error
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const openAssignCircuitDialog = (document: Document) => {
    setDocumentToAssign(document);
    setAssignCircuitDialogOpen(true);
  };

  const handleAssignCircuitSuccess = () => {
    setAssignCircuitDialogOpen(false);
    setDocumentToAssign(null);
    fetchDocuments();
    toast.success(t("documents.circuitAssignedSuccess"));
  };

  // Page actions for the header
  const pageActions = [
    ...(canManageDocuments
      ? [
          {
            label: "Export Documents",
            variant: "outline" as const,
            icon: FileText,
            onClick: () => {
              // Export functionality - placeholder
              toast.info("Export functionality coming soon");
            },
          },
          {
            label: t("documents.newDocument"),
            variant: "default" as const,
            icon: Plus,
            onClick: () => setCreateModalOpen(true),
          },
        ]
      : []),
  ];

  return (
    <PageLayout
      title={t("documents.title")}
      subtitle={t("documents.subtitle")}
      icon={FileText}
      actions={pageActions}
    >
      <div
        className="h-full flex flex-col gap-5 w-full px-1"
        style={{ minHeight: "100%" }}
      >
        {/* Compact Search + Filter Bar */}
        <div className="p-4 rounded-xl table-glass-container shadow-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* Search and field select */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <Select
                  value={searchField}
                  onValueChange={handleSearchFieldChange}
                >
                  <SelectTrigger className="w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                    <SelectValue>
                      {DEFAULT_DOCUMENT_SEARCH_FIELDS.find(
                        (opt) => opt.id === searchField
                      )?.label || "All Fields"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="table-search-select rounded-lg shadow-xl">
                    {DEFAULT_DOCUMENT_SEARCH_FIELDS.map((opt) => (
                      <SelectItem
                        key={opt.id}
                        value={String(opt.id)}
                        className="text-xs hover:table-search-select focus:table-search-select rounded-md"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 group min-w-[200px]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
                <Input
                  placeholder={t("documents.searchDocuments")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
                  <Search className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Filter popover */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-sm table-search-select hover:table-search-select shadow-sm rounded-md flex items-center gap-2 transition-all duration-200 hover:shadow-md whitespace-nowrap"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filter
                    {(statusFilter !== "any" || typeFilter !== "any") && (
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 table-search-select rounded-lg shadow-xl p-4">
                  <div className="mb-3 table-search-text font-semibold text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4 table-search-icon" />
                    Filter Documents
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* Status Filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        Status
                      </span>
                      <Select
                        value={statusFilter}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                          <SelectValue>
                            {
                              DEFAULT_STATUS_FILTERS.find(
                                (opt) => opt.value === statusFilter
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="table-search-select">
                          {DEFAULT_STATUS_FILTERS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs hover:table-search-select"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Type Filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        Document Type
                      </span>
                      <Select
                        value={typeFilter}
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                          <SelectValue>
                            {
                              DEFAULT_TYPE_FILTERS.find(
                                (opt) => opt.value === typeFilter
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="table-search-select">
                          {DEFAULT_TYPE_FILTERS.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs hover:table-search-select"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    {(statusFilter !== "any" || typeFilter !== "any") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
                        onClick={clearAllFilters}
                      >
                        <X className="h-3 w-3" /> Clear All
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Selected Documents Bar */}
        <AnimatePresence>
          {selectedDocuments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <BulkActionsBar
                selectedCount={selectedDocuments.length}
                entityName="document"
                icon={<FileText className="h-4 w-4 text-primary" />}
                actions={[
                  ...(selectedDocuments.length === 1 && canManageDocuments
                    ? [
                        {
                          id: "assign-circuit",
                          label: t("documents.assignCircuit"),
                          icon: <GitBranch className="h-4 w-4" />,
                          onClick: () =>
                            openAssignCircuitDialog(
                              documents.find(
                                (d) => d.id === selectedDocuments[0]
                              )!
                            ),
                          variant: "outline" as const,
                        },
                      ]
                    : []),
                  {
                    id: "delete",
                    label: "Delete Selected",
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: openDeleteDialog,
                    variant: "destructive",
                  },
                ]}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 min-h-0">
          <div
            className="h-full flex flex-col gap-3"
            style={{ minHeight: "100%" }}
          >
            <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
              {isLoading ? (
                <div className="table-glass-loading">
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                    <p className="table-glass-loading-text">
                      {t("common.loading")}
                    </p>
                  </div>
                </div>
              ) : filteredItems.length === 0 ? (
                <DocumentsEmptyState
                  canManageDocuments={canManageDocuments}
                  onDocumentCreated={fetchDocuments}
                  hasFilters={hasActiveFilters}
                  onClearFilters={resetFilters}
                />
              ) : (
                <div className="relative h-full flex flex-col z-10">
                  <DocumentsTable
                    documents={paginatedDocuments}
                    selectedDocuments={selectedDocuments}
                    canManageDocuments={canManageDocuments}
                    handleSelectDocument={handleSelectDocument}
                    handleSelectAll={handleSelectAll}
                    openDeleteDialog={openDeleteSingleDialog}
                    openAssignCircuitDialog={openAssignCircuitDialog}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    page={currentPage}
                    pageSize={pageSize}
                  />
                </div>
              )}
            </div>

            {/* Smart Pagination - Always show when there are documents */}
            {filteredItems.length > 0 && (
              <div className="table-glass-pagination p-4 rounded-2xl">
                <SmartPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  pageSizeOptions={[5, 10, 15, 25, 50]}
                  showFirstLast={true}
                  maxVisiblePages={5}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        count={documentToDelete ? 1 : selectedDocuments.length}
      />

      {/* Assign Circuit Dialog */}
      {documentToAssign && (
        <AssignCircuitDialog
          open={assignCircuitDialogOpen}
          onOpenChange={setAssignCircuitDialogOpen}
          documentId={documentToAssign.id}
          documentTitle={documentToAssign.title}
          documentTypeId={documentToAssign.typeId}
          onSuccess={handleAssignCircuitSuccess}
        />
      )}

      {/* Create Document Wizard */}
      <CreateDocumentWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={fetchDocuments}
      />
    </PageLayout>
  );
};

export default DocumentsPage;
