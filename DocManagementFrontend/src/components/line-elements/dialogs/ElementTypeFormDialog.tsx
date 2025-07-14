import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LignesElementType } from "@/models/lineElements";

interface ElementTypeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    elementType: LignesElementType;
    onSuccess: () => void;
}

export function ElementTypeFormDialog({
    open,
    onOpenChange,
    elementType,
    onSuccess,
}: ElementTypeFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Edit Element Type</DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <p className="text-muted-foreground">
                        Edit functionality for element type "{elementType?.code}" will be implemented here.
                        This is a placeholder component that can be enhanced with a full form.
                    </p>

                    <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h4 className="font-medium text-foreground mb-2">Current Element Type:</h4>
                        <div className="space-y-1 text-sm">
                            <p><strong>Code:</strong> {elementType?.code}</p>
                            <p><strong>Type:</strong> {elementType?.typeElement}</p>
                            <p><strong>Description:</strong> {elementType?.description}</p>
                            <p><strong>Table:</strong> {elementType?.tableName}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 