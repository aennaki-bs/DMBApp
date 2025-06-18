import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Trash,
  Loader2,
  Shield,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  circuitDeleteService,
  type DeleteOptions,
  type CircuitDependency,
} from "@/services/circuitDeleteService";

interface SmartDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (options: DeleteOptions) => Promise<void>;
  circuits: Circuit[];
  isBulk?: boolean;
}

const MotionAlertDialogContent = motion.create(AlertDialogContent);

export function SmartDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  circuits,
  isBulk = false,
}: SmartDeleteDialogProps) {
  // Early return if circuits are invalid
  if (!circuits || circuits.length === 0) {
    return null;
  }

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dependencies, setDependencies] = useState<CircuitDependency[]>([]);
  const [deleteOptions, setDeleteOptions] = useState<DeleteOptions>({
    forceDelete: false,
    cascadeDelete: false,
    backupBeforeDelete: true,
  });
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [hasBlockingDependencies, setHasBlockingDependencies] = useState(false);

  const circuitCount = circuits.length;
  const isMultiple = circuitCount > 1;

  // Analyze dependencies when dialog opens
  useEffect(() => {
    if (open && circuits.length > 0) {
      analyzeDependencies();
    } else {
      resetAnalysis();
    }
  }, [open, circuits]);

  const resetAnalysis = () => {
    setDependencies([]);
    setAnalysisComplete(false);
    setHasBlockingDependencies(false);
    setDeleteOptions({
      forceDelete: false,
      cascadeDelete: false,
      backupBeforeDelete: true,
    });
  };

  const analyzeDependencies = async () => {
    setIsAnalyzing(true);
    try {
      const circuitIds = circuits.map((c) => c.id);
      const analysis = await circuitDeleteService.analyzeDependencies(
        circuitIds
      );

      setDependencies(analysis.dependencies);
      setHasBlockingDependencies(analysis.hasBlockingDependencies);
      setAnalysisComplete(true);
    } catch (error) {
      toast.error("Failed to analyze circuit dependencies");
      console.error("Dependency analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await onConfirm(deleteOptions);
      onOpenChange(false);
    } catch (error) {
      console.error("Delete failed:", error);
      // Error is handled by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (isLoading || isAnalyzing) return;
    onOpenChange(newOpen);
  };

  const getDependencyIcon = (type: CircuitDependency["type"]) => {
    switch (type) {
      case "documents":
        return <FileText className="h-4 w-4" />;
      case "steps":
        return <Shield className="h-4 w-4" />;
      case "approvals":
        return <Users className="h-4 w-4" />;
      case "transitions":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getCircuitSummary = () => {
    if (!circuits[0]) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-red-200">Circuit data not available</p>
        </div>
      );
    }

    if (isMultiple) {
      const activeCount = circuits.filter((c) => c?.isActive).length;
      return (
        <div className="space-y-2">
          <p className="text-sm text-blue-200">
            <strong>{circuitCount}</strong> circuits selected for deletion
          </p>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-green-500/20 text-green-300"
            >
              {activeCount} Active
            </Badge>
            <Badge variant="secondary" className="bg-gray-500/20 text-gray-300">
              {circuitCount - activeCount} Inactive
            </Badge>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-900/30">
            <p className="text-sm text-blue-200 mb-2">Circuit Details:</p>
            <div className="space-y-1 text-xs">
              <p>
                <span className="text-blue-400">Code:</span>{" "}
                {circuits[0].circuitKey || circuits[0].id || "N/A"}
              </p>
              <p>
                <span className="text-blue-400">Title:</span>{" "}
                {circuits[0].title || "N/A"}
              </p>
              {circuits[0].descriptif && (
                <p>
                  <span className="text-blue-400">Description:</span>{" "}
                  {circuits[0].descriptif}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={circuits[0].isActive ? "default" : "secondary"}
                  className={
                    circuits[0].isActive
                      ? "bg-green-500/20 text-green-300"
                      : "bg-gray-500/20 text-gray-300"
                  }
                >
                  {circuits[0].isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const canProceedWithDelete =
    analysisComplete && (!hasBlockingDependencies || deleteOptions.forceDelete);

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <MotionAlertDialogContent
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl max-w-2xl w-full mx-4 sm:mx-auto"
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <div className="p-1.5 sm:p-2 rounded-full bg-red-500/10 text-red-400">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <AlertDialogTitle className="text-lg sm:text-xl text-blue-100">
              {isMultiple
                ? `Delete ${circuitCount} Circuits`
                : "Delete Circuit"}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm sm:text-base text-blue-300">
            {isMultiple
              ? `You are about to permanently delete ${circuitCount} circuits. This action cannot be undone.`
              : `You are about to permanently delete the circuit "${circuits[0]?.title}". This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 sm:space-y-4">
          {/* Circuit Summary */}
          {getCircuitSummary()}

          {/* Dependency Analysis */}
          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-blue-400" />
              <h4 className="text-sm font-medium text-blue-200">
                Dependency Analysis
              </h4>
            </div>

            {isAnalyzing ? (
              <div className="flex items-center gap-2 text-blue-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  Analyzing circuit dependencies...
                </span>
              </div>
            ) : analysisComplete ? (
              <div className="space-y-2">
                {dependencies.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">
                      No dependencies found - safe to delete
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dependencies.map((dep, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded border ${
                          dep.canForceDelete
                            ? "border-yellow-500/30 bg-yellow-500/10"
                            : "border-red-500/30 bg-red-500/10"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {getDependencyIcon(dep.type)}
                          <span className="text-xs">{dep.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {dep.count}
                          </Badge>
                          {dep.canForceDelete ? (
                            <CheckCircle className="h-4 w-4 text-yellow-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Delete Options */}
          {analysisComplete && dependencies.length > 0 && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <h4 className="text-sm font-medium text-blue-200 mb-3">
                Delete Options
              </h4>
              <div className="space-y-3">
                {hasBlockingDependencies && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={deleteOptions.forceDelete}
                      onChange={(e) =>
                        setDeleteOptions((prev) => ({
                          ...prev,
                          forceDelete: e.target.checked,
                        }))
                      }
                      className="rounded border-blue-500/30 bg-blue-900/30 text-red-500"
                    />
                    <span className="text-sm text-blue-200">
                      Force delete (override blocking dependencies)
                    </span>
                  </label>
                )}

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteOptions.cascadeDelete}
                    onChange={(e) =>
                      setDeleteOptions((prev) => ({
                        ...prev,
                        cascadeDelete: e.target.checked,
                      }))
                    }
                    className="rounded border-blue-500/30 bg-blue-900/30 text-blue-500"
                  />
                  <span className="text-sm text-blue-200">
                    Delete all related data (steps, transitions, etc.)
                  </span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteOptions.backupBeforeDelete}
                    onChange={(e) =>
                      setDeleteOptions((prev) => ({
                        ...prev,
                        backupBeforeDelete: e.target.checked,
                      }))
                    }
                    className="rounded border-blue-500/30 bg-blue-900/30 text-green-500"
                  />
                  <span className="text-sm text-blue-200">
                    Create backup before deletion
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Warning Messages */}
          {hasBlockingDependencies && !deleteOptions.forceDelete && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-md p-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <p className="text-red-300 text-sm font-medium">
                  Cannot delete - blocking dependencies found
                </p>
              </div>
              <p className="text-red-200 text-xs mt-1">
                Enable "Force delete" to override these restrictions.
              </p>
            </div>
          )}
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <AlertDialogCancel
            disabled={isLoading || isAnalyzing}
            className="w-full sm:w-auto bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading || isAnalyzing || !canProceedWithDelete}
            className="w-full sm:w-auto bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash className="h-4 w-4" />
                {isMultiple
                  ? `Delete ${circuitCount} Circuits`
                  : "Delete Circuit"}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </MotionAlertDialogContent>
    </AlertDialog>
  );
}
