import { useState } from 'react';
import { useActionManagement } from '@/hooks/useActionManagement';
import { ActionFormDialog } from '@/components/actions/dialogs/ActionFormDialog';
import { DeleteActionDialog } from '@/components/actions/dialogs/DeleteActionDialog';
import { AssignActionDialog } from '@/components/actions/dialogs/AssignActionDialog';
import { ActionsTable } from '@/components/actions/ActionsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Action, CreateActionDto, UpdateActionDto } from '@/models/action';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function ActionsManagementPage() {
  const { actions, isLoading, createAction, updateAction, deleteAction } = useActionManagement();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const handleEditAction = (action: Action) => {
    setSelectedAction(action);
    setIsFormOpen(true);
  };

  const handleDeleteAction = (action: Action) => {
    setSelectedAction(action);
    setIsDeleteDialogOpen(true);
  };

  const handleAssignAction = (action: Action) => {
    setSelectedAction(action);
    setIsAssignDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedAction?.actionId) {
      try {
        await deleteAction(selectedAction.actionId);
        setIsDeleteDialogOpen(false);
        toast({
          title: "Success",
          description: "Action deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete action",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Cannot delete action: Invalid action ID",
        variant: "destructive",
      });
    }
  };
  
  const handleSubmitAction = async (data: CreateActionDto | UpdateActionDto) => {
    try {
      if (selectedAction) {
        await updateAction({ id: selectedAction.actionId, data });
        toast({
          title: "Success",
          description: "Action updated successfully",
        });
      } else {
        await createAction(data);
        toast({
          title: "Success",
          description: "Action created successfully",
        });
      }
      setIsFormOpen(false);
      setSelectedAction(null);
    } catch (error) {
      toast({
        title: "Error",
        description: selectedAction ? "Failed to update action" : "Failed to create action",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card className="bg-[#0f1642] border-blue-900/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold text-white">Actions Management</CardTitle>
          <Button 
            onClick={() => { setSelectedAction(null); setIsFormOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="w-full flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-12 bg-blue-900/10 rounded-lg border border-blue-900/30">
              <h3 className="text-xl font-medium mb-2 text-white">No Actions Found</h3>
              <p className="text-blue-300 mb-4">Get started by creating your first action</p>
              <Button 
                onClick={() => { setSelectedAction(null); setIsFormOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Action
              </Button>
            </div>
          ) : (
            <ActionsTable
              actions={actions}
              onEditAction={handleEditAction}
              onDeleteAction={handleDeleteAction}
              onAssignAction={handleAssignAction}
            />
          )}
        </CardContent>
      </Card>

      <ActionFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        action={selectedAction}
        onSubmit={handleSubmitAction}
      />

      <DeleteActionDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        action={selectedAction}
        onConfirm={handleDeleteConfirm}
      />

      <AssignActionDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        action={selectedAction}
      />
    </div>
  );
}
