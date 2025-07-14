import { useState, useEffect } from "react";
import { toast } from "sonner";
import approvalService from "@/services/approvalService";
import { ApproversTableContent } from "./table/ApproversTableContent";
import { ProfessionalBulkActionsBar } from "@/components/shared/ProfessionalBulkActionsBar";
import { EnhancedBulkSelection } from "@/components/shared/EnhancedBulkSelection";
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
}

// Define search fields for approvers
const DEFAULT_APPROVER_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "username", label: "Username" },
  { id: "comment", label: "Comment" },
];

export function ApproversTable() {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [filteredApprovers, setFilteredApprovers] = useState<Approver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  // Pagination logic
  const totalPages = Math.ceil(filteredApprovers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedApprovers = filteredApprovers.slice(startIndex, endIndex);

  // Bulk selection logic
  const bulkSelection = {
    selectedItems: selectedApprovers,
    currentPageSelectedCount: selectedApprovers.length,
    totalSelectedCount: selectedApprovers.length,
    selectCurrentPage: () => {
      const currentPageIds = paginatedApprovers.map(a => a.id);
      setSelectedApprovers(currentPageIds);
    },
    deselectCurrentPage: () => {
      setSelectedApprovers([]);
    },
    selectAllPages: () => {
      const allIds = filteredApprovers.map(a => a.id);
      setSelectedApprovers(allIds);
    },
    deselectAll: () => {
      setSelectedApprovers([]);
    },
    toggleItem: (item: Approver) => {
      setSelectedApprovers(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    },
    toggleSelectCurrentPage: () => {
      const currentPageIds = paginatedApprovers.map(a => a.id);
      const allSelected = currentPageIds.every(id => selectedApprovers.includes(id));
      
      if (allSelected) {
        setSelectedApprovers(prev => prev.filter(id => !currentPageIds.includes(id)));
      } else {
        setSelectedApprovers(prev => [...new Set([...prev, ...currentPageIds])]);
      }
    },
    isSelected: (item: Approver) => selectedApprovers.includes(item.id),
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const pagination = {
    currentPage,
    pageSize,
    totalPages,
    totalItems: filteredApprovers.length,
    handlePageChange,
    handlePageSizeChange,
  };

  // Fetch approvers on component mount
  useEffect(() => {
    fetchApprovers();
  }, []);

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
            approver.comment?.toLowerCase().includes(query)
        );
      } else if (searchField === "username") {
        filtered = filtered.filter((approver) =>
          approver.username.toLowerCase().includes(query)
        );
      } else if (searchField === "comment") {
        filtered = filtered.filter((approver) =>
          approver.comment?.toLowerCase().includes(query)
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
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchQuery, searchField, approvers, sortBy, sortDirection]);

  const fetchApprovers = async () => {
    try {
      setIsLoading(true);
      setIsError(false);
      
      // Fetch both approvers and step configurations
      const [approversResponse, stepsWithApprovalResponse] = await Promise.all([
        approvalService.getAllApprovators(),
        approvalService.getStepsWithApproval()
      ]);
      
      // Validate responses
      if (!Array.isArray(approversResponse)) {
        console.warn('Invalid approvers response format:', approversResponse);
        setApprovers([]);
        setFilteredApprovers([]);
        return;
      }
      
      if (!Array.isArray(stepsWithApprovalResponse)) {
        console.warn('Invalid steps response format:', stepsWithApprovalResponse);
        // Still process approvers even if steps fail
        setApprovers(approversResponse);
        setFilteredApprovers(approversResponse);
        return;
      }
      
      // Create a map of approvator ID to step associations
      const userStepAssociations = new Map();
      
      // Fetch detailed approval configuration for each step
      const stepConfigPromises = stepsWithApprovalResponse
        .filter((step: any) => {
          // Ensure step has required properties and requiresApproval is true
          const hasValidId = step.id !== undefined && step.id !== null;
          const hasValidStepId = step.stepId !== undefined && step.stepId !== null;
          const stepId = hasValidId ? step.id : (hasValidStepId ? step.stepId : null);
          
          return step.requiresApproval && stepId !== null;
        })
        .map(async (step: any) => {
          try {
            // Use step.id if available, otherwise fallback to step.stepId
            const stepId = step.id !== undefined ? step.id : step.stepId;
            const stepTitle = step.title || step.stepTitle || `Step ${stepId}`;
            
            // Only proceed if we have a valid step ID
            if (stepId === undefined || stepId === null) {
              console.warn('Skipping step with undefined ID:', step);
              return null;
            }
            
            const stepConfig = await approvalService.getStepApprovalConfig(stepId);
            return { stepId, stepTitle, config: stepConfig };
          } catch (error) {
            console.error(`Error fetching config for step ${step.id || step.stepId}:`, error);
            return null;
          }
        });

      const stepConfigs = await Promise.all(stepConfigPromises);
      
      // Build associations map
      stepConfigs.forEach((result) => {
        if (result?.config?.groupApprovers) {
          result.config.groupApprovers.forEach((approvator: any) => {
            if (!userStepAssociations.has(approvator.id)) {
              userStepAssociations.set(approvator.id, []);
            }
            userStepAssociations.get(approvator.id).push({
              stepId: result.stepId,
              stepTitle: result.stepTitle,
            });
          });
        }
      });

      const enrichedApprovers = approversResponse.map((approver: any) => {
        // Ensure approver has required properties
        if (!approver || typeof approver.id === 'undefined') {
          console.warn('Invalid approver data:', approver);
          return null;
        }
        
        const associations = userStepAssociations.get(approver.id) || [];
        const firstAssociation = associations[0]; // Use the first association for display
        
        return {
          ...approver,
          // Ensure all required properties exist
          id: approver.id,
          userId: approver.userId || approver.id,
          username: approver.username || 'Unknown User',
          comment: approver.comment || null,
          stepId: firstAssociation?.stepId || null,
          stepTitle: firstAssociation?.stepTitle || null,
          allAssociations: associations,
        };
      }).filter(Boolean); // Remove any null entries

      setApprovers(enrichedApprovers);
      setFilteredApprovers(enrichedApprovers);
    } catch (error) {
      console.error("Error fetching approvers:", error);
      setIsError(true);
      toast.error("Failed to load approvers");
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
    setApproverToEdit(approver);
    setEditDialogOpen(true);
  };

  const handleDeleteApprover = (approverId: number) => {
    const approver = approvers.find(a => a.id === approverId);
    if (approver) {
      setApproverToDelete(approver);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!approverToDelete) return;

    try {
      await approvalService.deleteApprovator(approverToDelete.id);
      toast.success("Approver deleted successfully");
      setDeleteDialogOpen(false);
      setApproverToDelete(null);
      fetchApprovers();
    } catch (error) {
      toast.error("Failed to delete approver");
      console.error("Error deleting approver:", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const deletePromises = selectedApprovers.map((id) =>
        approvalService.deleteApprovator(id)
      );
      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${selectedApprovers.length} approvers`);
      setBulkDeleteDialogOpen(false);
      setSelectedApprovers([]);
      fetchApprovers();
    } catch (error) {
      toast.error("Failed to delete approvers");
      console.error("Error deleting approvers:", error);
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
              placeholder="Search approvers..."
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
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
              <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Filters
              </div>
              <div className="text-sm text-muted-foreground mt-4 text-center">
                Additional filters will be added in future updates
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                  onClick={clearAllFilters}
                >
                  <X className="h-4 w-4" /> Clear All
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ApproversTableContent
          approvers={paginatedApprovers}
          allApprovers={filteredApprovers}
          selectedApprovers={selectedApprovers}
          bulkSelection={bulkSelection as any}
          pagination={pagination}
          onEdit={handleEditApprover}
          onDelete={handleDeleteApprover}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          onBulkDelete={() => setBulkDeleteDialogOpen(true)}
          onAddApprover={() => setCreateDialogOpen(true)}
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
            <AlertDialogTitle>Confirm Delete Approver</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete the approver "
              {approverToDelete?.username}"? This action cannot be undone.
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
              Delete
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
               Are you sure you want to delete {selectedApprovers.length} selected approvers? This action cannot be undone.
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
               Delete {selectedApprovers.length} Approvers
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </div>
  );
} 