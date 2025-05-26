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
  UserCheck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApproverInfo } from "@/models/approval";

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
  const [selectedUser, setSelectedUser] = useState<ApproverInfo | null>(null);
  const [availableUsers, setAvailableUsers] = useState<ApproverInfo[]>([]);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Reset form when dialog is opened
  useEffect(() => {
    if (open) {
      setSelectedUser(null);
      setComment("");
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const existingApprovers = await approvalService.getAllApprovators();
      const eligibleUsers = await approvalService.getEligibleApprovers();

      // Filter out users who are already approvers
      const existingApproverIds = existingApprovers.map(
        (approver) => approver.userId
      );
      const filteredUsers = eligibleUsers.filter(
        (user) => !existingApproverIds.includes(user.userId)
      );

      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch eligible users:", error);
      toast.error("Failed to load eligible users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    try {
      setIsLoading(true);

      const requestData = {
        userId: selectedUser.userId,
        comment: comment.trim() || undefined,
      };

      await approvalService.createApprovator(requestData);

      onSuccess();
      toast.success("Approver created successfully");
    } catch (error) {
      console.error("Failed to create approver:", error);
      toast.error("Failed to create approver");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.3)] max-w-xl mx-auto rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <UserCheck className="h-5 w-5 text-blue-400" />
            <DialogTitle className="text-xl text-blue-100">
              Create New Approver
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300">
            Add a new user to the approvers list
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select" className="text-blue-200">
              Select User
            </Label>
            <UserSearchSelect
              placeholder="Search for a user..."
              options={availableUsers}
              value={selectedUser}
              onChange={setSelectedUser}
              isLoading={isLoadingUsers}
              emptyMessage="No eligible users found"
              className="bg-[#22306e] border-blue-900/40 text-blue-100"
            />
            {availableUsers.length === 0 && !isLoadingUsers && (
              <p className="text-amber-400 text-sm mt-1 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
                All eligible users are already approvers
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-blue-200">
              Comment (Optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Add a comment about this approver..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-[#22306e] border-blue-900/40 text-blue-100 h-24 resize-none focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-6 pt-4 border-t border-blue-900/40">
          <div></div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-blue-300 hover:text-blue-200 hover:bg-blue-900/30"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isLoading || !selectedUser}
              className={`${
                !selectedUser
                  ? "bg-blue-900/50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Create Approver
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
