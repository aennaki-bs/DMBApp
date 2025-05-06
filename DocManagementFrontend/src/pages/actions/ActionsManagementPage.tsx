
import { useState } from 'react';
import { useActionManagement } from '@/hooks/useActionManagement';
import { ActionFormDialog } from '@/components/actions/dialogs/ActionFormDialog';
import { DeleteActionDialog } from '@/components/actions/dialogs/DeleteActionDialog';
import { ActionsTable } from '@/components/actions/ActionsTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Action, ActionForm } from '@/models/action';
import { Plus } from 'lucide-react';

export function ActionsManagementPage() {
  const { actions, isLoading, createAction, updateAction, deleteAction } = useActionManagement();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);

  const handleCreate = async (data: ActionForm) => {
    await createAction(data);
  };

  const handleUpdate = async (data: ActionForm) => {
    if (selectedAction) {
      await updateAction({ id: selectedAction.id, data });
    }
  };

  const handleDelete = async () => {
    if (selectedAction) {
      await deleteAction(selectedAction.id);
      setIsDeleteOpen(false);
    }
  };

  const openEditDialog = (action: Action) => {
    setSelectedAction(action);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (action: Action) => {
    setSelectedAction(action);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="bg-[#0f1642] border-blue-900/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xl font-bold">Actions Management</CardTitle>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        </CardHeader>
        <CardContent>
          <ActionsTable
            actions={actions}
            onEditAction={openEditDialog}
            onDeleteAction={openDeleteDialog}
          />
        </CardContent>
      </Card>

      <ActionFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={selectedAction ? handleUpdate : handleCreate}
        action={selectedAction}
      />

      <DeleteActionDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        action={selectedAction}
        onConfirm={handleDelete}
      />
    </div>
  );
}
