import { useState, useEffect } from "react";
import VendorManagementPage from "@/components/pages/vendor-management/VendorManagementPage";
import CreateVendorWizard from "@/components/reference-tables/CreateVendorWizard";
import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";

const VendorManagementPageWrapper = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const pageActions = [
    {
      label: "Add Vendor",
      variant: "default" as const,
      icon: Plus,
      onClick: () => setIsCreateVendorOpen(true),
    },
  ];

  return (
    <>
      <VendorManagementPage />
      <CreateVendorWizard
        isOpen={isCreateVendorOpen}
        onClose={() => setIsCreateVendorOpen(false)}
      />
    </>
  );
};

export default VendorManagementPageWrapper;
