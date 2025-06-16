import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import { ResponsibilityCentreTable } from "@/components/responsibility-centre/ResponsibilityCentreTable";
import { CreateResponsibilityCentreDialog } from "@/components/responsibility-centre/CreateResponsibilityCentreDialog";

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
      toast.error(t("errors.noPermission"));
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate, t]);

  const pageActions = [
    {
      label: t("responsibilityCentres.createCentre"),
      variant: "default" as const,
      icon: Plus,
      onClick: () => setIsCreateCentreOpen(true),
    },
  ];

  return (
    <PageLayout
      title={t("responsibilityCentres.title")}
      subtitle={t("responsibilityCentres.subtitle")}
      icon={Building2}
      actions={pageActions}
    >
      <ResponsibilityCentreTable />
      <CreateResponsibilityCentreDialog
        open={isCreateCentreOpen}
        onOpenChange={setIsCreateCentreOpen}
      />
    </PageLayout>
  );
};

export default ResponsibilityCentreManagement;
