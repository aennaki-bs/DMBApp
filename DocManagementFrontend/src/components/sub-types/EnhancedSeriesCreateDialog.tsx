import { DocumentType } from "@/models/document";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { SubTypeFormProvider } from "./components/SubTypeFormProvider";
import { EnhancedMultiStepSeriesForm } from "./components/EnhancedMultiStepSeriesForm";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EnhancedSeriesCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => void;
    documentTypes: DocumentType[];
}

const EnhancedSeriesCreateDialog = ({
    open,
    onOpenChange,
    onSubmit,
    documentTypes,
}: EnhancedSeriesCreateDialogProps) => {
    const handleClose = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent
                className="bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 
                   backdrop-blur-xl border border-slate-700/50 shadow-2xl 
                   sm:max-w-[700px] w-[95vw] max-h-[90vh] p-0 
                   rounded-2xl overflow-hidden"
            >
                {/* Header with glassmorphism effect */}
                <div className="relative">
                    {/* Background gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-blue-400/20 backdrop-blur-sm" />

                    <DialogHeader className="relative px-8 py-6 border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">
                                    Create New Series
                                </DialogTitle>
                                <DialogDescription className="text-slate-300 text-sm font-medium">
                                    Configure your document series with our enhanced step-by-step wizard
                                </DialogDescription>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClose}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-white 
                         hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </DialogHeader>
                </div>

                {/* Form content with enhanced styling */}
                <div className="relative px-8 py-6">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.1),transparent_50%)]" />

                    <div className="relative">
                        <SubTypeFormProvider
                            onSubmit={onSubmit}
                            onClose={handleClose}
                            initialData={{ documentTypeId: documentTypes[0]?.id }}
                            documentTypes={documentTypes}
                        >
                            <EnhancedMultiStepSeriesForm onCancel={handleClose} />
                        </SubTypeFormProvider>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EnhancedSeriesCreateDialog; 