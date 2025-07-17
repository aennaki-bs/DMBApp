import { useState, useEffect } from "react";
import { notifications } from "@/utils/notificationUtils";
import approvalService from "@/services/approvalService";
import { ApproversTableContent } from "./table/ApproversTableContent";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { usePagination } from "@/hooks/usePagination";
import { Trash2, UserCheck, Settings, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useTranslation } from "@/hooks/useTranslation";
import ApproverCreateWizard from "@/components/approval/ApproverCreateWizard";
import ApproverEditWizard from "@/components/approval/ApproverEditWizard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
  allAssociations?: { stepId: number; stepTitle: string }[];
  isAssociated: boolean;
}

// Define search fields for approvers
const DEFAULT_APPROVER_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "username", label: "Username" },
  { id: "comment", label: "Description" },
];

interface ApproversTableProps {
  onCreateApprover?: () => void;
  refreshTrigger?: number;
}

export function ApproversTable({ onCreateApprover, refreshTrigger }: ApproversTableProps = {}) {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [filteredApprovers, setFilteredApprovers] = useState<Approver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [sortBy, setSortBy] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [approverToEdit, setApproverToEdit] = useState<Approver | null>(null);
  const [approverToDelete, setApproverToDelete] = useState<Approver | null>(null);

  const { t, tWithParams } = useTranslation();

  // Pagination
  const pagination = usePagination({
    data: filteredApprovers,
    initialPageSize: 10,
  });

  // Get paginated approvers
  const paginatedApprovers = pagination.paginatedData;

  // Filter out associated approvers from selection data - use the isAssociated property from API
  const selectableApprovers = approvers.filter(approver => !approver.isAssociated);
  const selectablePaginatedApprovers = paginatedApprovers?.filter(approver => !approver.isAssociated) || [];

  // Bulk selection - only allow selection of non-associated approvers
  const bulkSelection = useBulkSelection({
    data: selectableApprovers,
    paginatedData: selectablePaginatedApprovers,
    keyField: 'id',
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    onSelectionChange: () => { }, // We'll handle this differently
  });

  // Fetch approvers on component mount
  useEffect(() => {
    fetchApprovers();
  }, []);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchApprovers();
    }
  }, [refreshTrigger]);

  // Filter approvers based on search criteria
  useEffect(() => {
    let filtered = [...approvers];

    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      if (searchField === "all") {
        filtered = filtered.filter(
          (approver) =>
            approver.username.toLowerCase().includes(query) ||
            (approver.comment && approver.comment.toLowerCase().includes(query))
        );
      } else if (searchField === "username") {
        filtered = filtered.filter((approver) =>
          approver.username.toLowerCase().includes(query)
        );
      } else if (searchField === "comment") {
        filtered = filtered.filter((approver) =>
          approver.comment && approver.comment.toLowerCase().includes(query)
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof Approver] || "";
      const bValue = b[sortBy as keyof Approver] || "";

      if (sortDirection === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });

    setFilteredApprovers(filtered);
    pagination.handlePageChange(1); // Reset to first page when filtering
  }, [searchQuery, searchField, approvers, sortBy, sortDirection]);

  const fetchApprovers = async () => {
    try {
      setIsLoading(true);
      setIsError(false);

      // Fetch approvers first
      const approversResponse = await approvalService.getAllApprovators();

      // Validate approvers response
      if (!Array.isArray(approversResponse)) {
        console.warn('Invalid approvers response format:', approversResponse);
        setApprovers([]);
        setFilteredApprovers([]);
        return;
      }

      // Try to fetch step associations, but don't fail if it doesn't work
      let enrichedApprovers = approversResponse.map((approver: any) => ({
        ...approver,
        id: approver.id,
        userId: approver.userId || approver.id,
        username: approver.username || 'Unknown User',
        comment: approver.comment || null,
        stepId: null,
        stepTitle: null,
        allAssociations: [],
        isAssociated: approver.isAssociated || false, // Preserve the isAssociated value from API
      }));

      // Skip fetching step configurations since we already have isAssociated from API
      // This avoids making 20+ individual API calls for step configurations
      console.log('Using isAssociated property from API response, skipping step configuration calls');

      setApprovers(enrichedApprovers);
      setFilteredApprovers(enrichedApprovers);
    } catch (error) {
      console.error("Error fetching approvers:", error);
      setIsError(true);
      notifications.error("Failed to load approvers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const handleEditApprover = (approver: Approver) => {
    // Block edit action if approver is associated
    if (approver.isAssociated) {
      notifications.warning("Cannot edit approver: Currently associated with workflows");
      return;
    }
    setApproverToEdit(approver);
    setEditDialogOpen(true);
  };

  const handleDeleteApprover = (approverId: number) => {
    const approver = approvers.find(a => a.id === approverId);
    if (approver) {
      // Block delete action if approver is associated
      if (approver.isAssociated) {
        notifications.warning("Cannot delete approver: Currently associated with workflows");
        return;
      }
      setApproverToDelete(approver);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!approverToDelete) return;

    try {
      await approvalService.deleteApprovator(approverToDelete.id);
      notifications.success("Approver deleted successfully");
      setDeleteDialogOpen(false);
      setApproverToDelete(null);
      fetchApprovers();
    } catch (error) {
      notifications.error("Failed to delete approver");
      console.error("Error deleting approver:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const selectedIds = bulkSelection.selectedItems; // selectedItems already contains IDs
      const eligibleIds = selectedIds.filter(id => {
        const approver = approvers.find(a => a.id === id);
        return !approver?.isAssociated;
      });

      if (eligibleIds.length === 0) {
        notifications.error("None of the selected approvers can be deleted");
        return;
      }

      if (eligibleIds.length < selectedIds.length) {
        notifications.warning(`Only ${eligibleIds.length} of ${selectedIds.length} approvers will be deleted (others are associated with workflows)`);
      }

      await Promise.all(eligibleIds.map(id => approvalService.deleteApprovator(id)));
      notifications.success(`${eligibleIds.length} approvers deleted successfully`);
      bulkSelection.clearSelection();
      fetchApprovers();
    } catch (error) {
      notifications.error("Failed to delete approvers");
      console.error("Error deleting approvers:", error);
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setApproverToEdit(null);
    fetchApprovers();
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setFilterOpen(false);
  };

  // Professional filter/search bar styling
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(true);
      }
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        if (onCreateApprover) {
          onCreateApprover();
        }
      }
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

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
        Failed to load approvers
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-6 w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Document-style Search + Filter Bar */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {DEFAULT_APPROVER_SEARCH_FIELDS.find(
                    (opt) => opt.id === searchField
                  )?.label || "All Fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {DEFAULT_APPROVER_SEARCH_FIELDS.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search approvers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-4 pr-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 rounded-xl placeholder:text-muted-foreground/60 shadow-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors duration-200 rounded-lg"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Filter Button */}
        {/* <div className="flex items-center gap-3">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-4 bg-background/60 backdrop-blur-md border-primary/20 hover:border-primary/40 hover:bg-primary/10 text-foreground transition-all duration-300 shadow-lg rounded-xl font-medium"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <Badge
                  variant="secondary"
                  className="ml-2 bg-primary/20 text-primary border-primary/30 px-2 py-0.5 text-xs rounded-md"
                >
                  Alt+F
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl p-0"
              align="end"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg text-foreground">Filter Options</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors duration-200 rounded-lg"
                    onClick={() => setFilterOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">No additional filters available for approvers.</p>
              </div>
            </PopoverContent>
          </Popover>
        </div> */}
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0">
        <ApproversTableContent
          approvers={paginatedApprovers}
          allApprovers={filteredApprovers}
          selectedApprovers={bulkSelection.selectedItems}
          bulkSelection={bulkSelection as any}
          pagination={pagination}
          onEdit={handleEditApprover}
          onDelete={handleDeleteApprover}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          onBulkDelete={() => setBulkDeleteDialogOpen(true)}
          onAddApprover={onCreateApprover}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Approver Create Dialog */}
      <ApproverCreateWizard
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          fetchApprovers();
          setCreateDialogOpen(false);
        }}
      />

      {/* Approver Edit Dialog */}
      {approverToEdit && (
        <ApproverEditWizard
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={handleEditSuccess}
          approver={approverToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border border-primary/20 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Approver</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{approverToDelete?.username}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background text-foreground hover:bg-muted border border-primary/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Approver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-background border border-primary/20 text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Approvers</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete {bulkSelection.selectedItems.length} selected approvers? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background text-foreground hover:bg-muted border border-primary/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete {bulkSelection.selectedItems.length} Approvers
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 