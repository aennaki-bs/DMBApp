import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ResponsibilityCentreTable } from "@/components/responsibility-centre/ResponsibilityCentreTable";
import { ResponsibilityCentreCreateDialog } from "@/components/responsibility-centre/dialogs/ResponsibilityCentreCreateDialog";
import { useResponsibilityCentreManagement } from "@/hooks/useResponsibilityCentreManagement";
import { Plus, Building } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";

const ResponsibilityCentreManagement = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isCreateCentreOpen, setIsCreateCentreOpen] = useState(false);
    const { t } = useTranslation();
    const { refetch } = useResponsibilityCentreManagement();

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
            label: "Create Centre",
            variant: "default" as const,
            icon: Plus,
            onClick: () => setIsCreateCentreOpen(true),
        },
    ];

    const handleCreateSuccess = () => {
        refetch(); // Auto-refresh the table
        setIsCreateCentreOpen(false);
    };

    return (
        <PageLayout
            title="Responsibility Centres"
            subtitle="Manage responsibility centres and user assignments"
            icon={Building}
            actions={pageActions}
        >
            <ResponsibilityCentreTable />
            <ResponsibilityCentreCreateDialog
                open={isCreateCentreOpen}
                onOpenChange={setIsCreateCentreOpen}
                onSuccess={handleCreateSuccess}
            />
        </PageLayout>
    );
};

export default ResponsibilityCentreManagement; 