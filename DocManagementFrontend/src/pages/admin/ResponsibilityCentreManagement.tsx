import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Trash2,
  Search,
  Plus,
  Building2,
  ListFilter,
  Edit,
  X,
  CheckCircle2,
  XCircle,
  UsersRound,
  Users,
  Eye,
  Mail,
  AlertTriangle,
  UserMinus,
  User as UserIcon,
  ShieldCheck,
  Shield,
  RefreshCw,
  Filter,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import {
  ResponsibilityCentre,
  CreateResponsibilityCentreRequest,
  UpdateResponsibilityCentreRequest,
  User,
} from "@/models/responsibilityCentre";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { usePagination } from "@/hooks/usePagination";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import PaginationWithBulkActions, { BulkAction } from "@/components/shared/PaginationWithBulkActions";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { cn } from "@/lib/utils";

// Simple debounce utility
const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

const ResponsibilityCentreManagement = React.memo(() => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "Admin") {
      toast.error(t("errors.noPermission"));
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate, t]);

  const [centres, setCentres] = useState<ResponsibilityCentre[]>([]);
  const [filteredCentres, setFilteredCentres] = useState<
    ResponsibilityCentre[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignUsersDialogOpen, setAssignUsersDialogOpen] = useState(false);
  const [centreToEdit, setCentreToEdit] = useState<ResponsibilityCentre | null>(
    null
  );
  const [centreToDelete, setCentreToDelete] =
    useState<ResponsibilityCentre | null>(null);
  const [centreToAssignUsers, setCentreToAssignUsers] =
    useState<ResponsibilityCentre | null>(null);
  const [selectedCentres, setSelectedCentres] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Form state for create/edit
  const [formCode, setFormCode] = useState("");
  const [formDescr, setFormDescr] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // User association state
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [unassociatedUsers, setUnassociatedUsers] = useState<User[]>([]);
  const [associatedWithCurrentCenter, setAssociatedWithCurrentCenter] =
    useState<User[]>([]);
  const [viewMode, setViewMode] = useState<"unassociated" | "currentCenter">(
    "unassociated"
  );
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Replace users to remove state with details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [centreDetails, setCentreDetails] =
    useState<ResponsibilityCentre | null>(null);
  const [centreUsers, setCentreUsers] = useState<User[]>([]);
  const [userIdsToRemove, setUserIdsToRemove] = useState<number[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Add a tracking state for deleted users
  const [hasDeletedUsers, setHasDeletedUsers] = useState(false);

  // Add bulk delete state
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCentres,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredCentres,
    initialPageSize: 25,
  });

  // Use enhanced bulk selection hook
  const bulkSelection = useBulkSelection({
    data: filteredCentres,
    paginatedData: paginatedCentres,
    keyField: 'id',
    currentPage,
    pageSize,
  });

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Handle sorting
  const handleSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }, [sortBy]);

  // Memoized search fields to prevent recreation
  const searchFields = useMemo(
    () => [
      { id: "all", label: t("common.all") + " Fields" },
      { id: "code", label: t("common.code") },
      { id: "descr", label: t("common.description") },
    ],
    [t]
  );

  // Debounced search query state
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query updates
  const debouncedSetSearch = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedSearchQuery(query);
      }, 300),
    []
  );

  // Update debounced search when search query changes
  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  // Memoized filtered centres to prevent unnecessary recalculations
  const memoizedFilteredCentres = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return centres;
    }

    const query = debouncedSearchQuery.toLowerCase();

    return centres.filter((centre) => {
      if (searchField === "all") {
        return (
          centre.code.toLowerCase().includes(query) ||
          centre.descr.toLowerCase().includes(query)
        );
      } else if (searchField === "code") {
        return centre.code.toLowerCase().includes(query);
      } else if (searchField === "descr") {
        return centre.descr.toLowerCase().includes(query);
      }
      return true;
    });
  }, [centres, debouncedSearchQuery, searchField]);

  // Update filteredCentres when memoized version changes
  useEffect(() => {
    const sortedCentres = [...memoizedFilteredCentres].sort((a, b) => {
      let aValue: any = a[sortBy as keyof ResponsibilityCentre];
      let bValue: any = b[sortBy as keyof ResponsibilityCentre];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCentres(sortedCentres);
  }, [memoizedFilteredCentres, sortBy, sortDirection]);

  // Clear filters function
  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSearchField("all");
  }, []);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    const selectedItems = bulkSelection.getSelectedObjects();
    if (selectedItems.length === 0) {
      toast.error("No centres selected");
      return;
    }

    try {
      const deletePromises = selectedItems.map((centre) =>
        responsibilityCentreService.deleteResponsibilityCentre(centre.id)
      );

      await Promise.all(deletePromises);
      toast.success(`Successfully deleted ${selectedItems.length} centre(s)`);

      // Refresh the centres list
      await fetchResponsibilityCentres();

      // Clear selection
      bulkSelection.clearSelection();
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete centres:", error);
      toast.error("Failed to delete selected centres");
    }
  };

  // Fetch responsibility centres
  const fetchResponsibilityCentres = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await responsibilityCentreService.getAllResponsibilityCentres();
      setCentres(response);
    } catch (error) {
      console.error("Error fetching responsibility centres:", error);
      toast.error("Failed to fetch responsibility centres");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Open bulk delete dialog
  const openBulkDeleteDialog = () => {
    setBulkDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchResponsibilityCentres();
  }, [fetchResponsibilityCentres]);

  // Add missing state and functions for the form handling
  const validateCode = useCallback(async (code: string, excludeId?: number) => {
    if (!code.trim()) {
      setIsCodeValid(false);
      return;
    }

    setIsValidating(true);
    try {
      const response = await responsibilityCentreService.getAllResponsibilityCentres();
      const existingCentre = response.find(
        (centre: ResponsibilityCentre) =>
          centre.code.toLowerCase() === code.toLowerCase() &&
          centre.id !== excludeId
      );
      setIsCodeValid(!existingCentre);
    } catch (error) {
      console.error("Error validating code:", error);
      setIsCodeValid(false);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const debouncedValidateCode = useMemo(
    () => debounce(validateCode, 500),
    [validateCode]
  );

  // Reset form function
  const resetForm = useCallback(() => {
    setFormCode("");
    setFormDescr("");
    setIsCodeValid(true);
    setIsFormValid(false);
    setIsValidating(false);
    setCentreToEdit(null);
  }, []);

  // Form validation effect
  useEffect(() => {
    const isValid = formCode.trim() !== "" && formDescr.trim() !== "" && isCodeValid && !isValidating;
    setIsFormValid(isValid);
  }, [formCode, formDescr, isCodeValid, isValidating]);

  // Create centre function
  const handleCreateCentre = async () => {
    if (!formCode.trim() || !formDescr.trim() || !isCodeValid) {
      toast.error("Please fill in all fields correctly");
      return;
    }

    try {
      const request: CreateResponsibilityCentreRequest = {
        code: formCode.trim(),
        descr: formDescr.trim(),
      };

      await responsibilityCentreService.createResponsibilityCentre(request);
      toast.success("Responsibility centre created successfully");

      await fetchResponsibilityCentres();
      resetForm();
      setCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating responsibility centre:", error);
      toast.error("Failed to create responsibility centre");
    }
  };

  // Edit centre functions
  const openEditDialog = (centre: ResponsibilityCentre) => {
    setCentreToEdit(centre);
    setFormCode(centre.code);
    setFormDescr(centre.descr);
    setIsCodeValid(true);
    setEditDialogOpen(true);
  };

  const handleUpdateCentre = async () => {
    if (!centreToEdit || !isFormValid) return;

    try {
      const request: UpdateResponsibilityCentreRequest = {
        code: formCode.trim(),
        descr: formDescr.trim(),
      };

      await responsibilityCentreService.updateResponsibilityCentre(centreToEdit.id, request);
      toast.success("Responsibility centre updated successfully");

      await fetchResponsibilityCentres();
      resetForm();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating responsibility centre:", error);
      toast.error("Failed to update responsibility centre");
    }
  };

  // Delete centre functions
  const openDeleteDialog = (centre: ResponsibilityCentre) => {
    setCentreToDelete(centre);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCentre = async () => {
    if (!centreToDelete) return;

    try {
      await responsibilityCentreService.deleteResponsibilityCentre(centreToDelete.id);
      toast.success("Responsibility centre deleted successfully");

      await fetchResponsibilityCentres();
      setDeleteDialogOpen(false);
      setCentreToDelete(null);
    } catch (error) {
      console.error("Error deleting responsibility centre:", error);
      toast.error("Failed to delete responsibility centre");
    }
  };

  // User association functions (placeholder implementations)
  const openAssociateUsersDialog = (centre: ResponsibilityCentre) => {
    setCentreToAssignUsers(centre);
    setAssignUsersDialogOpen(true);
    // Add logic to fetch available users
  };

  const openDetailsDialog = (centre: ResponsibilityCentre) => {
    setCentreDetails(centre);
    setShowDetailsDialog(true);
    // Add logic to fetch centre users
  };

  const handleAssignUsers = async () => {
    // Placeholder implementation
    toast.success("Users assigned successfully");
    setAssignUsersDialogOpen(false);
  };

  const handleRemoveUser = async (userId: number) => {
    // Placeholder implementation
    toast.success("User removed successfully");
  };

  const refreshUnassignedUsersList = () => {
    // Placeholder implementation
  };

  const refreshCurrentCenterUsersList = () => {
    // Placeholder implementation
  };

  const refreshDetailsView = () => {
    // Placeholder implementation
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const setUserViewMode = (mode: "unassociated" | "currentCenter") => {
    setViewMode(mode);
  };

  const getRoleName = (user: User) => {
    return user.role || "User";
  };

  // Modern Professional Checkbox Component
  const ProfessionalCheckbox = ({ checked, onChange, className = "" }: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    className?: string;
  }) => (
    <motion.div
      className={cn("relative", className)}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={cn(
          "w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200",
          "flex items-center justify-center",
          checked
            ? "bg-blue-500 border-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            : "border-slate-400 hover:border-blue-400 bg-slate-800/50"
        )}
        onClick={() => onChange(!checked)}
        animate={checked ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.1 }}
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <polyline points="20,6 9,17 4,12" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );

  // Professional Table Row - Matching User Management Exactly
  const ResponsibilityCentreTableRow = ({ centre, isSelected, onSelect }: {
    centre: ResponsibilityCentre;
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
  }) => (
    <TableRow
      className={cn(
        "hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/50",
        isSelected && "bg-primary/10"
      )}
      onClick={() => onSelect(!isSelected)}
    >
      <TableCell className="w-12 p-4">
        <ProfessionalCheckbox checked={isSelected} onChange={onSelect} />
      </TableCell>
      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
            {centre.code.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground">{centre.code}</div>
            <div className="text-sm text-muted-foreground">{centre.code.toLowerCase()}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="p-4 text-foreground">
        {centre.descr}
      </TableCell>
      <TableCell className="text-center p-4">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          {centre.usersCount || 0}
        </Badge>
      </TableCell>
      <TableCell className="text-center p-4">
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
          {centre.documentsCount || 0}
        </Badge>
      </TableCell>
      <TableCell className="text-right p-4">
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              // Actions menu would go here
            }}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <Users className="h-4 w-4 rotate-90" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  // Define bulk actions for the pagination component
  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete Selected",
      icon: Trash2,
      onClick: () => setBulkDeleteDialogOpen(true),
      variant: "destructive",
    },
  ];

  // Define page actions like User Management
  const pageActions = [
    {
      label: "Create Centre",
      variant: "default" as const,
      icon: Plus,
      onClick: () => {
        resetForm();
        setCreateDialogOpen(true);
      },
    },
  ];

  return (
    <PageLayout
      title="Responsibility Centres"
      subtitle="Manage responsibility centres and user assignments"
      icon={Building2}
      actions={pageActions}
    >
      {/* Professional Search/Filter Bar - Exactly Like User Management */}
      <div className="w-full flex flex-col md:flex-row items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/5 via-background/50 to-primary/5 backdrop-blur-xl shadow-lg border border-primary/10">
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[140px] bg-background/60 backdrop-blur-md text-foreground border border-primary/20 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md rounded-lg">
              <SelectValue>
                {searchFields.find((field) => field.id === searchField)?.label || "All fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20 rounded-lg shadow-xl">
              {searchFields.map((field) => (
                <SelectItem
                  key={field.id}
                  value={field.id}
                  className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary rounded-md text-sm"
                >
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search centres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background/60 backdrop-blur-md text-foreground border border-primary/20 pl-11 pr-10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 hover:bg-background/80 shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive transition-colors duration-150"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-4 text-muted-foreground hover:text-foreground border border-primary/20 bg-background/60"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded border">
              Alt+F
            </kbd>
          </Button>
        </div>
      </div>

      {/* Professional Table Content - Matching User Management Structure */}
      <div className="h-full flex flex-col gap-4" style={{ minHeight: "100%" }}>
        <div className="flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg min-h-0">
          {/* Subtle animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

          {paginatedCentres?.length > 0 ? (
            <div className="relative h-full flex flex-col z-10">
              {/* Fixed Header - Never Scrolls */}
              <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
                <div className="min-w-[1026px]">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow className="border-b border-primary/10">
                        <TableHead className="w-12 p-4">
                          <ProfessionalCheckbox
                            checked={bulkSelection.isCurrentPageFullySelected}
                            onChange={(checked) => {
                              if (checked) {
                                bulkSelection.selectCurrentPage();
                              } else {
                                bulkSelection.deselectAll();
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-semibold p-4 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort('code')}
                        >
                          <div className="flex items-center gap-2">
                            Code
                            {sortBy === 'code' && (
                              sortDirection === 'asc' ?
                                <ChevronUp className="h-4 w-4" /> :
                                <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-muted-foreground font-semibold p-4 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleSort('descr')}
                        >
                          <div className="flex items-center gap-2">
                            Description
                            {sortBy === 'descr' && (
                              sortDirection === 'asc' ?
                                <ChevronUp className="h-4 w-4" /> :
                                <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-center p-4">
                          Users
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-center p-4">
                          Documents
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold text-right p-4">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
              </div>

              {/* Scrollable Body - Only Content Scrolls */}
              <div
                className="flex-1 overflow-hidden"
                style={{ maxHeight: "calc(100vh - 300px)" }}
              >
                <ScrollArea className="table-scroll-area h-full w-full">
                  <div className="min-w-[1026px] pb-4">
                    <Table className="table-fixed w-full">
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="flex items-center justify-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                                <span className="text-muted-foreground">Loading centres...</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedCentres.map((centre) => (
                            <ResponsibilityCentreTableRow
                              key={centre.id}
                              centre={centre}
                              isSelected={bulkSelection.isSelected(centre.id)}
                              onSelect={(selected) => {
                                bulkSelection.toggleItem(centre);
                              }}
                            />
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="relative h-full flex items-center justify-center z-10">
              <div className="text-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <Building2 className="h-12 w-12 text-muted-foreground/50" />
                  <div>
                    <p className="text-muted-foreground text-lg font-medium">No centres found</p>
                    <p className="text-muted-foreground/70 text-sm">
                      {searchQuery ? "Try adjusting your search criteria" : "Create your first responsibility centre"}
                    </p>
                  </div>
                  {!searchQuery && (
                    <Button
                      onClick={() => {
                        resetForm();
                        setCreateDialogOpen(true);
                      }}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Centre
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar and Pagination - Exactly Like User Management */}
        {paginatedCentres?.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-primary/10 bg-background/30 backdrop-blur-sm">
            {/* Left side - Bulk Actions */}
            <div className="flex items-center gap-3">
              {bulkSelection.selectedItems.length > 0 && (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium text-foreground">
                      {bulkSelection.selectedItems.length} selected
                    </span>
                  </div>

                  <Select>
                    <SelectTrigger className="w-[100px] h-9 bg-background/60">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="h-9 px-4 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Centers
                    <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded border">
                      Del
                    </kbd>
                  </Button>
                </>
              )}
            </div>

            {/* Right side - Pagination */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Show</span>
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(Number(value))}>
                  <SelectTrigger className="w-[70px] h-8 bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0"
                >
                  ‹
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0"
                >
                  ›
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Responsibility Centre Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col bg-[#0a1033] text-white border border-blue-900/40 p-0">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl text-white">
                Create Responsibility Centre
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                Add a new responsibility centre to the system
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-blue-200">
                  Code
                </Label>
                <Input
                  id="code"
                  placeholder="Enter code"
                  value={formCode}
                  onChange={(e) => {
                    setFormCode(e.target.value.toUpperCase());
                    validateCode(e.target.value, centreToEdit?.id);
                  }}
                  className="bg-[#192257] border-blue-900/40 text-white"
                  disabled={centreToEdit !== null}
                />
                {!isCodeValid && (
                  <p className="text-red-400 text-sm">
                    This code is already in use or invalid
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descr" className="text-blue-200">
                  Description
                </Label>
                <Input
                  id="descr"
                  placeholder="Enter description"
                  value={formDescr}
                  onChange={(e) => setFormDescr(e.target.value)}
                  className="bg-[#192257] border-blue-900/40 text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#192257] p-4 mt-2 border-t border-blue-900/40">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setCreateDialogOpen(false);
                }}
                className="bg-transparent border-blue-900/40 text-blue-300 hover:bg-blue-900/20"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCentre}
                disabled={!formCode || !formDescr || !isCodeValid}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create Centre
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Just close without validation if we're exiting
            resetForm();
          }
          setEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#0f1642] border-blue-900/30 text-blue-100">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Edit Responsibility Centre
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update the details of this responsibility centre.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-blue-200">
                Code <span className="text-red-400">*</span>
              </Label>
              <Input
                id="edit-code"
                value={formCode}
                onChange={(e) => {
                  setFormCode(e.target.value);
                  // Only validate if the code actually changed from the original
                  if (e.target.value !== centreToEdit?.code) {
                    setIsCodeValid(true); // Reset validation state on change
                    debouncedValidateCode(e.target.value, centreToEdit?.id);
                  } else {
                    // If returning to original value, it's valid
                    setIsCodeValid(true);
                  }
                }}
                placeholder="Enter code (e.g. RC001)"
                className={`bg-[#192257] border-blue-900/40 text-white ${!isCodeValid ? "border-red-500 focus:border-red-500" : ""
                  }`}
              />
              {!isCodeValid && (
                <p className="text-red-400 text-sm mt-1">
                  This code is already in use or invalid
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-blue-200">
                Description <span className="text-red-400">*</span>
              </Label>
              <Input
                id="edit-name"
                value={formDescr}
                onChange={(e) => setFormDescr(e.target.value)}
                placeholder="Enter description"
                className="bg-[#192257] border-blue-900/40 text-white"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end border-t border-blue-900/30 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setEditDialogOpen(false);
              }}
              className="bg-transparent border-blue-900/40 text-blue-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateCentre}
              disabled={!isFormValid || isValidating}
              className={`bg-blue-600 hover:bg-blue-700 text-white ${!isFormValid || isValidating
                ? "opacity-50 cursor-not-allowed"
                : ""
                }`}
            >
              {isValidating ? "Validating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog - Modified to hide delete button when users are associated */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md bg-[#0a1033] text-white border border-blue-900/40 p-0">
          <div className="p-6">
            <AlertDialogHeader className="mb-4">
              <AlertDialogTitle className="text-xl text-white">
                Delete Responsibility Centre
              </AlertDialogTitle>
              <AlertDialogDescription className="text-blue-300">
                Are you sure you want to delete this centre? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {centreToDelete && (
              <div className="bg-[#192257] p-4 rounded-md border border-blue-900/30 mb-6">
                <h4 className="text-sm font-medium text-blue-300 mb-3">
                  Centre Information
                </h4>
                <p className="text-white text-lg mb-1">
                  {centreToDelete.descr}
                </p>
                <p className="text-sm text-blue-300/70">
                  Code: {centreToDelete.code} • Current Users:{" "}
                  {centreToDelete.usersCount || 0}
                </p>

                {centreToDelete.usersCount > 0 && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                      <span className="text-sm text-yellow-300">
                        This centre has {centreToDelete.usersCount} associated
                        users. Deleting it will remove all user associations.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#192257] p-4 mt-2 border-t border-blue-900/40">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-transparent border-blue-900/40 text-blue-300 hover:bg-blue-900/20"
              >
                Cancel
              </Button>

              {/* Only show delete button if there are no associated users */}
              {centreToDelete && centreToDelete.usersCount === 0 && (
                <Button
                  onClick={handleDeleteCentre}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Centre
                </Button>
              )}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-[#1e2a4a] border border-blue-900/70 text-blue-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Bulk Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedCentres.length}{" "}
              responsibility centre
              {selectedCentres.length > 1 ? "s" : ""}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-blue-200 border border-blue-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-900/70 hover:bg-red-900 text-red-100"
            >
              Delete {selectedCentres.length} Centre
              {selectedCentres.length > 1 ? "s" : ""}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Associate Users Dialog - Professional UI with improved layout */}
      <Dialog
        open={assignUsersDialogOpen}
        onOpenChange={setAssignUsersDialogOpen}
      >
        <DialogContent className="sm:max-w-3xl flex flex-col bg-[#0a1033] text-white border border-blue-900/40 p-0 overflow-hidden max-h-[90vh]">
          {/* Header Section */}
          <div className="p-6 pb-4 border-b border-blue-900/30">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl text-white">
                Associate Users with Responsibility Centre
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                {centreToAssignUsers &&
                  `Select users to associate with "${centreToAssignUsers.code}"`}
              </DialogDescription>
            </DialogHeader>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-9 bg-[#192257] border-blue-900/40 text-white w-full"
              />
              {searchUserQuery && (
                <button
                  onClick={() => setSearchUserQuery("")}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex justify-between items-center mb-2">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setUserViewMode("unassociated")}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 ${viewMode === "unassociated"
                    ? "border-blue-500 text-blue-300"
                    : "border-transparent text-blue-500/50 hover:text-blue-400 hover:border-blue-500/30"
                    }`}
                >
                  Unassigned Users
                </button>
                <button
                  onClick={() => setUserViewMode("currentCenter")}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 ${viewMode === "currentCenter"
                    ? "border-blue-500 text-blue-300"
                    : "border-transparent text-blue-500/50 hover:text-blue-400 hover:border-blue-500/30"
                    }`}
                >
                  Current Users
                </button>
              </nav>

              {/* Add refresh button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (viewMode === "unassociated") {
                    refreshUnassignedUsersList();
                  } else {
                    refreshCurrentCenterUsersList();
                  }
                }}
                disabled={isLoadingUsers}
                className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 flex items-center gap-1"
                title="Refresh user list"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoadingUsers ? "animate-spin" : ""}`}
                />
                <span className="text-xs">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Users Content Area with fixed height */}
          <div className="flex-1 flex flex-col mx-6 my-4 min-h-0">
            {/* Content area */}
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-blue-300 ml-3">Loading users...</p>
              </div>
            ) : (
              <div className="border border-blue-900/30 rounded-md overflow-hidden flex flex-col flex-1">
                {/* Fixed table header */}
                <div className="bg-[#192257] border-b border-blue-900/30 p-2 flex justify-between items-center sticky top-0 z-10">
                  <div className="flex items-center">
                    <Checkbox
                      id="selectAllUsers"
                      checked={
                        filteredUsers.length > 0 &&
                        selectedUsers.length === filteredUsers.length
                      }
                      onCheckedChange={toggleSelectAllUsers}
                      className="border-blue-600"
                    />
                    <label
                      htmlFor="selectAllUsers"
                      className="ml-2 text-sm text-blue-200"
                    >
                      Select All ({filteredUsers.length})
                    </label>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-blue-600/20 text-blue-300 border-blue-600/40"
                  >
                    {selectedUsers.length} Selected
                  </Badge>
                </div>

                {/* Users list with fixed height */}
                <div
                  className="overflow-y-auto flex-1"
                  style={{
                    height: "320px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#2c3c8c #0f1642",
                  }}
                >
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-10 text-blue-300 flex flex-col items-center justify-center h-full">
                      <UsersRound className="h-10 w-10 mx-auto text-blue-800/50 mb-3" />
                      {viewMode === "unassociated"
                        ? "No unassigned users found"
                        : "No users are currently associated with this centre"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1">
                      {filteredUsers.map((user) => {
                        // Display name fallbacks
                        const displayName =
                          user.fullName ||
                          (user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : null) ||
                          user.username ||
                          user.email ||
                          `User #${user.id}`;

                        // User details
                        const userName = user.username || "";
                        const email = user.email || "";

                        // Is user already associated with this center?
                        const isAssociatedWithThisCenter =
                          user.responsibilityCentre &&
                          user.responsibilityCentre.id ===
                          centreToAssignUsers?.id;

                        return (
                          <div
                            key={user.id}
                            className={`border-b border-blue-900/10 last:border-b-0 ${isAssociatedWithThisCenter ? "bg-blue-900/20" : ""
                              }`}
                          >
                            <div className="flex items-center p-2 hover:bg-[#192257]/60">
                              {viewMode === "unassociated" ? (
                                <Checkbox
                                  id={`user-${user.id}`}
                                  checked={selectedUsers.includes(user.id)}
                                  onCheckedChange={() =>
                                    toggleUserSelection(user.id)
                                  }
                                  className="border-blue-600"
                                />
                              ) : (
                                <div className="w-4 flex justify-center">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                              )}
                              <div className="ml-3 flex-1">
                                <div className="font-medium text-blue-100">
                                  {displayName}
                                </div>
                                <div className="text-xs text-blue-300/70 flex items-center gap-2">
                                  {userName && (
                                    <span className="flex items-center">
                                      <UserIcon className="h-3 w-3 mr-1 text-blue-400" />
                                      {userName}
                                    </span>
                                  )}
                                  {email && (
                                    <span className="flex items-center">
                                      <Mail className="h-3 w-3 mr-1 text-blue-400" />
                                      {email}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {viewMode === "currentCenter" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer with buttons - fixed at bottom */}
          <div className="p-4 border-t border-blue-900/30 bg-[#0f1642] flex justify-end space-x-3 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssignUsersDialogOpen(false)}
              className="bg-transparent border-blue-800 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200"
            >
              Cancel
            </Button>

            {viewMode === "unassociated" && (
              <Button
                type="button"
                onClick={handleAssignUsers}
                disabled={selectedUsers.length === 0 || isLoadingUsers}
                className={`bg-blue-600 text-white hover:bg-blue-500 ${selectedUsers.length === 0 || isLoadingUsers
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                  }`}
              >
                {isLoadingUsers ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>Associate {selectedUsers.length} Users</>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog - Remove status display */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-[#0a1033] text-white border border-blue-900/40 p-0">
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl text-white">
                Responsibility Centre Details
              </DialogTitle>
              <DialogDescription className="text-blue-300">
                {centreDetails &&
                  `View and manage details for "${centreDetails.code}"`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-6">
              {/* Centre Information Card - Without status */}
              <div className="bg-[#192257] p-4 rounded-md border border-blue-900/30">
                <h3 className="text-lg font-medium text-white mb-4">
                  Centre Information
                </h3>

                {centreDetails && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-blue-300">Code</div>
                      <div className="text-white font-medium">
                        {centreDetails.code}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-300">Name</div>
                      <div className="text-white font-medium">
                        {centreDetails.descr}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-300">
                        Associated Users
                      </div>
                      <div className="text-white font-medium">
                        {centreDetails.usersCount || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-300">Documents</div>
                      <div className="text-white font-medium">
                        {centreDetails.documentsCount || 0}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Associated Users List */}
              <div className="flex-1 min-h-0">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-white">
                    Associated Users
                  </h3>

                  {/* Only keep the refresh button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshDetailsView}
                    disabled={isLoadingDetails}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 flex items-center gap-1"
                    title="Refresh user list"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isLoadingDetails ? "animate-spin" : ""
                        }`}
                    />
                    <span className="text-xs">Refresh</span>
                  </Button>
                </div>

                <div className="border border-blue-900/30 rounded-md bg-[#121c3e]">
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                      <p className="text-blue-300 ml-3">Loading users...</p>
                    </div>
                  ) : centreUsers.length === 0 ? (
                    <div className="text-center py-10 text-blue-300">
                      <UsersRound className="h-10 w-10 mx-auto text-blue-800/50 mb-3" />
                      No users associated with this centre
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px]" scrollHideDelay={0}>
                      <div className="grid grid-cols-1">
                        {/* Only render visible items - we can display max 50 at a time for performance */}
                        {centreUsers.slice(0, 50).map((user) => {
                          // Display name fallbacks
                          const displayName =
                            user.fullName ||
                            (user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : null) ||
                            user.username ||
                            user.email ||
                            `User #${user.id}`;

                          // User details
                          const userName = user.username || "";
                          const email = user.email || "";
                          const role = getRoleName(user);

                          return (
                            <div
                              key={user.id}
                              className="border-b border-blue-900/10 last:border-b-0"
                            >
                              <div className="flex items-center p-3 hover:bg-[#192257]/60">
                                <div className="w-4 flex justify-center">
                                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                                <div className="ml-3 flex-1">
                                  <div className="font-medium text-blue-100">
                                    {displayName}
                                  </div>
                                  <div className="text-xs text-blue-300/70 flex items-center gap-3 mt-1">
                                    {userName && (
                                      <span className="flex items-center">
                                        <UserIcon className="h-3 w-3 mr-1 text-blue-400" />
                                        {userName}
                                      </span>
                                    )}
                                    {email && (
                                      <span className="flex items-center">
                                        <Mail className="h-3 w-3 mr-1 text-blue-400" />
                                        {email}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveUser(user.id)}
                                  className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                >
                                  <UserMinus className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          );
                        })}

                        {centreUsers.length > 50 && (
                          <div className="text-center py-3 text-sm text-blue-400 bg-blue-900/20 border-t border-blue-900/30">
                            Showing 50 of {centreUsers.length} users
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#192257] p-4 mt-2 border-t border-blue-900/40">
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowDetailsDialog(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
});

ResponsibilityCentreManagement.displayName = "ResponsibilityCentreManagement";

export default ResponsibilityCentreManagement;
