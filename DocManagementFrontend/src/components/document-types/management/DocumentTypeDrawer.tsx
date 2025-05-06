
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DocumentTypeForm from '@/components/document-types/DocumentTypeForm';
import { DocumentType } from '@/models/document';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DocumentTypeDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: DocumentType | null;
  isEditMode: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

const ANIMATION = {
  initial: { opacity: 0, scale: 0.95, y: 24 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }},
  exit: { opacity: 0, scale: 0.97, y: 16, transition: { duration: 0.22 } }
};

const DocumentTypeDrawer = ({
  isOpen,
  onOpenChange,
  documentType,
  isEditMode,
  onSuccess,
  onCancel
}: DocumentTypeDrawerProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <DialogContent 
              className="p-0 border-none shadow-none bg-transparent max-w-md mx-auto"
              forceMount
            >
              <motion.div
                className={cn(
                  "w-full bg-[#111633] p-4 sm:p-6 rounded-xl shadow-2xl border border-blue-900/30 flex flex-col",
                  "animate-fade-in"
                )}
                initial={ANIMATION.initial}
                animate={ANIMATION.animate}
                exit={ANIMATION.exit}
                role="dialog"
                aria-modal="true"
              >
                <DialogHeader className="text-center pb-4 px-0">
                  <DialogTitle className="text-xl font-bold text-white">
                    {isEditMode ? 'Edit Document Type' : 'Create Document Type'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-blue-300">
                    {isEditMode 
                      ? 'Modify an existing document type' 
                      : 'Create a new document type for your organization'}
                  </DialogDescription>
                </DialogHeader>
            
                <div className="px-0">
                  <DocumentTypeForm
                    documentType={documentType}
                    isEditMode={isEditMode}
                    onSuccess={onSuccess}
                    onCancel={onCancel}
                  />
                </div>
              </motion.div>
            </DialogContent>
          </div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default DocumentTypeDrawer;
