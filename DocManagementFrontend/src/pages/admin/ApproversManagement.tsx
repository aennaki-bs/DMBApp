import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ApproversTable } from "@/components/approval/ApproversTable";
import ApproverCreateWizard from "@/components/approval/ApproverCreateWizard";
import { UserPlus, UserCog } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";

const ApproversManagement = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isCreateApproverOpen, setIsCreateApproverOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { t } = useTranslation();

    useEffect(() => {
        // Check if user is authenticated and has admin role
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user?.role !== "Admin") {
            toast.error("You don't have permission to access this page");
            navigate("/dashboard");
        }
    }, [isAuthenticated, user, navigate]);

    const pageActions = [
        {
            label: "New Approver",
            variant: "default" as const,
            icon: UserPlus,
            onClick: () => setIsCreateApproverOpen(true),
        },
    ];

    return (
        <PageLayout
            title="Approvers Management"
            subtitle="Manage individual approvers for document workflows"
            icon={UserCog}
            actions={pageActions}
        >
            <ApproversTable
                onCreateApprover={() => setIsCreateApproverOpen(true)}
                refreshTrigger={refreshTrigger}
            />
            <ApproverCreateWizard
                open={isCreateApproverOpen}
                onOpenChange={setIsCreateApproverOpen}
                onSuccess={() => {
                    setIsCreateApproverOpen(false);
                    // Trigger table refresh by incrementing the refresh trigger
                    setRefreshTrigger(prev => prev + 1);
                }}
            />
        </PageLayout>
    );
};

export default ApproversManagement;
