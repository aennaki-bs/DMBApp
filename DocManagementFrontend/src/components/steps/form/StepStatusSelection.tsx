import { useEffect, useState, useCallback } from "react";
import { useStepForm } from "./StepFormProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, RefreshCw, Workflow, AlertCircle, CheckCircle2, Clock, Flag } from "lucide-react";
import api from "@/services/api/core";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import stepService from "@/services/stepService";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// Define the status interface
interface Status {
  statusId: number;
  statusKey: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isInitial: boolean;
  isFinal: boolean;
  isFlexible: boolean;
  circuitId: number;
  transitionInfo?: string;
}

const formSchema = z.object({
  currentStatusId: z.string().min(1, "Current status is required"),
  nextStatusId: z.string().min(1, "Next status is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const StepStatusSelection = () => {
  const { formData, setFormData, registerStepForm, isEditMode, editStep } = useStepForm();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [nextStatusOptions, setNextStatusOptions] = useState<Status[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentStatusId: formData.currentStatusId?.toString() || "",
      nextStatusId: formData.nextStatusId?.toString() || "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Define fetchStatuses with useCallback to avoid dependency cycle
  const fetchStatuses = useCallback(async () => {
    if (!formData.circuitId) return;

    setIsLoadingStatuses(true);
    setFetchError(null);

    try {
      // Use the correct API endpoint for fetching statuses - remove duplicate /api prefix
      const response = await api.get(`/Circuit/${formData.circuitId}/statuses`);

      if (response.data && Array.isArray(response.data)) {
        setStatuses(response.data);
      } else {
        console.error("Invalid response format:", response.data);
        setFetchError("Received invalid status data from server");
      }
    } catch (error: any) {
      console.error("Error fetching statuses:", error);
      // More detailed error message
      const errorMessage =
        error?.response?.status === 404
          ? "Status data not found for this circuit."
          : "Failed to load statuses. Please try again.";
      setFetchError(errorMessage);
    } finally {
      setIsLoadingStatuses(false);
    }
  }, [formData.circuitId]);

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(2, {
      validate: async () => {
        const result = await form.trigger();

        // If form is valid, check for duplicate steps
        if (result && formData.currentStatusId && formData.nextStatusId) {
          setIsCheckingDuplicate(true);
          try {
            if (isEditMode) {
              // In edit mode, get all steps and check manually excluding the current step
              const stepsResponse = await api.get(`/Circuit/${formData.circuitId}`);
              const circuitData = stepsResponse.data;

              if (circuitData && circuitData.steps) {
                const conflictingStep = circuitData.steps.find((step: any) =>
                  step.id !== editStep?.id && // Exclude the current step being edited
                  step.currentStatusId === formData.currentStatusId &&
                  step.nextStatusId === formData.nextStatusId
                );

                if (conflictingStep) {
                  form.setError("nextStatusId", {
                    type: "manual",
                    message: "A step with these status transitions already exists",
                  });
                  setIsCheckingDuplicate(false);
                  return false;
                }
              }
            } else {
              // For new steps, use the existing service function
              const exists = await stepService.checkStepExists(
                formData.circuitId,
                formData.currentStatusId,
                formData.nextStatusId
              );

              if (exists) {
                form.setError("nextStatusId", {
                  type: "manual",
                  message: "A step with these status transitions already exists",
                });
                setIsCheckingDuplicate(false);
                return false;
              }
            }
          } catch (error) {
            console.error("Error checking step existence:", error);
          }
          setIsCheckingDuplicate(false);
        }

        return result;
      },
      getValues: () => form.getValues(),
    });
  }, [registerStepForm, form, formData, isEditMode]);

  // Fetch statuses when component mounts or circuitId changes
  useEffect(() => {
    if (formData.circuitId) {
      fetchStatuses();
    }
  }, [formData.circuitId, fetchStatuses]);

  // Update next status options when current status changes
  useEffect(() => {
    if (formData.currentStatusId) {
      // Filter out the current status from next status options
      const filteredStatuses = statuses.filter(
        (status) => status.statusId !== formData.currentStatusId
      );
      setNextStatusOptions(filteredStatuses);
    } else {
      setNextStatusOptions([]);
    }
  }, [formData.currentStatusId, statuses]);

  const handleCurrentStatusChange = (value: string) => {
    form.setValue("currentStatusId", value);
    setFormData({ currentStatusId: parseInt(value, 10) });

    // Clear next status when current status changes
    form.setValue("nextStatusId", "");
    setFormData({ nextStatusId: undefined });
  };

  const handleNextStatusChange = (value: string) => {
    form.setValue("nextStatusId", value);
    setFormData({ nextStatusId: parseInt(value, 10) });
  };

  const getStatusById = (statusId?: number): Status | undefined => {
    if (!statusId) return undefined;
    return statuses.find((status) => status.statusId === statusId);
  };

  // Get status icon based on type
  const getStatusIcon = (status?: Status) => {
    if (!status) return <Clock className="h-3 w-3" />;
    if (status.isInitial) return <Flag className="h-3 w-3 text-green-400" />;
    if (status.isFinal) return <CheckCircle2 className="h-3 w-3 text-red-400" />;
    return <Clock className="h-3 w-3 text-blue-400" />;
  };

  // Render status badges for initial/final states
  const renderStatusBadges = (status?: Status) => {
    if (!status) return null;

    return (
      <div className="flex gap-1 mt-1">
        {status.isInitial && (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-1.5 py-0.5">
            Initial
          </Badge>
        )}
        {status.isFinal && (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs px-1.5 py-0.5">
            Final
          </Badge>
        )}
        {status.isRequired && !status.isInitial && !status.isFinal && (
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-1.5 py-0.5">
            Required
          </Badge>
        )}
      </div>
    );
  };

  const renderStatusItem = (status: Status) => (
    <SelectItem
      key={status.statusId}
      value={status.statusId.toString()}
      className="py-2 hover:bg-slate-800/50 focus:bg-slate-700/50 cursor-pointer"
    >
      <div className="flex items-center gap-2">
        {getStatusIcon(status)}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm">{status.title}</span>
            {status.isInitial && (
              <span className="text-xs bg-green-500/20 text-green-300 px-1 py-0.5 rounded-full border border-green-500/30">
                Initial
              </span>
            )}
            {status.isFinal && (
              <span className="text-xs bg-red-500/20 text-red-300 px-1 py-0.5 rounded-full border border-red-500/30">
                Final
              </span>
            )}
          </div>
          {status.description && (
            <div className="text-xs text-slate-400 mt-0.5">
              {status.description}
            </div>
          )}
        </div>
      </div>
    </SelectItem>
  );

  if (fetchError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto"
      >
        <Card className="border border-red-500/30 bg-gradient-to-br from-red-950/50 via-red-900/30 to-red-950/50 backdrop-blur-sm shadow-xl">
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="p-2 rounded-full bg-red-500/20 border border-red-500/30 w-fit mx-auto">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-red-300 mb-1">Failed to Load Statuses</h3>
                <p className="text-red-200/80 text-sm">{fetchError}</p>
              </div>
              <Button
                onClick={fetchStatuses}
                variant="outline"
                className="border-red-500/30 text-red-300 hover:bg-red-500/10 h-8"
                size="sm"
              >
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-xl mx-auto"
    >
      <Card className="border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-800/40 to-slate-900/80 backdrop-blur-sm shadow-xl">
        {/* Compact Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30"
            >
              <Workflow className="h-3.5 w-3.5 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-white">Status Selection</h3>
              <p className="text-xs text-slate-400">Define current and next status for this step</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...form}>
            <form className="space-y-4">
              {/* Current Status Field */}
              <FormField
                control={form.control}
                name="currentStatusId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                      <Flag className="h-3 w-3 text-blue-400" />
                      Current Status
                      <span className="text-red-400">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={handleCurrentStatusChange}
                      value={field.value}
                      disabled={isLoadingStatuses}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 bg-slate-800/60 border-slate-700/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white rounded-lg transition-all duration-200 hover:bg-slate-800/80">
                          <SelectValue placeholder="Select current status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900/95 border-slate-700/50 backdrop-blur-md">
                        {isLoadingStatuses ? (
                          <div className="flex items-center justify-center p-3">
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500 mr-2" />
                            <span className="text-sm text-slate-300">Loading statuses...</span>
                          </div>
                        ) : statuses.length === 0 ? (
                          <div className="p-3 text-center text-sm text-slate-400">
                            No statuses available for this circuit
                          </div>
                        ) : (
                          statuses.map(renderStatusItem)
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Status Flow Indicator */}
              <motion.div
                className="flex items-center justify-center py-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
              </motion.div>

              {/* Next Status Field */}
              <FormField
                control={form.control}
                name="nextStatusId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-blue-400" />
                      Next Status
                      <span className="text-red-400">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={handleNextStatusChange}
                      value={field.value}
                      disabled={
                        isLoadingStatuses ||
                        !formData.currentStatusId ||
                        isCheckingDuplicate
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 bg-slate-800/60 border-slate-700/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white rounded-lg transition-all duration-200 hover:bg-slate-800/80">
                          <SelectValue placeholder="Select next status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900/95 border-slate-700/50 backdrop-blur-md">
                        {isLoadingStatuses || !formData.currentStatusId ? (
                          <div className="flex items-center justify-center p-3">
                            <Loader2 className="h-3 w-3 animate-spin text-blue-500 mr-2" />
                            <span className="text-sm text-slate-300">
                              {isLoadingStatuses
                                ? "Loading statuses..."
                                : "Select current status first"}
                            </span>
                          </div>
                        ) : nextStatusOptions.length === 0 ? (
                          <div className="p-3 text-center text-sm text-slate-400">
                            No available next statuses
                          </div>
                        ) : (
                          nextStatusOptions.map(renderStatusItem)
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Duplicate Check Indicator */}
              <AnimatePresence>
                {isCheckingDuplicate && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20"
                  >
                    <Loader2 className="h-3 w-3 animate-spin text-blue-400 mr-2" />
                    <span className="text-sm text-blue-300">Checking for duplicate steps...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Transition Preview */}
              <AnimatePresence>
                {formData.currentStatusId && formData.nextStatusId && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="p-4 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10 border border-blue-500/20 rounded-lg backdrop-blur-sm"
                  >
                    <Label className="text-sm font-medium text-blue-300 mb-3 block flex items-center gap-1.5">
                      <Workflow className="h-3 w-3" />
                      Status Transition Preview
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                      {/* Current Status */}
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {getStatusIcon(getStatusById(formData.currentStatusId))}
                          <span className="text-white font-medium text-sm">
                            {getStatusById(formData.currentStatusId)?.title || "Current"}
                          </span>
                        </div>
                        {renderStatusBadges(getStatusById(formData.currentStatusId))}
                        {getStatusById(formData.currentStatusId)?.description && (
                          <p className="text-xs text-slate-400 mt-1">
                            {getStatusById(formData.currentStatusId)?.description}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="p-1.5 rounded-full bg-blue-500/20 border border-blue-400/30"
                        >
                          <ArrowRight className="h-3 w-3 text-blue-400" />
                        </motion.div>
                      </div>

                      {/* Next Status */}
                      <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 backdrop-blur-sm">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {getStatusIcon(getStatusById(formData.nextStatusId))}
                          <span className="text-white font-medium text-sm">
                            {getStatusById(formData.nextStatusId)?.title || "Next"}
                          </span>
                        </div>
                        {renderStatusBadges(getStatusById(formData.nextStatusId))}
                        {getStatusById(formData.nextStatusId)?.description && (
                          <p className="text-xs text-slate-400 mt-1">
                            {getStatusById(formData.nextStatusId)?.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
