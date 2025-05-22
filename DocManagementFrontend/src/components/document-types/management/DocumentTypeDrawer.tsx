import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DocumentTypeForm } from "@/components/document-types/DocumentTypeForm";
import { DocumentType } from "@/models/document";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentTypeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DocumentType | null;
  onSuccess: () => void;
}

const DocumentTypeDrawer = ({
  open,
  onOpenChange,
  type,
  onSuccess,
}: DocumentTypeDrawerProps) => {
  // Use a simple handler to ensure the dialog is properly closed
  const handleCancel = () => {
    onOpenChange(false);
  };

  // Handle successful form submission
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false); // Close the dialog when successful
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent
            className="p-0 border-none shadow-none bg-transparent max-w-2xl mx-auto [&>button]:hidden"
            forceMount
          >
            <DocumentTypeForm
              documentType={type}
              isEditMode={!!type}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default DocumentTypeDrawer;
