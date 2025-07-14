import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UsersRound, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ApprovalGroupsTable } from "@/components/approval/ApprovalGroupsTable";
import ApprovalGroupCreateDialog from "@/components/approval/ApprovalGroupCreateDialog";

export default function ApprovalGroupsManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is authenticated and has appropriate role
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!user || (user.role !== "Admin" && user.role !== "FullUser")) {
      toast.error("You don't have permission to access this page");
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  // Page actions for PageLayout
  const pageActions = [
    {
      label: "New Approval Group",
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => setCreateDialogOpen(true),
    },
  ];

  return (
    <PageLayout
      title="Approval Groups"
      subtitle="Manage approval groups for document workflows"
      icon={UsersRound}
      actions={pageActions}
    >
      <ApprovalGroupsTable
        onCreateGroup={() => setCreateDialogOpen(true)}
        refreshTrigger={refreshTrigger}
      />

      <ApprovalGroupCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          // Trigger table refresh by incrementing the refresh trigger
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </PageLayout>
  );
}
