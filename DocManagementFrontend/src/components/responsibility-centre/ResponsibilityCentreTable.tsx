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
import { Trash2, CheckCircle, Settings, Building } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResponsibilityCentreManagement } from "@/hooks/useResponsibilityCentreManagement";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
      toast.success(t("common.success"));
      refetch();
      setEditingCentre(null);
    } catch (error) {
      toast.error(t("common.error"));
      console.error(`Failed to update centre ${centreId}:`, error);
      return Promise.reject(error);
    }
  };

  const handleDeleteCentre = async (centreId: number) => {
    try {
      await responsibilityCentreService.deleteResponsibilityCentre(centreId);
      toast.success(t("common.success"));
      setDeletingCentre(null);
      refetch();
    } catch (error) {
      toast.error(t("common.error"));
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
      toast.success(t("common.success"));
      bulkSelection.clearSelection();
      setDeleteMultipleOpen(false);
      refetch();
    } catch (error) {
      toast.error(t("common.error"));
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

  // Professional search bar styling
  const searchCardClass =
    "w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10";





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
        {t("common.error")}
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col gap-6 w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Document-style Search Bar */}
      <div className={searchCardClass}>
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
        {/* No additional buttons needed */}
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
          onClearFilters={() => setSearchQuery("")}
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
          title={t("common.delete")}
          description="Are you sure you want to delete this responsibility centre?"
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