import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Trash2,
  Search,
  UserCog,
  User,
  UserPlus,
  LayoutGrid,
  LayoutList,
  UserX,
  CheckCircle2,
  Filter,
  PencilIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
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
import approvalService from "@/services/approvalService";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox, ComboboxOption } from "@/components/ui/combobox";
import { DataTable, Column } from "@/components/ui/data-table";
import { UserOption } from "@/components/user/UserSearchSelect";
import ApproverCreateWizard from "@/components/approval/ApproverCreateWizard";
import ApproverEditWizard from "@/components/approval/ApproverEditWizard";

interface Approver {
  id: number;
  userId: number;
  username: string;
  comment?: string;
  stepId?: number;
  stepTitle?: string;
}

interface CreateApproverRequest {
  userId: number;
  stepId?: number;
  comment?: string;
}

export default function ApproversManagement() {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [filteredApprovers, setFilteredApprovers] = useState<Approver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [approverToEdit, setApproverToEdit] = useState<Approver | null>(null);
  const [approverToDelete, setApproverToDelete] = useState<Approver | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedApprovers, setSelectedApprovers] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Define table columns
  const columns: Column<Approver>[] = [
    {
      id: "username",
      header: "Approver",
      accessorKey: "username",
      cell: (row) => (
        <div className="font-medium text-blue-200 flex items-center">
          <User className="h-4 w-4 mr-2 text-blue-400" />
          {row.username}
        </div>
      ),
    },
    {
      id: "comment",
      header: "Comment",
      accessorKey: "comment",
      cell: (row) => (
        <>
          {row.comment ? (
            <span className="text-blue-200">{row.comment}</span>
          ) : (
            <span className="text-blue-300/50 text-sm italic">No comment</span>
          )}
        </>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditApprover(row)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 border-blue-800"
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeleteDialog(row)}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/40 border-red-900/50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Define bulk actions
  const bulkActions = [
    { label: "Delete Selected", value: "delete", color: "red" },
  ];

  // Fetch approvers on component mount
  useEffect(() => {
    fetchApprovers();
  }, []);

  // Handle selecting all approvers when selectAll changes
  useEffect(() => {
    if (selectAll) {
      setSelectedApprovers(filteredApprovers.map((approver) => approver.id));
    } else {
      setSelectedApprovers([]);
    }
  }, [selectAll, filteredApprovers]);

  // Filter approvers when search query or approvers change
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredApprovers(approvers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = approvers.filter(
        (approver) =>
          approver.username.toLowerCase().includes(query) ||
          approver.comment?.toLowerCase().includes(query)
      );
      setFilteredApprovers(filtered);
    }
  }, [searchQuery, approvers]);

  const fetchApprovers = async () => {
    try {
      setIsLoading(true);
      const response = await approvalService.getAllApprovators();
      setApprovers(response);
      setFilteredApprovers(response);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
      toast.error("Failed to load approvers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteApprover = async () => {
    if (!approverToDelete) return;

    try {
      await approvalService.deleteApprovator(approverToDelete.id);
      setApprovers((prev) =>
        prev.filter((approver) => approver.id !== approverToDelete.id)
      );
      toast.success(
        `Approver "${approverToDelete.username}" deleted successfully`
      );
    } catch (error) {
      console.error(
        `Failed to delete approver with ID ${approverToDelete.id}:`,
        error
      );
      toast.error("Failed to delete approver");
    } finally {
      setApproverToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedApprovers.length === 0) return;

    try {
      // Ideally, we would have a bulk delete endpoint, but for now we'll delete one by one
      const deletePromises = selectedApprovers.map((id) =>
        approvalService.deleteApprovator(id)
      );

      await Promise.all(deletePromises);

      setApprovers((prev) =>
        prev.filter((approver) => !selectedApprovers.includes(approver.id))
      );

      toast.success(
        `${selectedApprovers.length} approvers deleted successfully`
      );
      setSelectedApprovers([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to delete approvers:", error);
      toast.error("Failed to delete approvers");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (approver: Approver) => {
    setApproverToDelete(approver);
    setDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    if (selectedApprovers.length === 0) {
      toast.error("Please select at least one approver to delete");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const resetForm = () => {
    // This function is kept for compatibility with the onOpenChange handler
    // but no longer needs to reset any form fields
  };

  const toggleApproverSelection = (id: number) => {
    setSelectedApprovers((prev) =>
      prev.includes(id)
        ? prev.filter((approverId) => approverId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleViewModeChange = (mode: "list" | "card") => {
    // Force a re-render by using a state update function
    setViewMode((currentMode) => {
      // Only reset selection if the mode is actually changing
      if (currentMode !== mode) {
        setSelectedApprovers([]);
        setSelectAll(false);
      }
      return mode;
    });

    // Log to console for debugging purposes
    console.log(`View mode changed to: ${mode}`);
  };

  const handleBulkActions = (action: string, selectedItems: Approver[]) => {
    if (action === "delete") {
      openBulkDeleteDialog();
    }
  };

  const handleRowSelect = (ids: (string | number)[]) => {
    setSelectedApprovers(ids as number[]);
  };

  const handleEditApprover = (approver: Approver) => {
    setApproverToEdit(approver);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    fetchApprovers();
  };

  const renderTableView = () => (
    <div className="bg-[#182047] border border-blue-900/30 rounded-lg shadow-md overflow-hidden">
      <Table>
        <TableHeader className="bg-[#1a2c6b]/30">
          <TableRow className="hover:bg-[#1a2c6b]/50 border-b border-blue-900/20">
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectAll}
                onCheckedChange={toggleSelectAll}
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </TableHead>
            <TableHead className="text-blue-200 font-medium">
              Approver
            </TableHead>
            <TableHead className="text-blue-200 font-medium">Comment</TableHead>
            <TableHead className="text-blue-200 font-medium w-[220px]">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow
                key={`loading-${index}`}
                className="hover:bg-[#1a2c6b]/20 border-b border-blue-900/10"
              >
                <TableCell>
                  <Skeleton className="h-4 w-4 bg-blue-950/40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[180px] bg-blue-950/40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[200px] bg-blue-950/40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md bg-blue-950/40" />
                </TableCell>
              </TableRow>
            ))
          ) : filteredApprovers.length === 0 ? (
            <TableRow className="hover:bg-[#1a2c6b]/20">
              <TableCell colSpan={4} className="h-24 text-center">
                {searchQuery.trim() !== "" ? (
                  <div className="flex flex-col items-center justify-center text-blue-300/70 py-4">
                    <Search className="h-10 w-10 mb-3 text-blue-400/50" />
                    <p className="text-lg mb-1">
                      No approvers found matching "{searchQuery}"
                    </p>
                    <Button
                      variant="link"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-blue-400"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-blue-300/70 py-4">
                    <UserCog className="h-10 w-10 mb-3 text-blue-400/50" />
                    <p className="text-lg mb-1">No approvers created yet</p>
                    <Button
                      variant="link"
                      onClick={() => setCreateDialogOpen(true)}
                      className="mt-2 text-blue-400"
                    >
                      Create your first approver
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            filteredApprovers.map((approver) => (
              <TableRow
                key={approver.id}
                className={`hover:bg-[#1a2c6b]/20 border-b border-blue-900/10 ${
                  selectedApprovers.includes(approver.id)
                    ? "bg-[#1a2c6b]/30"
                    : ""
                }`}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedApprovers.includes(approver.id)}
                    onCheckedChange={() => toggleApproverSelection(approver.id)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                </TableCell>
                <TableCell className="font-medium text-blue-200 flex items-center">
                  <User className="h-4 w-4 mr-2 text-blue-400" />
                  {approver.username}
                </TableCell>
                <TableCell>
                  {approver.comment ? (
                    <span className="text-blue-200">{approver.comment}</span>
                  ) : (
                    <span className="text-blue-300/50 text-sm italic">
                      No comment
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditApprover(approver)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 border-blue-800"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDeleteDialog(approver)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/40 border-red-900/50"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mt-1">
      {isLoading ? (
        // Loading skeletons
        Array.from({ length: 8 }).map((_, index) => (
          <Card
            key={`loading-card-${index}`}
            className="bg-[#182047] border border-blue-900/30 shadow-md opacity-60"
          >
            <CardHeader className="p-4 space-y-4">
              <Skeleton className="h-6 w-1/2 bg-blue-950/40" />
              <Skeleton className="h-4 w-3/4 bg-blue-950/40" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-16 w-full bg-blue-950/40" />
            </CardContent>
            <CardFooter className="p-4 border-t border-blue-900/20">
              <Skeleton className="h-8 w-8 rounded-md bg-blue-950/40" />
            </CardFooter>
          </Card>
        ))
      ) : filteredApprovers.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center text-blue-300/70 py-10 bg-[#182047] border border-blue-900/30 rounded-lg">
          {searchQuery.trim() !== "" ? (
            <>
              <Search className="h-10 w-10 mb-3 text-blue-400/50" />
              <p className="text-lg mb-1">
                No approvers found matching "{searchQuery}"
              </p>
              <Button
                variant="link"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-blue-400"
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <UserCog className="h-10 w-10 mb-3 text-blue-400/50" />
              <p className="text-lg mb-1">No approvers created yet</p>
              <Button
                variant="link"
                onClick={() => setCreateDialogOpen(true)}
                className="mt-2 text-blue-400"
              >
                Create your first approver
              </Button>
            </>
          )}
        </div>
      ) : (
        filteredApprovers.map((approver) => (
          <Card
            key={approver.id}
            className={`bg-[#182047] hover:bg-[#1e2a62]/40 transition-all duration-200 border ${
              selectedApprovers.includes(approver.id)
                ? "border-blue-500 shadow-md shadow-blue-500/20"
                : "border-blue-900/30"
            } cursor-pointer transform hover:-translate-y-1 hover:shadow-lg`}
            onClick={() => toggleApproverSelection(approver.id)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedApprovers.includes(approver.id)}
                    onCheckedChange={() => toggleApproverSelection(approver.id)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <CardTitle className="text-md font-medium text-blue-200 flex items-center">
                      <User className="h-4 w-4 mr-2 text-blue-400" />
                      {approver.username}
                    </CardTitle>
                    <p className="text-xs text-blue-400/70 mt-1">
                      ID: {approver.id}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditApprover(approver);
                    }}
                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(approver);
                    }}
                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="mt-2 min-h-[60px]">
                <p className="text-sm font-medium text-blue-300/80 mb-1">
                  Comment:
                </p>
                {approver.comment ? (
                  <p className="text-sm text-blue-200">{approver.comment}</p>
                ) : (
                  <p className="text-sm text-blue-300/50 italic">No comment</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-end">
              <div
                className={`rounded-full w-2 h-2 ${
                  selectedApprovers.includes(approver.id)
                    ? "bg-blue-500"
                    : "bg-blue-900/30"
                }`}
              ></div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <UserCog className="mr-3 h-6 w-6 text-blue-400" /> Approvers
              Management
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage individual approvers for document workflows
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            New Approver
          </Button>
        </div>
      </div>

      {/* Search and Tools Section */}
      <div className="bg-[#1e2a4a] border border-blue-900/40 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Search approvers..."
              className="pl-10 bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 hover:bg-blue-800/40 shadow-sm rounded-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* View Toggle Buttons */}
            <div className="bg-[#101a3f] rounded-md border border-blue-900/40 flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewModeChange("list")}
                className={`rounded-r-none transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-blue-800/50 text-white"
                    : "text-blue-300/70 hover:text-blue-200 hover:bg-blue-900/30"
                }`}
              >
                <LayoutList className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewModeChange("card")}
                className={`rounded-l-none transition-all duration-200 ${
                  viewMode === "card"
                    ? "bg-blue-800/50 text-white"
                    : "text-blue-300/70 hover:text-blue-200 hover:bg-blue-900/30"
                }`}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedApprovers.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteDialog}
                className="bg-red-700/70 hover:bg-red-700 text-white"
              >
                <UserX className="h-4 w-4 mr-2" />
                Delete Selected ({selectedApprovers.length})
              </Button>
            )}
          </div>
        </div>

        {/* Selection Info */}
        {selectedApprovers.length > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-800/50">
            <div className="flex items-center gap-2 text-blue-300">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>
                {selectedApprovers.length} approver
                {selectedApprovers.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedApprovers([])}
              className="text-blue-400 hover:text-blue-300"
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>

      {/* Content - Table or Cards based on viewMode */}
      <div className="mt-6">
        {viewMode === "list" ? renderTableView() : renderCardView()}
      </div>

      {/* Selection summary area displayed at the bottom */}
      {selectedApprovers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a1033]/90 backdrop-blur-sm py-3 px-6 border-t border-blue-900/40 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 text-white px-3 py-1 text-sm">
              {selectedApprovers.length} selected
            </Badge>
            <span className="text-blue-200">
              {selectedApprovers.length === 1
                ? "1 approver selected"
                : `${selectedApprovers.length} approvers selected`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedApprovers([])}
              className="border-blue-500/30 text-blue-300 hover:bg-blue-900/20"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={openBulkDeleteDialog}
              className="bg-red-600/80 hover:bg-red-700 text-white"
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Create Approver Wizard */}
      <ApproverCreateWizard
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetForm();
        }}
        onSuccess={() => {
          fetchApprovers();
        }}
      />

      {/* Edit Approver Wizard */}
      <ApproverEditWizard
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
        approver={approverToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a1033] border border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-300">
              Delete Approver
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete the approver "
              <span className="font-medium text-white">
                {approverToDelete?.username}
              </span>
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-blue-500/30 text-blue-300 hover:bg-blue-950/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApprover}
              className="bg-red-600/80 text-white hover:bg-red-700"
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
        <AlertDialogContent className="bg-[#0a1033] border border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-300">
              Delete Multiple Approvers
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedApprovers.length}{" "}
              selected approver{selectedApprovers.length !== 1 ? "s" : ""}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-blue-500/30 text-blue-300 hover:bg-blue-950/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600/80 text-white hover:bg-red-700"
            >
              Delete All Selected
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
