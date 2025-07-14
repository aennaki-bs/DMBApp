import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { ResponsibilityCentreTableContent } from "./table/ResponsibilityCentreTableContent";
import { DeleteConfirmDialog } from "../admin/DeleteConfirmDialog";
import { ResponsibilityCentreEditDialog } from "./dialogs/ResponsibilityCentreEditDialog";
import { ResponsibilityCentreDetailsDialog } from "./dialogs/ResponsibilityCentreDetailsDialog";
import { AssociateUsersDialog } from "./dialogs/AssociateUsersDialog";
import { RemoveUsersDialog } from "./dialogs/RemoveUsersDialog";
import { Trash2, CheckCircle, Settings, Building, RefreshCw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResponsibilityCentreManagement } from "@/hooks/useResponsibilityCentreManagement";
import { AlertTriangle, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_RESPONSIBILITY_CENTRE_SEARCH_FIELDS } from "@/components/table/constants/filters";
import { BulkDeleteDialog } from "../admin/dialogs/BulkDeleteDialog";
import { useTranslation } from "@/hooks/useTranslation";

export function ResponsibilityCentreTable() {
  const { t, tWithParams } = useTranslation();

  const {
    selectedCentres,
    bulkSelection,
    pagination,
    centres: filteredCentres,
    paginatedCentres,
    editingCentre,
    deletingCentre,
    deleteMultipleOpen,
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    statusFilter,
    setStatusFilter,
    showAdvancedFilters,
    setShowAdvancedFilters,
    isLoading,
    isError,
    refetch,
    setEditingCentre,
    setDeletingCentre,
    setDeleteMultipleOpen,
    associatingUsersForCentre,
    setAssociatingUsersForCentre,
    handleUsersAssociated,
    handleSort,
    sortBy,
    sortDirection,
    handleCentreEdited,
    handleCentreDeleted,
    handleMultipleDeleted,
  } = useResponsibilityCentreManagement();

  // Local state for remove users dialog
  const [removingUsersForCentre, setRemovingUsersForCentre] = useState<ResponsibilityCentre | null>(null);
  const [userCounts, setUserCounts] = useState<Record<number, number>>({});

  // Simple user count fetching with ref to prevent infinite loops
  const userCountsRef = useRef<Record<number, number>>({});
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);

  const updateUserCounts = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      return;
    }

    // Only fetch if we have centres
    if (!filteredCentres || filteredCentres.length === 0) {
      setUserCounts({});
      return;
    }

    isFetchingRef.current = true;

    try {
      // First, check if centres already have usersCount property
      console.log('Checking centres for existing usersCount:', filteredCentres.map(c => ({
        id: c.id,
        code: c.code,
        usersCount: c.usersCount
      })));
      
      // If centres already have usersCount, use that
      const hasDirectCounts = filteredCentres.some(centre => centre.usersCount !== undefined);
      
      if (hasDirectCounts) {
        console.log('Using direct user counts from centres');
        const newCounts: Record<number, number> = {};
        
        filteredCentres.forEach(centre => {
          newCounts[centre.id] = centre.usersCount || 0;
        });
        
        console.log('Direct user counts:', newCounts);
        
        // Only update state if counts actually changed
        const currentCountsStr = JSON.stringify(userCountsRef.current);
        const newCountsStr = JSON.stringify(newCounts);
        
        if (currentCountsStr !== newCountsStr) {
          userCountsRef.current = newCounts;
          setUserCounts(newCounts);
        }
        
        return;
      }
      
      // Fall back to fetching user counts per centre
      console.log('Fetching user counts per centre');
      const newCounts: Record<number, number> = {};
      
      // Fetch user count for each centre individually
      await Promise.all(
        filteredCentres.map(async (centre) => {
          try {
            const users = await responsibilityCentreService.getUsersByResponsibilityCentre(centre.id);
            newCounts[centre.id] = users.length;
            console.log(`Centre ${centre.code} (${centre.id}) has ${users.length} users:`, users);
          } catch (error) {
            console.error(`Error fetching users for centre ${centre.code}:`, error);
            newCounts[centre.id] = 0;
          }
        })
      );
      
      console.log('Fetched user counts:', newCounts);
      
      // Only update state if counts actually changed
      const currentCountsStr = JSON.stringify(userCountsRef.current);
      const newCountsStr = JSON.stringify(newCounts);
      
      if (currentCountsStr !== newCountsStr) {
        userCountsRef.current = newCounts;
        setUserCounts(newCounts);
      }
    } catch (error) {
      console.error('Error fetching user counts:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, [filteredCentres]);

  // Debounced effect to fetch user counts
  useEffect(() => {
    // Clear any pending fetch
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Schedule new fetch with debounce
    fetchTimeoutRef.current = setTimeout(() => {
      updateUserCounts();
    }, 300);

    // Cleanup on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [updateUserCounts]);

  // Clear bulk actions when component unmounts
  useEffect(() => {
    return () => {
      // Component cleanup - no longer needed
    };
  }, []);

  const handleToggleCentreStatus = async (
    centreId: number,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;
      await responsibilityCentreService.updateResponsibilityCentre(centreId, { 
        code: "", 
        descr: "", 
        isActive: newStatus 
      });
      toast.success(
        newStatus
          ? t("responsibilityCentreManagement.statusActivated")
          : t("responsibilityCentreManagement.statusDeactivated")
      );
      refetch();
    } catch (error) {
      toast.error(
        currentStatus
          ? t("responsibilityCentreManagement.statusDeactivationFailed")
          : t("responsibilityCentreManagement.statusActivationFailed")
      );
      console.error(error);
    }
  };

  const handleEditCentre = async (centreId: number, centreData: any) => {
    try {
      await responsibilityCentreService.updateResponsibilityCentre(centreId, centreData);
      toast.success(t("responsibilityCentres.editSuccess"));
      refetch();
      setEditingCentre(null);
    } catch (error) {
      toast.error(t("responsibilityCentres.editFailed"));
      console.error(`Failed to update centre ${centreId}:`, error);
      return Promise.reject(error);
    }
  };

  const handleDeleteCentre = async (centreId: number) => {
    try {
      await responsibilityCentreService.deleteResponsibilityCentre(centreId);
      toast.success(t("responsibilityCentres.deleteSuccess"));
      setDeletingCentre(null);
      refetch();
    } catch (error) {
      toast.error(t("responsibilityCentres.deleteFailed"));
      console.error(error);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      await Promise.all(
        selectedCentres.map(centreId => 
          responsibilityCentreService.deleteResponsibilityCentre(centreId)
        )
      );
      toast.success(
        tWithParams("responsibilityCentres.deletedMultiple", {
          count: selectedCentres.length,
        })
      );
      bulkSelection.clearSelection();
      setDeleteMultipleOpen(false);
      refetch();
    } catch (error) {
      toast.error(t("responsibilityCentres.deleteMultipleFailed"));
      console.error(error);
    }
  };

  const [viewingCentre, setViewingCentre] = useState<ResponsibilityCentre | null>(null);

  const handleViewDetails = (centre: ResponsibilityCentre) => {
    setViewingCentre(centre);
  };

  // Handle remove users dialog
  const handleRemoveUsers = (centre: ResponsibilityCentre) => {
    setRemovingUsersForCentre(centre);
  };

  const handleUsersRemoved = useCallback(() => {
    // Refresh the table data and user counts
    refetch();
    // Re-fetch user counts using the stable function
    updateUserCounts();
  }, [refetch, updateUserCounts]);

  // Professional filter/search bar styling
  const filterCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";

  // Filter popover state
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter options
  const statusOptions = [
    { id: "any", label: t("responsibilityCentres.anyStatus"), value: "any" },
    { id: "active", label: t("responsibilityCentres.active"), value: "active" },
    { id: "inactive", label: t("responsibilityCentres.inactive"), value: "inactive" },
  ];

  // Apply filters immediately when changed
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("any");
    setSearchQuery("");
    setFilterOpen(false); // Close popover after clearing
  };

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
        {t("responsibilityCentres.errorLoading")}
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
                  {DEFAULT_RESPONSIBILITY_CENTRE_SEARCH_FIELDS.find(
                    (opt) => opt.id === searchField
                  )?.label || t("responsibilityCentreManagement.allFields")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-xl shadow-2xl">
                {DEFAULT_RESPONSIBILITY_CENTRE_SEARCH_FIELDS.map((opt) => (
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
              placeholder={t("responsibilityCentreManagement.searchPlaceholder")}
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
        {/* Filter and Refresh buttons */}
        <div className="flex items-center gap-3">
          {/* Manual Refresh Button */}
          <Button
            variant="outline"
            onClick={() => {
              refetch();
              toast.success("Data refreshed successfully");
            }}
            className="h-12 px-4 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-xl"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-12 px-6 bg-background/60 backdrop-blur-md text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 shadow-lg rounded-xl flex items-center gap-3 transition-all duration-300 hover:shadow-xl"
              >
                <Filter className="h-5 w-5" />
                {t("responsibilityCentres.filter")}
                <span className="ml-2 px-2 py-0.5 rounded border border-blue-700 text-xs text-blue-300 bg-blue-900/40 font-mono">Alt+F</span>
                {(statusFilter !== "any") && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl p-6">
              <div className="mb-4 text-foreground font-bold text-lg flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                {t("responsibilityCentres.advancedFilters")}
              </div>
              <div className="flex flex-col gap-4">
                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-popover-foreground">
                    {t("responsibilityCentres.status")}
                  </span>
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-full bg-background/50 backdrop-blur-sm text-foreground border border-border focus:ring-primary focus:border-primary transition-colors duration-200 hover:bg-background/70 shadow-sm rounded-md">
                      <SelectValue>
                        {
                          statusOptions.find(
                            (opt) => opt.value === statusFilter
                          )?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-lg text-popover-foreground border border-border">
                      {statusOptions.map((opt) => (
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
                {(statusFilter !== "any") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-lg transition-all duration-200 flex items-center gap-2"
                    onClick={clearAllFilters}
                  >
                    <X className="h-4 w-4" /> {t("responsibilityCentres.clearAll")}
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsibilityCentreTableContent
          centres={paginatedCentres}
          allCentres={filteredCentres}
          selectedCentres={selectedCentres}
          bulkSelection={bulkSelection}
          pagination={pagination}
          onToggleStatus={handleToggleCentreStatus}
          onEdit={(centre) => {
            console.log("Editing centre:", centre);
            setEditingCentre(centre);
          }}
          onDelete={(centreId) => {
            console.log("Setting deleting centre:", centreId);
            setDeletingCentre(centreId);
          }}
          onViewDetails={handleViewDetails}
          onAssociateUsers={(centre) => setAssociatingUsersForCentre(centre)}
          onRemoveUsers={handleRemoveUsers}
          userCounts={userCounts}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onClearFilters={clearAllFilters}
          onBulkDelete={() => setDeleteMultipleOpen(true)}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Edit Dialog */}
      <ResponsibilityCentreEditDialog
        centre={editingCentre}
        open={!!editingCentre}
        onOpenChange={(open) => !open && setEditingCentre(null)}
        onSuccess={handleCentreEdited}
      />

      {deletingCentre !== null && (
        <DeleteConfirmDialog
          title={t("responsibilityCentres.deleteTitle")}
          description={t("responsibilityCentres.deleteDescription")}
          open={deletingCentre !== null}
          onOpenChange={(open) => {
            console.log("Delete dialog open change:", open, "deletingCentre:", deletingCentre);
            if (!open) setDeletingCentre(null);
          }}
          onConfirm={async () => {
            console.log("Delete confirmed for centre:", deletingCentre);
            if (deletingCentre) {
              await handleDeleteCentre(deletingCentre);
            }
          }}
        />
      )}

      {deleteMultipleOpen && (
        <BulkDeleteDialog
          open={deleteMultipleOpen}
          onOpenChange={setDeleteMultipleOpen}
          onConfirm={handleDeleteMultiple}
          selectedCount={selectedCentres.length}
        />
      )}

      <ResponsibilityCentreDetailsDialog
        centre={viewingCentre}
        open={!!viewingCentre}
        onClose={() => setViewingCentre(null)}
      />

      {/* Associate Users Dialog */}
      {associatingUsersForCentre && (
        <AssociateUsersDialog
          centre={associatingUsersForCentre}
          open={!!associatingUsersForCentre}
          onOpenChange={(open) => !open && setAssociatingUsersForCentre(null)}
          onSuccess={handleUsersAssociated}
        />
      )}

      {/* Remove Users Dialog */}
      {removingUsersForCentre && (
        <RemoveUsersDialog
          centre={removingUsersForCentre}
          open={!!removingUsersForCentre}
          onOpenChange={(open) => !open && setRemovingUsersForCentre(null)}
          onSuccess={handleUsersRemoved}
        />
      )}
    </div>
  );
} 