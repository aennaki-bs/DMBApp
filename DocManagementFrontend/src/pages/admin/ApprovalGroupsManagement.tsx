import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UsersRound, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ApprovalGroupsTable } from "@/components/approval/ApprovalGroupsTable";

export default function ApprovalGroupsManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
      onClick: () => {
        // This will be handled within the table component
        // We could pass a callback here if needed
      },
    },
  ];

  return (
    <PageLayout
      title="Approval Groups"
      subtitle="Manage approval groups for document workflows"
      icon={UsersRound}
      actions={pageActions}
    >
      <ApprovalGroupsTable />
    </PageLayout>
  );
}
