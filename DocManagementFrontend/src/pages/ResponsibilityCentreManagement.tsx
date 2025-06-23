import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ResponsibilityCentreTable } from "@/components/responsibility-centre/ResponsibilityCentreTable";
import { CreateResponsibilityCentreDialog } from "@/components/responsibility-centre/CreateResponsibilityCentreDialog";
import { PageLayout } from "@/components/layout/PageLayout";
import { Plus, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function ResponsibilityCentreManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState<(() => void) | null>(
    null
  );
  const { user, hasRole, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Enhanced role checking function
  const isAdmin = (): boolean => {
    if (!user) return false;

    // Multiple approaches to ensure compatibility with case-insensitive checking
    const userRole = user.role;
    const directStringCheck =
      typeof userRole === "string" && userRole.toLowerCase() === "admin";
    const objectRoleCheck =
      userRole &&
      typeof userRole === "object" &&
      (userRole as any)?.roleName?.toLowerCase() === "admin";
    const hasRoleCheck =
      hasRole("Admin") || hasRole("ADMIN") || hasRole("admin");

    return directStringCheck || objectRoleCheck || hasRoleCheck;
  };

  // Check authentication and role
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    if (!isAdmin()) {
      navigate("/dashboard");
      return;
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  const handleCreateDialogChange = (open: boolean) => {
    setCreateDialogOpen(open);
    if (!open && refetchTrigger) {
      // Trigger refetch when dialog closes (after successful creation)
      refetchTrigger();
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Block access if not authenticated or not admin
  if (!isAuthenticated || !user || !isAdmin()) {
    return null;
  }

  const pageActions = [
    {
      label: "Create Responsibility Centre",
      variant: "default" as const,
      icon: Plus,
      onClick: () => setCreateDialogOpen(true),
    },
  ];

  return (
    <PageLayout
      title="Responsibility Centre Management"
      subtitle="Manage organizational responsibility centres and their associated users"
      icon={Building2}
      actions={pageActions}
    >
      <div className="h-full">
        <ResponsibilityCentreTable
          onRefetchReady={(refetchFn) => setRefetchTrigger(() => refetchFn)}
        />
      </div>

      <CreateResponsibilityCentreDialog
        open={createDialogOpen}
        onOpenChange={handleCreateDialogChange}
      />
    </PageLayout>
  );
}

export default ResponsibilityCentreManagement;
