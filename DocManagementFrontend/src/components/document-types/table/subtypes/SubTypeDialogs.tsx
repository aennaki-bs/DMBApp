import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { SubType } from "@/models/subtype";
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
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import { SubTypeFormProvider } from "@/components/sub-types/components/SubTypeFormProvider";
import { MultiStepSubTypeForm } from "@/components/sub-types/components/MultiStepSubTypeForm";

interface SubTypeDialogsProps {
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  selectedSubType: SubType | null;
  documentTypeId: number;
  onCreateSubmit: (data: any) => void;
  onEditSubmit: (id: number, data: any) => void;
  onDeleteConfirm: (id: number) => void;
}

export default function SubTypeDialogs({
  createDialogOpen,
  setCreateDialogOpen,
  editDialogOpen,
  setEditDialogOpen,
  deleteDialogOpen,
  setDeleteDialogOpen,
  selectedSubType,
  documentTypeId,
  onCreateSubmit,
  onEditSubmit,
  onDeleteConfirm,
}: SubTypeDialogsProps) {
  const [newSubType, setNewSubType] = useState({
    name: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
    isActive: true,
  });

  const [editedSubType, setEditedSubType] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isActive: true,
  });

  useEffect(() => {
    if (selectedSubType) {
      setEditedSubType({
        name: selectedSubType.name,
        description: selectedSubType.description,
        startDate: new Date(selectedSubType.startDate)
          .toISOString()
          .split("T")[0],
        endDate: new Date(selectedSubType.endDate).toISOString().split("T")[0],
        isActive: selectedSubType.isActive,
      });
    }
  }, [selectedSubType]);

  const handleCreateSubmit = (formData: any) => {
    // Add the document type ID to the form data
    const submissionData = {
      ...formData,
      documentTypeId,
    };

    onCreateSubmit(submissionData);
  };

  const handleEditSubmit = () => {
    if (!selectedSubType) return;

    if (!editedSubType.name) {
      toast.error("Name is required");
      return;
    }

    if (!editedSubType.startDate || !editedSubType.endDate) {
      toast.error("Start and end dates are required");
      return;
    }

    if (new Date(editedSubType.startDate) > new Date(editedSubType.endDate)) {
      toast.error("Start date must be before end date");
      return;
    }

    onEditSubmit(selectedSubType.id, editedSubType);
  };

  const resetCreateForm = () => {
    setNewSubType({
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split("T")[0],
      isActive: true,
    });
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
    resetCreateForm();
  };

  return (
    <>
      {/* Create Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="bg-[#0f1642] border-blue-900/50 text-white sm:max-w-[500px] p-3 overflow-hidden">
          <DialogHeader className="mb-1 pb-1 border-b border-blue-900/30">
            <DialogTitle className="text-lg text-white">
              Create New Subtype
            </DialogTitle>
            <DialogDescription className="text-blue-300 text-xs">
              Complete each step to create a new document subtype
            </DialogDescription>
          </DialogHeader>

          <div className="py-1">
            <SubTypeFormProvider
              onSubmit={handleCreateSubmit}
              onClose={handleCloseCreateDialog}
            >
              <MultiStepSubTypeForm onCancel={handleCloseCreateDialog} />
            </SubTypeFormProvider>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0f1642] border-blue-900/50 text-white sm:max-w-[425px] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b border-blue-900/30 bg-[#0a1033]/50">
            <DialogTitle className="text-lg font-medium text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-400"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </span>
              Edit Subtype
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Date Range Fields */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-blue-300">
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                <div className="relative flex items-center">
                  <div className="absolute left-2 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400/70"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <Input
                    id="edit-start-date"
                    type="date"
                    value={editedSubType.startDate}
                    onChange={(e) =>
                      setEditedSubType({
                        ...editedSubType,
                        startDate: e.target.value,
                      })
                    }
                    className="h-9 w-full pl-9 bg-[#141e4d] border-blue-800/40 focus:border-blue-400/50 text-white rounded-md transition-all hover:border-blue-700/60 focus:bg-[#182154]"
                  />
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-2 z-10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-blue-400/70"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <Input
                    id="edit-end-date"
                    type="date"
                    value={editedSubType.endDate}
                    onChange={(e) =>
                      setEditedSubType({
                        ...editedSubType,
                        endDate: e.target.value,
                      })
                    }
                    className="h-9 w-full pl-9 bg-[#141e4d] border-blue-800/40 focus:border-blue-400/50 text-white rounded-md transition-all hover:border-blue-700/60 focus:bg-[#182154]"
                  />
                </div>
              </div>
            </div>

            {/* Name Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-name"
                className="text-sm font-medium text-blue-300"
              >
                Name
              </Label>
              <Input
                id="edit-name"
                value={editedSubType.name}
                onChange={(e) =>
                  setEditedSubType({ ...editedSubType, name: e.target.value })
                }
                className="h-9 w-full bg-[#141e4d] border-blue-800/40 focus:border-blue-400/50 text-white rounded-md transition-all hover:border-blue-700/60 focus:bg-[#182154]"
                placeholder="Enter subtype name"
              />
            </div>

            {/* Description Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-description"
                className="text-sm font-medium text-blue-300"
              >
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={editedSubType.description}
                onChange={(e) =>
                  setEditedSubType({
                    ...editedSubType,
                    description: e.target.value,
                  })
                }
                className="min-h-[60px] w-full bg-[#141e4d] border-blue-800/40 focus:border-blue-400/50 text-white rounded-md transition-all hover:border-blue-700/60 focus:bg-[#182154] resize-none"
                placeholder="Enter subtype description"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between py-1">
              <Label
                htmlFor="edit-active"
                className="text-sm font-medium text-blue-300"
              >
                Status
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editedSubType.isActive}
                  onCheckedChange={(checked) =>
                    setEditedSubType({ ...editedSubType, isActive: checked })
                  }
                  className="data-[state=checked]:bg-blue-500 h-5 w-9"
                />
                <span className="text-xs text-blue-300/90">
                  {editedSubType.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 border-t border-blue-900/30 bg-[#0a1033]/50 flex-row space-x-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="flex-1 h-9 border-blue-800/40 text-blue-300 hover:bg-blue-900/20 hover:text-blue-200 transition-colors"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              className="flex-1 h-9 bg-blue-600 text-white hover:bg-blue-500 transition-colors"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0f1642] border-blue-900/50 text-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-red-400"
                >
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </span>
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300/90 mt-2">
              Are you sure you want to delete the subtype "
              <span className="text-white font-medium">
                {selectedSubType?.name}
              </span>
              "?
              <p className="mt-2 text-red-300/90">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-t border-blue-900/30 mt-4 pt-4 flex space-x-2">
            <AlertDialogCancel className="bg-transparent flex-1 hover:bg-blue-900/20 border-blue-900/50 text-blue-300 hover:text-white transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedSubType && onDeleteConfirm(selectedSubType.id)
              }
              className="bg-red-600 flex-1 hover:bg-red-700 text-white transition-colors"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
