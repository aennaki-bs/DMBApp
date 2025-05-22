import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  PlusCircle,
  Trash2,
  Search,
  UsersRound,
  ShieldAlert,
  Users,
  UserPlus,
  CheckCircle2,
  Filter,
  LayoutGrid,
  LayoutList,
  UserRound,
  Settings,
  Info,
  List,
  PencilIcon,
  AlertTriangle,
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
} from "@/components/ui/dialog";
import { ApprovalGroup } from "@/models/approval";
import approvalService from "@/services/approvalService";
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
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable, Column } from "@/components/ui/data-table";
import ApprovalGroupCreateDialog from "@/components/approval/ApprovalGroupCreateDialog";
import ApprovalGroupEditDialog from "@/components/approval/ApprovalGroupEditDialog";

export default function ApprovalGroupsManagement() {
  const [approvalGroups, setApprovalGroups] = useState<ApprovalGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<ApprovalGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ApprovalGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ApprovalGroup | null>(null);
  const [associatedGroups, setAssociatedGroups] = useState<Record<number, boolean>>({});
  const [checkingAssociation, setCheckingAssociation] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // Fetch approval groups on component mount
  useEffect(() => {
    fetchApprovalGroups();
  }, []);

  // Check group associations after groups are loaded
  useEffect(() => {
    if (approvalGroups.length > 0) {
      checkGroupAssociations();
    }
  }, [approvalGroups]);

  // Handle selecting all groups when selectAll changes
  useEffect(() => {
    if (selectAll) {
      setSelectedGroups(filteredGroups.map((group) => group.id));
    } else {
      setSelectedGroups([]);
    }
  }, [selectAll, filteredGroups]);

  // Filter groups when search query or groups change
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(approvalGroups);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = approvalGroups.filter(
        (group) =>
          group.name.toLowerCase().includes(query) ||
          group.comment?.toLowerCase().includes(query) ||
          group.stepTitle?.toLowerCase().includes(query) ||
          group.ruleType.toLowerCase().includes(query)
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, approvalGroups]);

  // Define table columns
  const columns: Column<ApprovalGroup>[] = [
    {
      id: "name",
      header: "Group Name",
      accessorKey: "name",
      cell: (row) => (
        <div className="font-medium text-blue-200 flex items-center">
          <UsersRound className="h-4 w-4 mr-2 text-blue-400" />
          {row.name}
        </div>
      ),
    },
    {
      id: "ruleType",
      header: "Approval Rule",
      accessorKey: "ruleType",
      cell: (row) => (
        <Badge
          className={`${
            row.ruleType === "All"
              ? "bg-emerald-600/60 text-emerald-100"
              : row.ruleType === "Any"
              ? "bg-amber-600/60 text-amber-100"
              : "bg-blue-600/60 text-blue-100"
          }`}
        >
          {row.ruleType === "All"
            ? "All Must Approve"
            : row.ruleType === "Any"
            ? "Any Can Approve"
            : "Sequential"}
        </Badge>
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
      id: "approversCount",
      header: "Approvers",
      accessorKey: "approvers",
      cell: (row) => (
        <Badge className="bg-blue-800/60 text-blue-100">
          {row.approvers?.length || 0}{" "}
          {row.approvers?.length === 1 ? "member" : "members"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row)}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
          >
            <Info className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditGroup(row)}
            disabled={associatedGroups[row.id] || checkingAssociation}
            className={`${
              associatedGroups[row.id] || checkingAssociation
                ? "text-blue-500/40 cursor-not-allowed"
                : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 border-blue-800"
            }`}
            title={associatedGroups[row.id] ? "Cannot edit a group that is associated with steps" : ""}
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openDeleteDialog(row)}
            disabled={associatedGroups[row.id] || checkingAssociation}
            className={`${
              associatedGroups[row.id] || checkingAssociation
                ? "text-red-500/40 cursor-not-allowed"
                : "text-red-400 hover:text-red-300 hover:bg-red-900/40 border-red-900/50"
            }`}
            title={associatedGroups[row.id] ? "Cannot delete a group that is associated with steps" : ""}
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

  const fetchApprovalGroups = async () => {
    try {
      setIsLoading(true);
      const data = await approvalService.getAllApprovalGroups();
      setApprovalGroups(data);
      setFilteredGroups(data);
    } catch (error) {
      console.error("Failed to fetch approval groups:", error);
      toast.error("Failed to load approval groups");
    } finally {
      setIsLoading(false);
    }
  };

  const checkGroupAssociations = async () => {
    try {
      setCheckingAssociation(true);
      const associationMap: Record<number, boolean> = {};
      
      // Check association for each group in parallel
      const associationPromises = approvalGroups.map(async (group) => {
        try {
          const association = await approvalService.checkGroupAssociation(group.id);
          associationMap[group.id] = association.isAssociated;
        } catch (err) {
          console.error(`Failed to check association for group ${group.id}:`, err);
          // Default to assuming it is associated (safer)
          associationMap[group.id] = true;
        }
      });
      
      await Promise.all(associationPromises);
      setAssociatedGroups(associationMap);
    } catch (error) {
      console.error("Failed to check group associations:", error);
    } finally {
      setCheckingAssociation(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      await approvalService.deleteApprovalGroup(groupToDelete.id);
      setApprovalGroups((prev) =>
        prev.filter((group) => group.id !== groupToDelete.id)
      );
      toast.success(
        `Approval group "${groupToDelete.name}" deleted successfully`
      );
    } catch (error) {
      console.error(
        `Failed to delete approval group with ID ${groupToDelete.id}:`,
        error
      );
      toast.error("Failed to delete approval group");
    } finally {
      setGroupToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (group: ApprovalGroup) => {
    // Don't open delete dialog if group is associated with steps
    if (associatedGroups[group.id]) {
      toast.error(`Cannot delete group "${group.name}" because it is associated with workflow steps`);
      return;
    }
    
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const handleCreateGroupSuccess = () => {
    setCreateDialogOpen(false);
    fetchApprovalGroups();
    toast.success("Approval group created successfully");
  };

  const toggleGroupSelection = (id: number) => {
    setSelectedGroups((prev) =>
      prev.includes(id)
        ? prev.filter((groupId) => groupId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleBulkDelete = async () => {
    if (selectedGroups.length === 0) return;

    try {
      // Delete each selected group
      const deletePromises = selectedGroups.map((id) =>
        approvalService.deleteApprovalGroup(id)
      );

      await Promise.all(deletePromises);

      setApprovalGroups((prev) =>
        prev.filter((group) => !selectedGroups.includes(group.id))
      );

      toast.success(
        `${selectedGroups.length} approval groups deleted successfully`
      );
      setSelectedGroups([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to delete approval groups:", error);
      toast.error("Failed to delete selected approval groups");
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const openBulkDeleteDialog = () => {
    if (selectedGroups.length === 0) {
      toast.error("Please select at least one approval group to delete");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleViewModeChange = (mode: "list" | "card") => {
    setViewMode(mode);
  };

  const handleBulkActions = (
    action: string,
    selectedItems: ApprovalGroup[]
  ) => {
    if (action === "delete") {
      openBulkDeleteDialog();
    }
  };

  const handleRowSelect = (ids: (string | number)[]) => {
    setSelectedGroups(ids as number[]);
  };

  const handleViewDetails = (group: ApprovalGroup) => {
    setSelectedGroup(group);
    setDetailsDialogOpen(true);
  };

  const handleEditGroup = (group: ApprovalGroup) => {
    // Don't allow editing if group is associated with steps
    if (associatedGroups[group.id]) {
      toast.error(`Cannot edit group "${group.name}" because it is associated with workflow steps`);
      return;
    }
    
    // Set the selected group and show an edit dialog
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  const handleEditGroupSuccess = () => {
    setEditDialogOpen(false);
    fetchApprovalGroups();
    toast.success("Approval group updated successfully");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Users className="mr-3 h-6 w-6 text-blue-400" /> Approval Groups
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage approval groups for document workflows
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            New Approval Group
          </Button>
        </div>
      </div>

      {/* Search and Tools Section */}
      <div className="bg-[#1e2a4a] border border-blue-900/40 rounded-xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Search approval groups..."
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
                className={`rounded-r-none ${
                  viewMode === "list"
                    ? "bg-blue-800/50 text-white"
                    : "text-blue-300/70"
                }`}
              >
                <LayoutList className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewModeChange("card")}
                className={`rounded-l-none ${
                  viewMode === "card"
                    ? "bg-blue-800/50 text-white"
                    : "text-blue-300/70"
                }`}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedGroups.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteDialog}
                className="bg-red-700/70 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedGroups.length})
              </Button>
            )}
          </div>
        </div>

        {/* Selection Info */}
        {selectedGroups.length > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-800/50">
            <div className="flex items-center gap-2 text-blue-300">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>
                {selectedGroups.length} group
                {selectedGroups.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGroups([])}
              className="text-blue-400 hover:text-blue-300"
            >
              Clear selection
            </Button>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-0 transition-all overflow-hidden">
        <DataTable
          data={filteredGroups}
          columns={columns}
          keyField="id"
          isLoading={isLoading}
          searchPlaceholder="Search approval groups..."
          searchQuery={searchQuery}
          onSearchChange={(query) => setSearchQuery(query)}
          onRowSelect={handleRowSelect}
          onBulkAction={handleBulkActions}
          bulkActions={bulkActions}
          emptyStateMessage="No approval groups created yet"
          emptyStateIcon={
            <UsersRound className="h-10 w-10 mb-3 text-blue-400/50" />
          }
          emptySearchMessage="No approval groups found matching"
          hideSearchBar={true}
          showRowActions={false}
        />
      </div>

      {/* Selection summary area displayed at the bottom */}
      {selectedGroups.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a1033]/90 backdrop-blur-sm py-3 px-6 border-t border-blue-900/40 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <Badge className="bg-blue-600 text-white px-3 py-1 text-sm">
              {selectedGroups.length} selected
            </Badge>
            <span className="text-blue-200">
              {selectedGroups.length === 1
                ? "1 group selected"
                : `${selectedGroups.length} groups selected`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedGroups([])}
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

      {/* Create Approval Group Dialog */}
      <ApprovalGroupCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateGroupSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a1033] border border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-300">
              Delete Approval Group
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete the approval group "
              <span className="font-medium text-white">
                {groupToDelete?.name}
              </span>
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border border-blue-500/30 text-blue-300 hover:bg-blue-950/50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
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
              Delete Multiple Approval Groups
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete {selectedGroups.length} selected
              approval group{selectedGroups.length !== 1 ? "s" : ""}? This
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

      {/* Group Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="bg-[#0a1033] border border-blue-900/30 max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-blue-400" />
              Group Details
            </DialogTitle>
          </DialogHeader>

          {selectedGroup && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between bg-blue-950/50 p-4 rounded-lg border border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-900/60 p-3 rounded-full">
                    <UsersRound className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedGroup.name}</h3>
                    {selectedGroup.comment && (
                      <p className="text-blue-300 text-sm mt-1">{selectedGroup.comment}</p>
                    )}
                  </div>
                </div>
                <Badge
                  className={`${
                    selectedGroup.ruleType === "All"
                      ? "bg-emerald-600/60 text-emerald-100"
                      : selectedGroup.ruleType === "Any"
                      ? "bg-amber-600/60 text-amber-100"
                      : "bg-blue-600/60 text-blue-100"
                  } px-3 py-1`}
                >
                  {selectedGroup.ruleType === "All"
                    ? "All Must Approve"
                    : selectedGroup.ruleType === "Any"
                    ? "Any Can Approve"
                    : "Sequential Approval"}
                </Badge>
              </div>

              {associatedGroups[selectedGroup.id] && (
                <div className="bg-amber-950/20 border border-amber-900/30 rounded-md p-3 flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-200 text-sm font-medium">
                      This group is currently associated with workflow steps
                    </p>
                    <p className="text-amber-200/70 text-xs mt-1">
                      You cannot edit or delete this group while it's in use. Remove its associations from workflow steps first.
                    </p>
                  </div>
                </div>
              )}

              <div className="border border-blue-900/30 rounded-lg">
                <div className="p-3 border-b border-blue-900/30 bg-blue-950/50">
                  <h4 className="flex items-center gap-2 text-blue-200 font-medium">
                    <UserRound className="h-4 w-4 text-blue-400" />
                    Group Members ({selectedGroup.approvers?.length || 0})
                  </h4>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  {selectedGroup.approvers && selectedGroup.approvers.length > 0 ? (
                    <div className="space-y-2">
                      {selectedGroup.approvers.map((user, index) => (
                        <div 
                          key={user.userId} 
                          className={`flex items-center p-3 rounded-md ${
                            selectedGroup.ruleType === "Sequential" 
                              ? 'bg-blue-900/20 border border-blue-800/30' 
                              : 'bg-blue-950/50'
                          }`}
                        >
                          {selectedGroup.ruleType === "Sequential" && (
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-800/50 text-blue-200 text-xs mr-3">
                              {index + 1}
                            </div>
                          )}
                          <UserRound className="h-4 w-4 text-blue-400 mr-2" />
                          <span className="text-blue-100">{user.username}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-blue-500/60">
                      <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No members in this group</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-950/30 p-4 rounded-md border border-blue-900/20 flex gap-3">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-300">
                  <p className="mb-1">This approval group defines how document approvals are processed.</p>
                  {selectedGroup.ruleType === "All" && (
                    <p>All members must approve for the document to proceed.</p>
                  )}
                  {selectedGroup.ruleType === "Any" && (
                    <p>Any single member can approve the document to proceed.</p>
                  )}
                  {selectedGroup.ruleType === "Sequential" && (
                    <p>Members must approve in the specified order shown above.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className="border-blue-800 text-blue-300 hover:bg-blue-900/20"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <ApprovalGroupEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        group={selectedGroup}
        onSuccess={handleEditGroupSuccess}
      />
    </div>
  );
}
