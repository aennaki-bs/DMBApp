import { useState, useEffect } from "react";
import { notifications } from "@/utils/notificationUtils";
import approvalService from "@/services/approvalService";
import { ApprovalGroupTableContent } from "./table/ApprovalGroupTableContent";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Filter, X, Plus, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ApprovalGroup } from "@/models/approval";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { usePagination } from "@/hooks/usePagination";

import ApprovalGroupEditDialog from "@/components/approval/ApprovalGroupEditDialog";
import ApprovalGroupViewDialog from "@/components/approval/ApprovalGroupViewDialog";
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

// Enhanced filter constants
const APPROVAL_GROUP_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'name', label: 'Group Name' },
  { id: 'comment', label: 'Comment' },
  { id: 'ruleType', label: 'Rule Type' },
  { id: 'approvers', label: 'Approvers' },
];

const RULE_TYPE_OPTIONS = [
  { id: "any", label: "Any Rule Type", value: "any" },
  { id: "All", label: "All Must Approve", value: "All" },
  { id: "Any", label: "Any Can Approve", value: "Any" },
  { id: "Sequential", label: "Sequential", value: "Sequential" },
  { id: "MinimumWithRequired", label: "Minimum + Required", value: "MinimumWithRequired" },
];

const STATUS_OPTIONS = [
  { id: "any", label: "Any Status", value: "any" },
  { id: "associated", label: "Associated", value: "associated" },
  { id: "unassociated", label: "Not Associated", value: "unassociated" },
];

interface ApprovalGroupsTableProps {
  onCreateGroup?: () => void;
  refreshTrigger?: number; // Used to trigger refresh from parent
}

export function ApprovalGroupsTable({ onCreateGroup, refreshTrigger }: ApprovalGroupsTableProps = {}) {
  // State management
  const [approvalGroups, setApprovalGroups] = useState<ApprovalGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ApprovalGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [ruleTypeFilter, setRuleTypeFilter] = useState("any");
  const [statusFilter, setStatusFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ApprovalGroup | null>(null);

  // Association tracking
  const [associatedGroups, setAssociatedGroups] = useState<Record<number, boolean>>({});
  const [checkingAssociation, setCheckingAssociation] = useState(false);

  // Pagination
  const pagination = usePagination({
    data: filteredGroups,
    initialPageSize: 10,
  });

  // Get paginated groups
  const paginatedGroups = pagination.paginatedData;

  // Filter out associated groups from selection data
  const selectableGroups = approvalGroups.filter(group => !associatedGroups[group.id]);
  const selectablePaginatedGroups = paginatedGroups?.filter(group => !associatedGroups[group.id]) || [];

  // Bulk selection - only allow selection of non-associated groups
  const bulkSelection = useBulkSelection({
    data: selectableGroups,
    paginatedData: selectablePaginatedGroups,
    keyField: 'id',
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    onSelectionChange: () => { }, // We'll handle this differently
  });



  // Fetch approval groups on mount
  useEffect(() => {
    fetchApprovalGroups();
  }, []);

  // Check associations when groups change
  useEffect(() => {
    if (approvalGroups.length > 0) {
      checkGroupAssociations();
    }
  }, [approvalGroups]);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchApprovalGroups();
    }
  }, [refreshTrigger]);



  // Apply filters and search
  useEffect(() => {
    let filtered = [...approvalGroups];

    // Apply status filter
    if (statusFilter !== "any") {
      if (statusFilter === "associated") {
        filtered = filtered.filter((group) => associatedGroups[group.id]);
      } else if (statusFilter === "unassociated") {
        filtered = filtered.filter((group) => !associatedGroups[group.id]);
      }
    }

    // Apply rule type filter
    if (ruleTypeFilter !== "any") {
      filtered = filtered.filter((group) => group.ruleType === ruleTypeFilter);
    }

    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      if (searchField === "all") {
        filtered = filtered.filter(
          (group) =>
            group.name.toLowerCase().includes(query) ||
            group.comment?.toLowerCase().includes(query) ||
            group.stepTitle?.toLowerCase().includes(query) ||
            group.ruleType.toLowerCase().includes(query) ||
            group.approvers?.some(approver =>
              approver.username?.toLowerCase().includes(query)
            )
        );
      } else if (searchField === "name") {
        filtered = filtered.filter((group) =>
          group.name.toLowerCase().includes(query)
        );
      } else if (searchField === "comment") {
        filtered = filtered.filter((group) =>
          group.comment?.toLowerCase().includes(query)
        );
      } else if (searchField === "ruleType") {
        filtered = filtered.filter((group) =>
          group.ruleType.toLowerCase().includes(query)
        );
      } else if (searchField === "approvers") {
        filtered = filtered.filter((group) =>
          group.approvers?.some(approver =>
            approver.username?.toLowerCase().includes(query)
          )
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any = a[sortBy as keyof ApprovalGroup];
      let bVal: any = b[sortBy as keyof ApprovalGroup];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    setFilteredGroups(filtered);
  }, [searchQuery, searchField, ruleTypeFilter, statusFilter, approvalGroups, sortBy, sortDirection, associatedGroups]);

  const fetchApprovalGroups = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      const data = await approvalService.getAllApprovalGroups();
      setApprovalGroups(data);
    } catch (error) {
      console.error("Failed to fetch approval groups:", error);
      setIsError(true);
      notifications.error("Failed to load approval groups");
    } finally {
      setIsLoading(false);
    }
  };

  const checkGroupAssociations = async () => {
    try {
      setCheckingAssociation(true);
      const associations: Record<number, boolean> = {};

      for (const group of approvalGroups) {
        try {
          const association = await approvalService.checkGroupAssociation(group.id);
          associations[group.id] = association.isAssociated;
        } catch (error) {
          console.error(`Failed to check association for group ${group.id}:`, error);
          associations[group.id] = false;
        }
      }

      setAssociatedGroups(associations);
    } catch (error) {
      console.error("Failed to check group associations:", error);
    } finally {
      setCheckingAssociation(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleView = (group: ApprovalGroup) => {
    setSelectedGroup(group);
    setViewDialogOpen(true);
  };

  const handleEdit = (group: ApprovalGroup) => {
    if (associatedGroups[group.id]) {
      notifications.error("Cannot edit a group that is associated with workflow steps");
      return;
    }
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  const handleDelete = (groupId: number) => {
    const group = approvalGroups.find(g => g.id === groupId);
    if (!group) return;

    if (associatedGroups[groupId]) {
      notifications.error("Cannot delete a group that is associated with workflow steps");
      return;
    }
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      await approvalService.deleteApprovalGroup(groupToDelete.id);
      setApprovalGroups(prev => prev.filter(g => g.id !== groupToDelete.id));
      notifications.success("Approval group deleted successfully");
    } catch (error) {
      console.error("Failed to delete approval group:", error);
      notifications.error("Failed to delete approval group");
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = bulkSelection.selectedItems; // selectedItems already contains IDs
    const eligibleIds = selectedIds.filter(id => !associatedGroups[id]);

    if (eligibleIds.length === 0) {
      notifications.error("None of the selected groups can be deleted");
      return;
    }

    if (eligibleIds.length < selectedIds.length) {
      notifications.warning(`Only ${eligibleIds.length} of ${selectedIds.length} groups will be deleted (others are associated with workflows)`);
    }

    try {
      await Promise.all(eligibleIds.map(id => approvalService.deleteApprovalGroup(id)));
      setApprovalGroups(prev => prev.filter(g => !eligibleIds.includes(g.id)));
      notifications.success(`${eligibleIds.length} groups deleted successfully`);
      bulkSelection.clearSelection();
    } catch (error) {
      console.error("Failed to delete groups:", error);
      notifications.error("Failed to delete selected groups");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleBulkReactivate = async () => {
    const selectedIds = bulkSelection.selectedItems; // selectedItems already contains IDs
    const eligibleIds = selectedIds.filter(id => !associatedGroups[id]);

    if (eligibleIds.length === 0) {
      notifications.error("None of the selected groups can be reactivated");
      return;
    }

    try {
      // This would be implemented if there's a reactivate endpoint
      // await Promise.all(eligibleIds.map(id => approvalService.reactivateApprovalGroup(id)));
      notifications.success(`${eligibleIds.length} groups reactivated successfully`);
      bulkSelection.clearSelection();
      fetchApprovalGroups();
    } catch (error) {
      console.error("Failed to reactivate groups:", error);
      notifications.error("Failed to reactivate selected groups");
    }
  };

  const clearAllFilters = () => {
    setRuleTypeFilter("any");
    setStatusFilter("any");
    setSearchQuery("");
    setFilterOpen(false);
  };

  // Filter state tracking
  const hasActiveFilters = ruleTypeFilter !== "any" || statusFilter !== "any";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(true);
      }
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        if (onCreateGroup) {
          onCreateGroup();
        }
      }
      if (e.key === "Escape") {
        if (filterOpen) {
          setFilterOpen(false);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  // Professional styling classes
  const filterCardClass = "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

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
        Error loading approval groups. Please try again.
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-6 w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Enhanced Search + Filter Bar */}
      <div className={filterCardClass}>
        {/* Search and field select */}
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <div className="relative">
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[140px] h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg rounded-xl">
                <SelectValue>
                  {APPROVAL_GROUP_SEARCH_FIELDS.find(
                    (opt) => opt.id === searchField
                  )?.label || "All Fields"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {APPROVAL_GROUP_SEARCH_FIELDS.map((opt) => (
                  <SelectItem
                    key={opt.id}
                    value={opt.id as string}
                    className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-lg"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            <Input
              placeholder="Search approval groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative h-12 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-12 pr-4 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-lg group-hover:shadow-xl placeholder:text-muted-foreground/60"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors duration-300">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter popover */}
        <div className="flex items-center gap-3">
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
              >
                <Filter className="h-5 w-5" />
                Filter
                <span className="ml-2 px-2 py-0.5 rounded border border-blue-700 text-xs text-blue-300 bg-blue-900/40 font-mono">Alt+F</span>
                {hasActiveFilters && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
              <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Advanced Filters
              </div>
              <div className="flex flex-col gap-4">
                {/* Rule Type Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-popover-foreground">Rule Type</span>
                  <Select value={ruleTypeFilter} onValueChange={setRuleTypeFilter}>
                    <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                      <SelectValue>
                        {RULE_TYPE_OPTIONS.find(opt => opt.value === ruleTypeFilter)?.label || "Any Rule Type"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                      {RULE_TYPE_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-accent hover:text-accent-foreground"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-popover-foreground">Association Status</span>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                      <SelectValue>
                        {STATUS_OPTIONS.find(opt => opt.value === statusFilter)?.label || "Any Status"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.id}
                          value={opt.value}
                          className="hover:bg-accent hover:text-accent-foreground"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                    onClick={clearAllFilters}
                  >
                    <X className="h-4 w-4" /> Clear All
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>


        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 min-h-0">
        <ApprovalGroupTableContent
          groups={paginatedGroups}
          allGroups={filteredGroups}
          selectedGroups={bulkSelection.selectedItems} // selectedItems already contains IDs
          bulkSelection={bulkSelection}
          pagination={pagination}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          onBulkDelete={() => setBulkDeleteDialogOpen(true)}
          onBulkReactivate={handleBulkReactivate}
          onCreateGroup={onCreateGroup}
          isLoading={isLoading}
          isError={isError}
          associatedGroups={associatedGroups}
          checkingAssociation={checkingAssociation}
        />
      </div>

      {/* Dialogs */}
      {selectedGroup && (
        <ApprovalGroupEditDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          group={selectedGroup}
          onSuccess={() => {
            fetchApprovalGroups();
            setEditDialogOpen(false);
            setSelectedGroup(null);
          }}
        />
      )}

      {selectedGroup && (
        <ApprovalGroupViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          group={selectedGroup}
          isAssociated={associatedGroups[selectedGroup.id] || false}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border border-primary/20 text-foreground rounded-xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete Group</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete the approval group "{groupToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background/60 backdrop-blur-md border-primary/20 text-foreground hover:bg-background/80 hover:border-primary/40 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive/20 hover:bg-destructive/30 text-destructive border-destructive/30 hover:border-destructive/50 rounded-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border border-primary/20 text-foreground rounded-xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete {bulkSelection.selectedItems.length} selected approval groups? This action cannot be undone.
              {bulkSelection.selectedItems.some(group => associatedGroups[group.id]) && (
                <div className="mt-2 text-amber-600">
                  Warning: Some selected groups are associated with workflows and cannot be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-background/60 backdrop-blur-md border-primary/20 text-foreground hover:bg-background/80 hover:border-primary/40 rounded-lg">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive/20 hover:bg-destructive/30 text-destructive border-destructive/30 hover:border-destructive/50 rounded-lg"
            >
              Delete Groups
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 