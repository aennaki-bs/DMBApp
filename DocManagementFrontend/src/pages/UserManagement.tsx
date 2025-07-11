import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserTable } from "@/components/admin/UserTable";
import { CreateUserMultiStep } from "@/components/admin/CreateUserMultiStep";
import { UserPlus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";

const UserManagement = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
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
            label: "Create User",
            variant: "default" as const,
            icon: UserPlus,
            onClick: () => setIsCreateUserOpen(true),
        },
    ];

    return (
        <PageLayout
            title="User Management"
            subtitle="Manage users and their permissions"
            icon={Users}
            actions={pageActions}
        >
            <UserTable />
            <CreateUserMultiStep
                open={isCreateUserOpen}
                onOpenChange={setIsCreateUserOpen}
            />
        </PageLayout>
    );
};

export default UserManagement; 