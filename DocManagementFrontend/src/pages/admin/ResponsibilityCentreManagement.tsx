import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ResponsibilityCentreTable } from "@/components/responsibility-centre/ResponsibilityCentreTable";
import { ResponsibilityCentreCreateDialog } from "@/components/responsibility-centre/dialogs/ResponsibilityCentreCreateDialog";
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

    // Create button is disabled instead of removed
    const pageActions = [
        {
            label: "Create Centre",
            variant: "default" as const,
            icon: Plus,
            onClick: () => {
                // Do nothing when disabled
            },
            disabled: true, // Disabled create functionality
        },
    ];

    return (
        <PageLayout
            title="Responsibility Centres"
            subtitle="Manage responsibility centres and user assignments"
            icon={Building}
            actions={pageActions}
        >
            <ResponsibilityCentreTable />
            {/* Keep dialog for consistency but it won't be accessible since button is disabled */}
            <ResponsibilityCentreCreateDialog
                open={isCreateCentreOpen}
                onOpenChange={setIsCreateCentreOpen}
                onSuccess={() => setIsCreateCentreOpen(false)}
            />
        </PageLayout>
    );
};

export default ResponsibilityCentreManagement;
