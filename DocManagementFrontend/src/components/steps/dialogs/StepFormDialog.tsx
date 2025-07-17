
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StepFormProvider } from '../form/StepFormProvider';
import { MultiStepStepForm } from '../form/MultiStepStepForm';
import { useParams } from 'react-router-dom';
import { Workflow, Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Step {
  id: number;
  title: string;
  descriptif: string;
  stepKey: string;
  orderIndex: number;
  circuitId: number;
  responsibleRoleId?: number;
  isFinalStep: boolean;
  requiresApproval: boolean;
  approvalUserId?: number;
  approvalGroupId?: number;
  currentStatusId: number;
  nextStatusId: number;
}

interface StepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editStep?: Step;
  circuitId?: number;
}

export const StepFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
  editStep,
  circuitId,
}: StepFormDialogProps) => {
  const params = useParams<{ circuitId?: string }>();
  // Get circuit ID either from props or from URL params
  const contextCircuitId = circuitId || (params.circuitId ? parseInt(params.circuitId, 10) : undefined);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] md:max-w-[600px] max-h-[85vh] bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 border border-blue-900/30 backdrop-blur-xl shadow-2xl rounded-xl p-0 overflow-hidden flex flex-col">
        {/* Glassmorphism Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-blue-800/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />

        {/* Compact Header Section */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-blue-500/5 to-blue-600/10" />
          <DialogHeader className="relative px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2.5">
              {/* Compact Icon with Glow Effect */}
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 backdrop-blur-sm">
                  {editStep ? (
                    <Workflow className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Plus className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-lg bg-blue-500/20 blur-lg -z-10" />
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <DialogTitle className="text-lg font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {editStep ? 'Edit Workflow Step' : 'Create New Step'}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Sparkles className="h-2.5 w-2.5 text-blue-400/60" />
                    {editStep
                      ? "Update this step's configuration and settings"
                      : contextCircuitId
                        ? 'Add a new step to enhance your workflow circuit'
                        : 'Design a new step for your workflow circuit'}
                  </DialogDescription>
                </motion.div>
              </div>
            </div>

            {/* Compact Decorative Elements */}
            <div className="absolute top-1.5 right-4 flex gap-0.5">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-0.5 h-0.5 rounded-full bg-blue-400/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                />
              ))}
            </div>
          </DialogHeader>
        </div>

        {/* Scrollable Content Section */}
        <motion.div
          className="relative flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-slate-600/50 hover:scrollbar-thumb-slate-500/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <StepFormProvider
            editStep={editStep}
            onSuccess={handleSuccess}
            circuitId={contextCircuitId}
          >
            <MultiStepStepForm onCancel={() => onOpenChange(false)} />
          </StepFormProvider>
        </motion.div>

        {/* Footer Decoration */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />
      </DialogContent>
    </Dialog>
  );
};
