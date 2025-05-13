import { Dialog, DialogContent } from "@/components/ui/dialog";
import DocumentTypeForm from "@/components/document-types/DocumentTypeForm";
import { DocumentType } from "@/models/document";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentTypeDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  isEditMode: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const DocumentTypeDrawer = ({
  isOpen,
  onOpenChange,
  documentType,
  isEditMode,
  onSuccess,
  onCancel,
}: DocumentTypeDrawerProps) => {
  // Use a simple handler to ensure the dialog is properly closed
  const handleCancel = () => {
    onOpenChange(false);
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent
            className="p-0 border-none shadow-none bg-transparent max-w-2xl mx-auto"
            forceMount
          >
            <DocumentTypeForm
              documentType={documentType}
              isEditMode={isEditMode}
              onSuccess={onSuccess}
              onCancel={handleCancel}
            />
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default DocumentTypeDrawer;
