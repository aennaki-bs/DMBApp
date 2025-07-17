import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout/PageLayout";
import { Activity } from "lucide-react";
import { SystemActivityLogs } from "@/components/admin/SystemActivityLogs";

const ActivityLogsPage = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated and has admin role
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (user?.role !== "Admin") {
            toast.error("You do not have permission to access this page");
            navigate("/dashboard");
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <PageLayout
            title="Activity Logs"
            subtitle="Monitor system and user activity across the platform"
            icon={Activity}
        >
            <SystemActivityLogs />
        </PageLayout>
    );
};

export default ActivityLogsPage; 