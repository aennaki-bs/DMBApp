import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import responsibilityCentreService from "@/services/responsibilityCentreService";
import {
  ResponsibilityCentre,
  CreateResponsibilityCentreRequest,
  UpdateResponsibilityCentreRequest,
  User,
} from "@/models/responsibilityCentre";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

// Simple debounce utility
const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<F>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
};

export default function ResponsibilityCentreManagement() {
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

  // Search fields
  const searchFields = [
    { id: "all", label: "All Fields" },
    { id: "code", label: "Code" },
    { id: "descr", label: "Description" },
  ];

  // Fetch responsibility centres on component mount
  useEffect(() => {
    fetchResponsibilityCentres();
  }, []);

  // Handle selecting all centres when selectAll changes
  useEffect(() => {
    if (selectAll) {
      setSelectedCentres(filteredCentres.map((centre) => centre.id));
    } else {
      setSelectedCentres([]);
    }
  }, [selectAll, filteredCentres]);

  // Validate form inputs
  useEffect(() => {
    setIsFormValid(
      formCode.trim() !== "" && formDescr.trim() !== "" && isCodeValid
    );
  }, [formCode, formDescr, isCodeValid]);

  // Filter centres based on search criteria only (not active status)
  useEffect(() => {
    let filtered = [...centres];

    // Apply search
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();

      if (searchField === "all") {
        filtered = filtered.filter(
          (centre) =>
            centre.code.toLowerCase().includes(query) ||
            centre.descr.toLowerCase().includes(query)
        );
      } else if (searchField === "code") {
        filtered = filtered.filter((centre) =>
          centre.code.toLowerCase().includes(query)
        );
      } else if (searchField === "descr") {
        filtered = filtered.filter((centre) =>
          centre.descr.toLowerCase().includes(query)
        );
      }
    }

    setFilteredCentres(filtered);
  }, [searchQuery, searchField, centres]);

  // Filter users based on search query and view mode
  useEffect(() => {
    if (!centreToAssignUsers) return;

    // Skip if we're not currently showing the dialog
    if (!assignUsersDialogOpen) return;

    // If no search term, show all users based on current view mode
    if (!searchUserQuery.trim()) {
      if (viewMode === "currentCenter") {
        setFilteredUsers(associatedWithCurrentCenter);
      } else {
        setFilteredUsers(unassociatedUsers);
      }
      return;
    }

    // Apply search filter
    const lowerCaseQuery = searchUserQuery.toLowerCase();
    const usersToFilter =
      viewMode === "currentCenter"
        ? associatedWithCurrentCenter
        : unassociatedUsers;

    // Use memoization to avoid filtering large lists repeatedly
    const filtered = usersToFilter.filter((user) => {
      const fullName =
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim();
      const email = user.email || "";
      const username = user.username || "";

      return (
        fullName.toLowerCase().includes(lowerCaseQuery) ||
        email.toLowerCase().includes(lowerCaseQuery) ||
        username.toLowerCase().includes(lowerCaseQuery)
      );
    });

    setFilteredUsers(filtered);
  }, [
    searchUserQuery,
    viewMode,
    associatedWithCurrentCenter,
    unassociatedUsers,
    assignUsersDialogOpen,
    centreToAssignUsers,
  ]);

  const fetchResponsibilityCentres = async () => {
    try {
      setIsLoading(true);
      const response =
        await responsibilityCentreService.getAllResponsibilityCentres();
      setCentres(response);
      setFilteredCentres(response);
    } catch (error) {
      console.error("Failed to fetch responsibility centres:", error);
      toast.error("Failed to load responsibility centres");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCentre = async () => {
    if (!isFormValid) return;

    try {
      const newCentre: CreateResponsibilityCentreRequest = {
        code: formCode,
        descr: formDescr,
      };

      const response =
        await responsibilityCentreService.createResponsibilityCentre(newCentre);
      setCentres((prev) => [...prev, response]);
      toast.success(
        `Responsibility Centre "${response.descr}" created successfully`
      );
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create responsibility centre:", error);
      toast.error("Failed to create responsibility centre");
    }
  };

  const handleUpdateCentre = async () => {
    if (!centreToEdit || !isFormValid) return;

    try {
      const updatedCentre: UpdateResponsibilityCentreRequest = {
        code: formCode,
        descr: formDescr,
      };

      await responsibilityCentreService.updateResponsibilityCentre(
        centreToEdit.id,
        updatedCentre
      );
      setCentres((prev) =>
        prev.map((centre) =>
          centre.id === centreToEdit.id
            ? { ...centre, ...updatedCentre }
            : centre
        )
      );
      toast.success(
        `Responsibility Centre "${formDescr}" updated successfully`
      );
      setEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to update responsibility centre:", error);
      toast.error("Failed to update responsibility centre");
    }
  };

  const handleDeleteCentre = async () => {
    if (!centreToDelete) return;

    try {
      await responsibilityCentreService.deleteResponsibilityCentre(
        centreToDelete.id
      );
      setCentres((prev) =>
        prev.filter((centre) => centre.id !== centreToDelete.id)
      );
      toast.success(
        `Responsibility Centre "${centreToDelete.descr}" deleted successfully`
      );
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete responsibility centre:", error);
      toast.error("Failed to delete responsibility centre");
    }
  };

  const validateCode = async (code: string, id?: number) => {
    if (!code.trim()) {
      setIsCodeValid(false);
      return;
    }

    try {
      setIsValidating(true);
      const isValid =
        await responsibilityCentreService.validateResponsibilityCentreCode({
          code,
          id,
        });
      setIsCodeValid(isValid);
      if (!isValid) {
        toast.error(`Code "${code}" is already in use`);
      }
    } catch (error) {
      console.error("Failed to validate code:", error);
      setIsCodeValid(false);
      toast.error("Failed to validate code");
    } finally {
      setIsValidating(false);
    }
  };

  const openEditDialog = (centre: ResponsibilityCentre) => {
    setCentreToEdit(centre);
    setFormCode(centre.code);
    setFormDescr(centre.descr);
    setIsCodeValid(true); // Assume the existing code is valid
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (centre: ResponsibilityCentre) => {
    setCentreToDelete(centre);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormCode("");
    setFormDescr("");
    setIsCodeValid(true);
    setCentreToEdit(null);
  };

  const toggleCentreSelection = (id: number) => {
    setSelectedCentres((prev) =>
      prev.includes(id)
        ? prev.filter((centreId) => centreId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id));
    }
  };

  // Debounced version of validateCode to prevent excessive API calls
  const debouncedValidateCode = debounce(validateCode, 500);

  // Enhance the fetchUsers function to properly load users based on different contexts
  const fetchUsers = async (forRemovalOnly: boolean = false) => {
    if (!centreToAssignUsers) {
      setIsLoadingUsers(false);
      toast.error("No centre selected");
      return;
    }

    setIsLoadingUsers(true);
    try {
      let fetchedUsers: User[] = [];

      // For removal dialog or current center tab, get users from the center's details
      if (forRemovalOnly || viewMode === "currentCenter") {
        // Get the center details which includes users array
        const centerDetails =
          await responsibilityCentreService.getResponsibilityCentreById(
            centreToAssignUsers.id
          );
        fetchedUsers = centerDetails.users || [];
      } else {
        // For the associate dialog, get unassigned users
        fetchedUsers = await responsibilityCentreService.getUnassignedUsers();
      }

      // Check if no users were returned
      if (!fetchedUsers || fetchedUsers.length === 0) {
        setFilteredUsers([]);
        setAvailableUsers([]);
        if (viewMode === "currentCenter") {
          setAssociatedWithCurrentCenter([]);
        } else {
          setUnassociatedUsers([]);
        }
        setIsLoadingUsers(false);
        return;
      }

      // Process users to ensure they have fullName
      const processedUsers = fetchedUsers.map((user) => {
        // If fullName doesn't exist but firstName or lastName do, construct fullName
        if (!user.fullName && (user.firstName || user.lastName)) {
          return {
            ...user,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          };
        }
        return user;
      });

      // Set all the user state variables
      setAvailableUsers(processedUsers);

      if (forRemovalOnly || viewMode === "currentCenter") {
        // For viewing associated users
        setAssociatedWithCurrentCenter(processedUsers);
        setFilteredUsers(processedUsers);
      } else {
        // For associating new users
        setUnassociatedUsers(processedUsers);
        setFilteredUsers(processedUsers);
      }

      // Filter by search term if needed
      if (searchUserQuery) {
        const lowerCaseQuery = searchUserQuery.toLowerCase();
        setFilteredUsers(
          processedUsers.filter((user) => {
            const fullName =
              user.fullName ||
              `${user.firstName || ""} ${user.lastName || ""}`.trim();
            const email = user.email || "";
            const username = user.username || "";

            return (
              fullName.toLowerCase().includes(lowerCaseQuery) ||
              email.toLowerCase().includes(lowerCaseQuery) ||
              username.toLowerCase().includes(lowerCaseQuery)
            );
          })
        );
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setFilteredUsers([]);
      setAvailableUsers([]);
      if (viewMode === "currentCenter") {
        setAssociatedWithCurrentCenter([]);
      } else {
        setUnassociatedUsers([]);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Update the setUserViewMode function to handle tab switching with deleted users tracking
  const setUserViewMode = (mode: "unassociated" | "currentCenter") => {
    setViewMode(mode);
    setSelectedUsers([]); // Clear selections when switching views

    // If switching to unassigned users tab and users have been deleted, refresh that list
    if (mode === "unassociated" && hasDeletedUsers) {
      refreshUnassignedUsersList();
      // Reset the tracking after refreshing
      setHasDeletedUsers(false);
    } else if (mode === "currentCenter") {
      // Refresh current center users
      refreshCurrentCenterUsersList();
    }
  };

  // Modify the openAssociateUsersDialog function to properly open the dialog and load data
  const openAssociateUsersDialog = async (centre: ResponsibilityCentre) => {
    try {
      // Reset tracking state when opening dialog
      setHasDeletedUsers(false);

      // Set states before fetching data
      setCentreToAssignUsers(centre);
      setSearchUserQuery("");
      setSelectedUsers([]);
      setViewMode("unassociated");
      setIsLoadingUsers(true);

      // Open dialog first
      setAssignUsersDialogOpen(true);

      // Fetch unassigned users immediately
      const unassignedUsers =
        await responsibilityCentreService.getUnassignedUsers();

      // Process users to ensure they have fullName
      const processedUsers = unassignedUsers.map((user) => {
        if (!user.fullName && (user.firstName || user.lastName)) {
          return {
            ...user,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          };
        }
        return user;
      });

      // Set the unassigned users data
      setUnassociatedUsers(processedUsers);

      if (viewMode === "unassociated") {
        setFilteredUsers(processedUsers);
      }

      // Also fetch users associated with this center
      const centerDetails =
        await responsibilityCentreService.getResponsibilityCentreById(
          centre.id
        );

      // Process associated users
      const associatedUsers = (centerDetails.users || []).map((user) => {
        if (!user.fullName && (user.firstName || user.lastName)) {
          return {
            ...user,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          };
        }
        return user;
      });

      setAssociatedWithCurrentCenter(associatedUsers);

      if (viewMode === "currentCenter") {
        setFilteredUsers(associatedUsers);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users. Please try again.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Add a function to specifically refresh only unassigned users
  const refreshUnassignedUsersList = async () => {
    if (!centreToAssignUsers) return;

    setIsLoadingUsers(true);
    try {
      const unassignedUsers =
        await responsibilityCentreService.getUnassignedUsers();

      // Process users to ensure they have fullName
      const processedUsers = unassignedUsers.map((user) => {
        if (!user.fullName && (user.firstName || user.lastName)) {
          return {
            ...user,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          };
        }
        return user;
      });

      setUnassociatedUsers(processedUsers);

      if (viewMode === "unassociated") {
        setFilteredUsers(processedUsers);
      }
    } catch (error) {
      console.error("Failed to refresh unassigned users:", error);
      toast.error("Failed to refresh unassigned users list");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Add a function to specifically refresh only current center users
  const refreshCurrentCenterUsersList = async () => {
    if (!centreToAssignUsers) return;

    setIsLoadingUsers(true);
    try {
      const centerDetails =
        await responsibilityCentreService.getResponsibilityCentreById(
          centreToAssignUsers.id
        );

      // Process users to ensure they have fullName
      const processedUsers = (centerDetails.users || []).map((user) => {
        if (!user.fullName && (user.firstName || user.lastName)) {
          return {
            ...user,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          };
        }
        return user;
      });

      setAssociatedWithCurrentCenter(processedUsers);

      if (viewMode === "currentCenter") {
        setFilteredUsers(processedUsers);
      }
    } catch (error) {
      console.error("Failed to refresh current center users:", error);
      toast.error("Failed to refresh current users list");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Modify the handleRemoveUser function to properly update the user list in details view
  const handleRemoveUser = async (userId: number) => {
    if (!centreToAssignUsers) return;

    try {
      setIsLoadingUsers(true);
      const response = await responsibilityCentreService.removeUsers([userId]);

      if (response.usersSuccessfullyAssociated > 0) {
        // Update the users count in the centre - ensure it never goes below 0
        setCentres((prev) =>
          prev.map((centre) =>
            centre.id === centreToAssignUsers.id
              ? {
                  ...centre,
                  usersCount: Math.max(0, (centre.usersCount || 0) - 1),
                }
              : centre
          )
        );

        toast.success("User successfully removed from this centre");

        // Set the tracking flag to true - we've deleted a user
        setHasDeletedUsers(true);

        // Just update the current view without switching tabs
        if (viewMode === "currentCenter") {
          // Update the filtered users list by removing the user
          setFilteredUsers((prev) => prev.filter((user) => user.id !== userId));

          // Update the associated users list
          setAssociatedWithCurrentCenter((prev) =>
            prev.filter((user) => user.id !== userId)
          );
        }

        // If this is from the details view, also update the centreUsers list
        if (showDetailsDialog && centreDetails) {
          setCentreUsers((prev) => prev.filter((user) => user.id !== userId));

          // Update the centreDetails object
          setCentreDetails({
            ...centreDetails,
            usersCount: Math.max(0, (centreDetails.usersCount || 0) - 1),
          });
        }
      } else if (response.errors && response.errors.length > 0) {
        toast.error(`Failed to remove user: ${response.errors.join(", ")}`);
      }
    } catch (error) {
      console.error("Failed to remove user:", error);
      toast.error("Failed to remove user from responsibility centre");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Update the handleAssignUsers function to work with the new interface
  const handleAssignUsers = async () => {
    if (!centreToAssignUsers || selectedUsers.length === 0) return;

    try {
      const response = await responsibilityCentreService.associateUsers(
        centreToAssignUsers.id,
        selectedUsers
      );

      if (response.usersSuccessfullyAssociated > 0) {
        // Update the users count in the centre
        setCentres((prev) =>
          prev.map((centre) =>
            centre.id === centreToAssignUsers.id
              ? {
                  ...centre,
                  usersCount:
                    (centre.usersCount || 0) +
                    response.usersSuccessfullyAssociated,
                }
              : centre
          )
        );

        toast.success(
          `Successfully associated ${response.usersSuccessfullyAssociated} user(s) with the responsibility centre`
        );

        // Close the dialog and reset selections
        setSelectedUsers([]);
        setAssignUsersDialogOpen(false);
      } else if (response.errors && response.errors.length > 0) {
        toast.error(`Failed to associate users: ${response.errors.join(", ")}`);
      }
    } catch (error) {
      console.error("Failed to associate users:", error);
      toast.error("Failed to associate users with responsibility centre");
    }
  };

  // Update openDetailsDialog to use the users array from the centre details
  const openDetailsDialog = async (centre: ResponsibilityCentre) => {
    setIsLoadingDetails(true);
    setCentreDetails(null);
    setCentreUsers([]);
    setUserIdsToRemove([]);
    setShowDetailsDialog(true);

    try {
      // Fetch centre details which includes the users array
      const details =
        await responsibilityCentreService.getResponsibilityCentreById(
          centre.id
        );

      // Ensure usersCount is at least 0 (never negative)
      if (details.usersCount < 0) {
        details.usersCount = 0;
      }

      setCentreDetails(details);

      // Process users to ensure they have fullName
      const processedUsers = (details.users || []).map((user) => {
        // If fullName doesn't exist but firstName or lastName do, construct fullName
        if (!user.fullName && (user.firstName || user.lastName)) {
          return {
            ...user,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          };
        }
        return user;
      });

      setCentreUsers(processedUsers);
    } catch (error) {
      console.error("Error fetching responsibility centre details:", error);
      toast.error("Failed to load responsibility centre details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Add function to handle removing users from the details view
  const handleRemoveUsersFromDetails = async () => {
    if (!centreDetails || userIdsToRemove.length === 0) return;

    try {
      const response = await responsibilityCentreService.removeUsers(
        userIdsToRemove
      );

      if (response.usersSuccessfullyAssociated > 0) {
        // Update the users count in the centre
        setCentres((prev) =>
          prev.map((centre) =>
            centre.id === centreDetails.id
              ? {
                  ...centre,
                  usersCount:
                    (centre.usersCount || 0) -
                    response.usersSuccessfullyAssociated,
                }
              : centre
          )
        );

        // Update the local users list
        setCentreUsers((prev) =>
          prev.filter((user) => !userIdsToRemove.includes(user.id))
        );

        // Update the centre details
        if (centreDetails) {
          setCentreDetails({
            ...centreDetails,
            usersCount:
              (centreDetails.usersCount || 0) -
              response.usersSuccessfullyAssociated,
          });
        }

        toast.success(
          `Successfully removed ${response.usersSuccessfullyAssociated} user(s) from ${centreDetails.descr}`
        );

        setUserIdsToRemove([]);
      }

      if (response.errors && response.errors.length > 0) {
        toast.error(
          `Some users could not be removed: ${response.errors.join(", ")}`
        );
      }
    } catch (error) {
      console.error("Failed to remove users:", error);
      toast.error("Failed to remove users from responsibility centre");
    }
  };

  // Toggle user selection for removal in the details view
  const toggleUserRemoval = (userId: number) => {
    setUserIdsToRemove((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Fix for the user role display in details dialog
  // Update the role handling in details dialog to properly access the role object
  const getRoleName = (user: User): string => {
    if (user.role && typeof user.role === "object" && "roleName" in user.role) {
      return user.role.roleName;
    } else if (user.userType) {
      return user.userType;
    }
    return "User";
  };

  // Add function to force refresh details view
  const refreshDetailsView = async () => {
    if (!centreDetails) return;

    setIsLoadingDetails(true);
    try {
      // Fetch latest centre details
      const details =
        await responsibilityCentreService.getResponsibilityCentreById(
          centreDetails.id
        );

      // Ensure usersCount is at least 0 (never negative)
      if (details.usersCount < 0) {
        details.usersCount = 0;
      }

      setCentreDetails(details);

      // Process users to ensure they have fullName
      const processedUsers = (details.users || []).map((user) => {
        if (!user.fullName && (user.firstName || user.lastName)) {
          return {
            ...user,
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          };
        }
        return user;
      });

      setCentreUsers(processedUsers);
    } catch (error) {
      console.error("Error refreshing responsibility centre details:", error);
      toast.error("Failed to refresh details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Building2 className="mr-3 h-6 w-6 text-blue-400" />{" "}
              Responsibility Centres
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage responsibility centres for your organization
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                resetForm();
                setCreateDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Centre
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters - Simplified without filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center mb-4">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Select value={searchField} onValueChange={setSearchField}>
            <SelectTrigger className="w-[140px] bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500">
              <SelectValue>
                {searchFields.find((field) => field.id === searchField)
                  ?.label || "All Fields"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
              {searchFields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-400" />
            <Input
              type="search"
              placeholder="Search responsibility centres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-blue-400 hover:text-blue-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <Card className="bg-[#0f1642] border-blue-900/30 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">
            Responsibility Centres
          </CardTitle>
          <p className="text-sm text-blue-300/70">
            {filteredCentres.length}{" "}
            {filteredCentres.length === 1 ? "centre" : "centres"}{" "}
            {searchQuery ? "found" : "total"}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-blue-300 mt-4">
                Loading responsibility centres...
              </p>
            </div>
          ) : centres.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-blue-900/50 rounded-lg bg-[#182052]/50">
              <Building2 className="h-16 w-16 mx-auto text-blue-800/50 mb-4" />
              <h3 className="text-xl font-medium text-blue-300 mb-2">
                No Responsibility Centres
              </h3>
              <p className="text-blue-400/70 max-w-md mx-auto mb-6">
                You haven't created any responsibility centres yet. Create one
                to get started.
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setCreateDialogOpen(true);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Responsibility Centre
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-blue-900/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#192254] hover:bg-[#192254]">
                    <TableHead className="w-[100px] text-blue-300">
                      Code
                    </TableHead>
                    <TableHead className="text-blue-300">Description</TableHead>
                    <TableHead className="text-blue-300 w-[100px] text-center">
                      Users
                    </TableHead>
                    <TableHead className="text-blue-300 w-[100px] text-center">
                      Documents
                    </TableHead>
                    <TableHead className="text-blue-300 text-right w-[150px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCentres.map((centre) => (
                    <TableRow
                      key={centre.id}
                      className="hover:bg-[#192254]/50 bg-[#0e1539]"
                    >
                      <TableCell className="font-medium text-blue-300">
                        {centre.code}
                      </TableCell>
                      <TableCell className="text-blue-100">
                        {centre.descr}
                      </TableCell>
                      <TableCell className="text-blue-100 text-center">
                        <Badge
                          variant="outline"
                          className="bg-blue-900/20 text-blue-300 border-blue-900/40"
                        >
                          {Math.max(0, centre.usersCount || 0)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-blue-100 text-center">
                        <Badge
                          variant="outline"
                          className="bg-purple-900/20 text-purple-300 border-purple-900/40"
                        >
                          {centre.documentsCount || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            onClick={() => openAssociateUsersDialog(centre)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            title="Associate Users"
                          >
                            <UsersRound className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => openDetailsDialog(centre)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => openEditDialog(centre)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(centre)}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

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
                className={`bg-[#192257] border-blue-900/40 text-white ${
                  !isCodeValid ? "border-red-500 focus:border-red-500" : ""
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
              className={`bg-blue-600 hover:bg-blue-700 text-white ${
                !isFormValid || isValidating
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
                  className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                    viewMode === "unassociated"
                      ? "border-blue-500 text-blue-300"
                      : "border-transparent text-blue-500/50 hover:text-blue-400 hover:border-blue-500/30"
                  }`}
                >
                  Unassigned Users
                </button>
                <button
                  onClick={() => setUserViewMode("currentCenter")}
                  className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                    viewMode === "currentCenter"
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
                            className={`border-b border-blue-900/10 last:border-b-0 ${
                              isAssociatedWithThisCenter ? "bg-blue-900/20" : ""
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
                className={`bg-blue-600 text-white hover:bg-blue-500 ${
                  selectedUsers.length === 0 || isLoadingUsers
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
                      className={`h-4 w-4 ${
                        isLoadingDetails ? "animate-spin" : ""
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
                        {/* Only render visible items - we can display max 100 at a time for performance */}
                        {centreUsers.slice(0, 100).map((user) => {
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
                                    {role && (
                                      <span className="flex items-center">
                                        <Shield className="h-3 w-3 mr-1 text-blue-400" />
                                        {role}
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

                        {centreUsers.length > 100 && (
                          <div className="text-center py-3 text-sm text-blue-400 bg-blue-900/20 border-t border-blue-900/30">
                            Showing 100 of {centreUsers.length} users
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
    </div>
  );
}
