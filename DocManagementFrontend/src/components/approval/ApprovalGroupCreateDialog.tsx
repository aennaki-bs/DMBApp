import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Users,
  Settings,
  FileText,
  UserRound,
  UsersRound,
  Loader2,
} from "lucide-react";
import {
  ApprovalGroupFormData,
  ApprovalRuleType,
  ApproverInfo,
} from "@/models/approval";
import approvalService from "@/services/approvalService";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Step components
import { GroupDetailsStep } from "./steps/GroupDetailsStep";
import { SelectUsersStep } from "./steps/SelectUsersStep";
import { RuleSelectionStep } from "./steps/RuleSelectionStep";
import { MinimumWithRequiredConfigStep } from "./steps/MinimumWithRequiredConfigStep";
import { ReviewStep } from "./steps/ReviewStep";

interface ApprovalGroupCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ExtendedReviewStepProps {
  formData: ApprovalGroupFormData;
  onEdit?: (step: number) => void;
}

const MotionDiv = motion.div;

export default function ApprovalGroupCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: ApprovalGroupCreateDialogProps) {
  // Form state
  const [formData, setFormData] = useState<ApprovalGroupFormData>({
    name: "",
    comment: "",
    selectedUsers: [],
    ruleType: ApprovalRuleType.Any,
    minimumApprovals: 1,
    requiredMemberIds: [],
  });

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<ApproverInfo[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData({
        name: "",
        comment: "",
        selectedUsers: [],
        ruleType: ApprovalRuleType.Any,
        minimumApprovals: 1,
        requiredMemberIds: [],
      });
      fetchAvailableUsers();
    }
  }, [open]);

  // Dynamically determine steps based on rule type
  const getSteps = () => {
    const baseSteps = [
      {
        id: 1,
        title: "Group Details",
        description: "Name and basic information",
        icon: <FileText className="h-4 w-4" />,
        completed: currentStep > 1,
      },
      {
        id: 2,
        title: "Approval Rules",
        description: "Set approval requirements",
        icon: <Settings className="h-4 w-4" />,
        completed: currentStep > 2,
      },
      {
        id: 3,
        title: "Select Users",
        description: "Add users to the group",
        icon: <UserRound className="h-4 w-4" />,
        completed: currentStep > 3,
      },
    ];

    // Add MinimumWithRequired config step if that rule is selected
    if (formData.ruleType === ApprovalRuleType.MinimumWithRequired) {
      baseSteps.push({
        id: 4,
        title: "Configure Rule",
        description: "Set minimum and required members",
        icon: <Settings className="h-4 w-4" />,
        completed: currentStep > 4,
      });
    }

    // Add review step
    const reviewStepId = formData.ruleType === ApprovalRuleType.MinimumWithRequired ? 5 : 4;
    baseSteps.push({
      id: reviewStepId,
      title: "Review",
      description: "Confirm group details",
      icon: <Check className="h-4 w-4" />,
      completed: false,
    });

    return baseSteps;
  };

  const steps = getSteps();
  const TOTAL_STEPS = steps.length;

  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingUsers(true);
      // For approval groups, get eligible approvers (accessible to both Admins and FullUsers)
      // Unlike individual approver creation, we don't need to filter out existing approvers
      const users = await approvalService.getEligibleApprovers();

      setAvailableUsers(users);
    } catch (error) {
      console.error("Failed to fetch available users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUpdateFormData = (
    field: keyof ApprovalGroupFormData,
    value: string | ApproverInfo[] | ApprovalRuleType
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Group Details
        if (!formData.name.trim()) {
          toast.error("Group name is required");
          return false;
        }
        return true;
      case 2: // Approval Rules
        // This step is always valid as we have a default selection
        return true;
      case 3: // Select Users
        if (formData.selectedUsers.length === 0) {
          toast.error("Please select at least 2 users for the approval group");
          return false;
        }
        if (formData.selectedUsers.length < 2) {
          toast.error("Approval groups require a minimum of 2 users to be effective");
          return false;
        }
        return true;
      case 4: // Configure Rule (for MinimumWithRequired) or Review (for others)
        if (formData.ruleType === ApprovalRuleType.MinimumWithRequired) {
          // Validate MinimumWithRequired configuration
          if (!formData.minimumApprovals || formData.minimumApprovals < 1) {
            toast.error("Minimum approvals must be at least 1");
            return false;
          }
          if (formData.minimumApprovals > formData.selectedUsers.length) {
            toast.error("Minimum approvals cannot exceed the number of selected users");
            return false;
          }
          if (!formData.requiredMemberIds || formData.requiredMemberIds.length === 0) {
            toast.error("Please select at least one required member");
            return false;
          }
          return true;
        } else {
          // This is the review step for other rule types
          if (formData.selectedUsers.length === 0) {
            toast.error("Please select at least 2 users for the approval group");
            return false;
          }
          if (formData.selectedUsers.length < 2) {
            toast.error("Cannot create approval group with less than 2 users");
            return false;
          }
          return true;
        }
      case 5: // Review (for MinimumWithRequired)
        // Final validation before submission
        if (formData.selectedUsers.length === 0) {
          toast.error("Please select at least 2 users for the approval group");
          return false;
        }
        if (formData.selectedUsers.length < 2) {
          toast.error("Cannot create approval group with less than 2 users");
          return false;
        }
        if (formData.ruleType === ApprovalRuleType.MinimumWithRequired) {
          if (!formData.minimumApprovals || formData.minimumApprovals < 1) {
            toast.error("Minimum approvals must be at least 1");
            return false;
          }
          if (!formData.requiredMemberIds || formData.requiredMemberIds.length === 0) {
            toast.error("Please select at least one required member");
            return false;
          }
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    // Final validation before API call
    if (formData.selectedUsers.length < 2) {
      toast.error("Cannot create an approval group with less than 2 members");
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare the request data
      const requestData: any = {
        name: formData.name,
        comment: formData.comment,
        userIds: formData.selectedUsers.map((user) => user.userId),
        ruleType: formData.ruleType,
      };

      // Add MinimumWithRequired specific fields if that rule type is selected
      if (formData.ruleType === ApprovalRuleType.MinimumWithRequired) {
        requestData.minimumApprovals = formData.minimumApprovals;
        requestData.requiredMemberIds = formData.requiredMemberIds;
      }

      // For sequential approval type, we include orderIndex information
      if (formData.ruleType === ApprovalRuleType.Sequential && formData.selectedUsers.length > 0) {
        requestData.users = formData.selectedUsers.map((user, index) => ({
          userId: user.userId,
          orderIndex: index
        }));
      }

      // Log the request payload
      console.log("Creating approval group with payload:", requestData);

      // Call the API to create the group
      await approvalService.createApprovalGroup(requestData);

      onSuccess(); // Notify parent component
      toast.success("Approval group created successfully!");
    } catch (error) {
      console.error("Failed to create approval group:", error);
      toast.error("Failed to create approval group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const variants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    };

    switch (currentStep) {
      case 1:
        return (
          <MotionDiv
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <GroupDetailsStep
              name={formData.name}
              comment={formData.comment}
              onNameChange={(value) => handleUpdateFormData("name", value)}
              onCommentChange={(value) =>
                handleUpdateFormData("comment", value)
              }
            />
          </MotionDiv>
        );
      case 2:
        return (
          <MotionDiv
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <RuleSelectionStep
              selectedRule={formData.ruleType}
              onRuleChange={(value) =>
                handleUpdateFormData("ruleType", value as ApprovalRuleType)
              }
            />
          </MotionDiv>
        );
      case 3:
        return (
          <MotionDiv
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <SelectUsersStep
              availableUsers={availableUsers}
              selectedUsers={formData.selectedUsers}
              onSelectionChange={(users) =>
                handleUpdateFormData("selectedUsers", users)
              }
              isLoading={isLoadingUsers}
            />
          </MotionDiv>
        );
      case 4:
        // For MinimumWithRequired, show config step; for others, show review
        if (formData.ruleType === ApprovalRuleType.MinimumWithRequired) {
          return (
            <MotionDiv
              key="step4-config"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.2 }}
            >
              <MinimumWithRequiredConfigStep
                minimumApprovals={formData.minimumApprovals || 1}
                onMinimumApprovalsChange={(value) =>
                  handleUpdateFormData("minimumApprovals", value)
                }
                requiredMemberIds={formData.requiredMemberIds || []}
                onRequiredMemberIdsChange={(ids) =>
                  handleUpdateFormData("requiredMemberIds", ids)
                }
                selectedUsers={formData.selectedUsers}
              />
            </MotionDiv>
          );
        } else {
          return (
            <MotionDiv
              key="step4-review"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              transition={{ duration: 0.2 }}
            >
              <ReviewStep formData={formData} />
            </MotionDiv>
          );
        }
      case 5:
        // This is the review step for MinimumWithRequired
        return (
          <MotionDiv
            key="step5"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <ReviewStep formData={formData} />
          </MotionDiv>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.3)] max-w-3xl mx-auto rounded-xl h-[90vh] max-h-[700px] flex flex-col p-5">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-blue-400" />
            <DialogTitle className="text-lg text-blue-100">
              Create Approval Group
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300 text-xs">
            Create a new group for managing document approvals
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className={`grid gap-2 mb-2 ${
          steps.length === 4 ? 'grid-cols-4' : 
          steps.length === 5 ? 'grid-cols-5' : 
          'grid-cols-4'
        }`}>
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full mx-auto mb-1 transition-all duration-200",
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : step.completed
                    ? "bg-green-600/70 text-white"
                    : "bg-blue-900/50 text-blue-300"
                )}
              >
                {step.completed ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-xs font-medium",
                    currentStep === step.id
                      ? "text-blue-200"
                      : step.completed
                      ? "text-green-400"
                      : "text-blue-400/70"
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "text-[10px] hidden sm:block",
                    currentStep === step.id
                      ? "text-blue-300/90"
                      : step.completed
                      ? "text-green-400/70"
                      : "text-blue-400/50"
                  )}
                >
                  {step.description}
                </p>
              </div>
              {step.id < steps.length && (
                <div
                  className={cn(
                    "absolute top-4 left-[calc(50%+4px)] w-[calc(100%-8px)] h-0.5",
                    step.completed ? "bg-green-500/50" : "bg-blue-900/50"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content - The flex-grow allows this to take remaining space */}
        <div className="flex-grow overflow-auto px-1 py-2 min-h-0">
          <div className="h-full">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <DialogFooter className="flex justify-between items-center mt-4 pt-4 border-t border-blue-900/40 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/20"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>

            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600/80 hover:bg-green-600 text-white border border-green-500/50 hover:border-green-400/70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Create Group
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
