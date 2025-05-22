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
  User,
  FileText,
  CheckCircle,
  Search,
  UserRound,
} from "lucide-react";
import {
  UserOption,
  UserSearchSelect,
} from "@/components/user/UserSearchSelect";
import { Textarea } from "@/components/ui/textarea";
import approvalService from "@/services/approvalService";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface ApproverCreateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Step definition interface
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

// Form data interface
interface FormData {
  userId?: number;
  username?: string;
  comment: string;
}

const MotionDiv = motion.div;

export default function ApproverCreateWizard({
  open,
  onOpenChange,
  onSuccess,
}: ApproverCreateWizardProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    userId: undefined,
    username: undefined,
    comment: "",
  });

  // Users data
  const [eligibleUsers, setEligibleUsers] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserOption[]>([]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData({
        userId: undefined,
        username: undefined,
        comment: "",
      });
      setSearchQuery("");
      fetchAvailableUsers();
    }
  }, [open]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(eligibleUsers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = eligibleUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, eligibleUsers]);

  // Step definitions
  const steps: Step[] = [
    {
      id: 1,
      title: "Select User",
      description: "Choose a user to be an approver",
      icon: <User className="h-4 w-4" />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Additional Info",
      description: "Add comments or notes",
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: "Review",
      description: "Confirm approver details",
      icon: <CheckCircle className="h-4 w-4" />,
      completed: false,
    },
  ];

  const TOTAL_STEPS = steps.length;

  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const users = await approvalService.getAvailableApprovers();
      setEligibleUsers(users);
      setFilteredUsers(users);
      
      if (users.length === 0) {
        // If no available users, show a message
        toast.info("All eligible users are already approvers");
      }
    } catch (error) {
      console.error("Failed to fetch available users:", error);
      toast.error("Failed to load available users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleUpdateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Select User
        if (!formData.userId) {
          toast.error("Please select a user");
          return false;
        }

        // Update username in form data
        const selectedUser = eligibleUsers.find(
          (u) => u.userId === formData.userId
        );
        if (selectedUser && selectedUser.username !== formData.username) {
          handleUpdateFormData("username", selectedUser.username);
        }

        return true;

      case 2: // Additional Info
        // No validation needed for comments
        return true;

      case 3: // Review
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

    try {
      setIsSubmitting(true);
      toast.loading("Creating approver...");

      // Prepare the request data
      const requestData = {
        userId: formData.userId!,
        comment: formData.comment.trim() || undefined,
      };

      // Call the API to create the approver
      const response = await approvalService.createApprovator(requestData);

      toast.dismiss();
      toast.success(`Approver "${formData.username}" created successfully`);

      onSuccess(); // Notify parent component
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Failed to create approver:", error);
      toast.dismiss();
      toast.error("Failed to create approver");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectUser = (user: UserOption) => {
    handleUpdateFormData("userId", user.userId);
    handleUpdateFormData("username", user.username);
  };

  const renderStepContent = () => {
    const variants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    };

    switch (currentStep) {
      case 1: // Select User
        return (
          <MotionDiv
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <User className="mx-auto h-12 w-12 text-blue-500 mb-3 p-2 bg-blue-500/10 rounded-full" />
                <h3 className="text-lg font-medium text-blue-100">
                  Select User
                </h3>
                <p className="text-sm text-blue-300/70">
                  Choose a user who will be assigned as an approver
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-blue-500" />
                    Available Users
                  </Label>
                  <div className="relative w-[220px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-[#0d1541]/70 border-blue-900/50 text-white"
                    />
                  </div>
                </div>

                <div className="border rounded-md border-blue-900/50">
                  <ScrollArea className="h-[260px] rounded-md">
                    {isLoadingUsers ? (
                      <div className="p-4 space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4"
                          >
                            <Skeleton className="h-4 w-4 rounded" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-[150px]" />
                              <Skeleton className="h-3 w-[100px]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                        {searchQuery.trim() !== "" ? (
                          <>
                            <Search className="h-8 w-8 mb-2 opacity-50" />
                            <p>No users found matching "{searchQuery}"</p>
                            <Button
                              variant="link"
                              onClick={() => setSearchQuery("")}
                              className="mt-2"
                            >
                              Clear search
                            </Button>
                          </>
                        ) : (
                          <>
                            <User className="h-8 w-8 mb-2 opacity-50" />
                            <p>No users available</p>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="p-2">
                        {filteredUsers.map((user) => {
                          const isSelected = formData.userId === user.userId;

                          return (
                            <div
                              key={user.userId}
                              className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
                                isSelected ? "bg-muted" : "hover:bg-muted/50"
                              } cursor-pointer`}
                              onClick={() => handleSelectUser(user)}
                            >
                              <Checkbox
                                checked={isSelected}
                                id={`user-${user.userId}`}
                                onCheckedChange={() => handleSelectUser(user)}
                                className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                              />
                              <div className="flex flex-col min-w-0">
                                <Label
                                  htmlFor={`user-${user.userId}`}
                                  className="cursor-pointer font-medium text-sm"
                                >
                                  {user.username}
                                </Label>
                                {user.role && (
                                  <span className="text-xs text-muted-foreground truncate">
                                    {user.role}
                                  </span>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-blue-500 ml-auto" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <p className="text-xs text-blue-300/70 mt-2">
                  Only users with appropriate permissions can be assigned as
                  approvers
                </p>
              </div>
            </div>
          </MotionDiv>
        );

      case 2: // Additional Info
        return (
          <MotionDiv
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <FileText className="mx-auto h-12 w-12 text-blue-500 mb-3 p-2 bg-blue-500/10 rounded-full" />
                <h3 className="text-lg font-medium text-blue-100">
                  Additional Information
                </h3>
                <p className="text-sm text-blue-300/70">
                  Add any comments or notes about this approver (optional)
                </p>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Add comments about this approver's role or responsibilities..."
                  className="min-h-[120px] bg-[#0d1541]/70 border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
                  value={formData.comment}
                  onChange={(e) =>
                    handleUpdateFormData("comment", e.target.value)
                  }
                />

                <p className="text-xs text-blue-300/70 mt-2">
                  Comments help document the purpose of this approver in
                  workflows
                </p>
              </div>
            </div>
          </MotionDiv>
        );

      case 3: // Review
        return (
          <MotionDiv
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <div className="text-center mb-6">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3 p-2 bg-green-500/10 rounded-full" />
                <h3 className="text-lg font-medium text-blue-100">
                  Review Details
                </h3>
                <p className="text-sm text-blue-300/70">
                  Confirm the approver information before creating
                </p>
              </div>

              <div className="space-y-4 bg-[#0d1541]/70 p-4 rounded-md border border-blue-900/30">
                <div className="flex justify-between items-center">
                  <span className="text-blue-300 text-sm">User</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">
                      {formData.username}
                    </span>
                  </div>
                </div>

                <div className="border-t border-blue-900/20 pt-3">
                  <span className="text-blue-300 text-sm">Comment</span>
                  <div className="mt-1 text-white">
                    {formData.comment ? (
                      <p className="text-sm">{formData.comment}</p>
                    ) : (
                      <p className="text-sm text-blue-300/50 italic">
                        No comment added
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-900/20 p-3 rounded-md mt-4">
                <p className="text-sm text-blue-200">
                  Ready to create this approver. Click "Create Approver" to
                  confirm.
                </p>
              </div>
            </div>
          </MotionDiv>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-[#0a1033] border border-blue-900/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-100">
            Create New Approver
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Assign a user as an approver for document workflows
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-4 mt-2">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2",
                    step.id === currentStep
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : step.completed
                      ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500"
                      : "border-gray-300 text-gray-500 dark:border-gray-700"
                  )}
                >
                  {step.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon || step.id
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    step.id === currentStep
                      ? "text-blue-600 dark:text-blue-500"
                      : step.completed
                      ? "text-green-600 dark:text-green-500"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={cn(
                    "text-xs text-gray-500 dark:text-gray-400 hidden sm:block",
                    step.id === currentStep &&
                      "text-blue-600 dark:text-blue-500"
                  )}
                >
                  {step.description}
                </span>
              </div>
            ))}
          </div>

          {/* Progress line */}
          <div className="relative mt-4 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div
                className="h-1 bg-blue-600 dark:bg-blue-500 rounded transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-2 min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
                className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={currentStep === 1 && !formData.userId}
                className={`${
                  currentStep === 1 && !formData.userId
                    ? "bg-blue-600/50 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white`}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-2" /> Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Create Approver
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
