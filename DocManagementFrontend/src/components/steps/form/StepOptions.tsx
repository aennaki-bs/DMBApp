import { useStepForm } from "./StepFormProvider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info, AlertCircle, Settings, UserCheck, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApproverSelector } from "./ApproverSelector";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z
  .object({
    requiresApproval: z.boolean(),
    approvalType: z.enum(["user", "group"]).optional().nullable(),
    approvalUserId: z.number().optional().nullable(),
    approvalGroupId: z.number().optional().nullable(),
  })
  .refine(
    (data) => {
      // If approval is required, we need either a user or a group
      if (data.requiresApproval) {
        if (data.approvalType === "user") {
          return !!data.approvalUserId;
        } else if (data.approvalType === "group") {
          return !!data.approvalGroupId;
        }
        return false;
      }
      return true;
    },
    {
      message: "Please select an approver",
      path: ["approvalType"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export const StepOptions = () => {
  const { formData, setFormData, registerStepForm, isEditMode } = useStepForm();

  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Determine initial approvalType from formData
  const initialApprovalType = formData.approvalUserId
    ? "user"
    : formData.approvalGroupId
      ? "group"
      : null;

  // Initialize form BEFORE any useEffect that depends on it
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requiresApproval: formData.requiresApproval || false,
      approvalType: initialApprovalType,
      approvalUserId: formData.approvalUserId || null,
      approvalGroupId: formData.approvalGroupId || null,
    },
    mode: "onChange",
  });

  // Sync form values with context data when formData changes (especially in edit mode)
  useEffect(() => {
    if (isEditMode && formData.requiresApproval) {
      form.setValue("requiresApproval", formData.requiresApproval);
      if (formData.approvalType) {
        form.setValue("approvalType", formData.approvalType);
      }
      if (formData.approvalUserId) {
        form.setValue("approvalUserId", formData.approvalUserId);
      }
      if (formData.approvalGroupId) {
        form.setValue("approvalGroupId", formData.approvalGroupId);
      }
    }
  }, [formData, isEditMode, form]);

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(3, {
      validate: async () => {
        setValidationError(null);
        const result = await form.trigger();

        if (!result) {
          // Get the first error message to display
          const errors = form.formState.errors;
          if (errors.approvalType) {
            setValidationError(
              errors.approvalType.message || "Please select an approver"
            );
          } else if (errors.approvalUserId) {
            setValidationError(
              errors.approvalUserId.message ||
              "Please select an individual approver"
            );
          } else if (errors.approvalGroupId) {
            setValidationError(
              errors.approvalGroupId.message ||
              "Please select an approval group"
            );
          }
        }

        return result;
      },
      getValues: () => form.getValues(),
    });
  }, [registerStepForm, form]);

  const handleApprovalTypeChange = (type: "individual" | "group") => {
    const approvalType = type === "individual" ? "user" : "group";
    console.log("Changing approval type to:", approvalType);

    form.setValue("approvalType", approvalType);
    setValidationError(null);

    // Reset the previous values when changing type
    if (type === "individual") {
      form.setValue("approvalGroupId", null);
    } else {
      form.setValue("approvalUserId", null);
    }

    setFormData({
      approvalType,
      approvalUserId:
        type === "individual" ? formData.approvalUserId : undefined,
      approvalGroupId: type === "group" ? formData.approvalGroupId : undefined,
    });
  };

  const onRequiresApprovalChange = (checked: boolean) => {
    console.log("Requires approval changed:", checked);
    form.setValue("requiresApproval", checked);
    setValidationError(null);

    if (!checked) {
      form.setValue("approvalType", null);
      form.setValue("approvalUserId", null);
      form.setValue("approvalGroupId", null);

      // Update form data when turning off approval
      setFormData({
        requiresApproval: checked,
        approvalType: undefined,
        approvalUserId: undefined,
        approvalGroupId: undefined,
      });
    } else {
      // When turning on approval, ensure there's a default approval type
      const currentType = form.getValues("approvalType");
      if (!currentType) {
        form.setValue("approvalType", "user");
        setFormData({
          requiresApproval: checked,
          approvalType: "user",
        });
      } else {
        setFormData({
          requiresApproval: checked,
          approvalType: currentType,
        });
      }
    }
  };

  const onUserSelected = (userId: number | undefined) => {
    console.log("User selected in parent:", userId);
    form.setValue("approvalUserId", userId || null);
    // Use the updated form state to set form data
    setFormData({
      approvalUserId: userId,
      // Explicitly set approvalType to make sure it's updated
      approvalType: "user",
      // Clear any group selection
      approvalGroupId: undefined,
    });
    setValidationError(null);
  };

  const onGroupSelected = (groupId: number | undefined) => {
    console.log("Group selected in parent:", groupId);
    form.setValue("approvalGroupId", groupId || null);
    // Use the updated form state to set form data
    setFormData({
      approvalGroupId: groupId,
      // Explicitly set approvalType to make sure it's updated
      approvalType: "group",
      // Clear any user selection
      approvalUserId: undefined,
    });
    setValidationError(null);
  };

  // Convert approval type from form format to component format
  const getApprovalTypeForComponent = () => {
    const type = form.watch("approvalType");
    console.log("Current approval type:", type);
    return type === "user" ? "individual" : "group";
  };

  const requiresApproval = form.watch("requiresApproval");

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
              <Settings className="h-3.5 w-3.5 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-white">Step Options</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-blue-400/60" />
                Configure approval requirements for this workflow step
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...form}>
            <form className="space-y-4">
              {/* Compact Approval Toggle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 bg-slate-800/60 border border-slate-700/50 rounded-lg backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="requiresApproval"
                      className="text-sm font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-blue-400" />
                      Requires Approval
                    </Label>
                    <p className="text-xs text-slate-400">
                      Enable if documents need manual approval before proceeding
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Switch
                      id="requiresApproval"
                      checked={requiresApproval}
                      onCheckedChange={onRequiresApprovalChange}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Compact Approval Settings */}
              <AnimatePresence>
                {requiresApproval && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-3"
                  >
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-blue-700/10 border border-blue-500/20 rounded-lg backdrop-blur-sm">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Users className="h-3.5 w-3.5 text-blue-400" />
                        <h4 className="text-sm font-medium text-blue-300">Approval Configuration</h4>
                      </div>

                      {isLoading ? (
                        <Skeleton className="h-32 w-full bg-blue-900/20 rounded-lg" />
                      ) : (
                        <FormField
                          control={form.control}
                          name="approvalType"
                          render={() => (
                            <FormItem>
                              <ApproverSelector
                                selectedUserId={
                                  form.watch("approvalUserId") || undefined
                                }
                                selectedGroupId={
                                  form.watch("approvalGroupId") || undefined
                                }
                                onUserSelected={onUserSelected}
                                onGroupSelected={onGroupSelected}
                                approvalType={getApprovalTypeForComponent()}
                                onApprovalTypeChange={handleApprovalTypeChange}
                              />

                              {validationError && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="mt-3"
                                >
                                  <Alert className="bg-red-950/20 border-red-500/30 backdrop-blur-sm">
                                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                                    <AlertDescription className="text-red-300 ml-2 text-sm">
                                      {validationError}
                                    </AlertDescription>
                                  </Alert>
                                </motion.div>
                              )}

                              <FormMessage className="text-red-400 text-xs mt-1" />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Compact Info Panel */}
              <AnimatePresence>
                {!requiresApproval && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-3 bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 border border-slate-700/50 rounded-lg backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 rounded bg-blue-500/20">
                        <Info className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-300 mb-0.5">Automatic Processing</h4>
                        <p className="text-xs text-slate-400">
                          When approval is not required, documents will automatically progress to the next step without manual intervention.
                        </p>
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
