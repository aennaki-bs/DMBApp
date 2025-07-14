import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { VendorTable } from "@/components/reference-tables/VendorTable";
import CreateVendorWizard from "@/components/reference-tables/CreateVendorWizard";
import { Plus, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";

const VendorManagementPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // You can add role-based access control here if needed
    // if (user?.role !== "Admin" && user?.role !== "FullUser") {
    //   toast.error("You do not have permission to access vendor management");
    //   navigate("/dashboard");
    // }
  }, [isAuthenticated, user, navigate]);

  const pageActions = [
    {
      label: "Create Vendor",
      variant: "default" as const,
      icon: Plus,
      onClick: () => setIsCreateVendorOpen(true),
    },
  ];

  return (
    <PageLayout
      title="Vendor Management"
      subtitle="Manage your vendor database and supplier information"
      icon={Truck}
      actions={pageActions}
    >
      <VendorTable />
      <CreateVendorWizard
        isOpen={isCreateVendorOpen}
        onClose={() => setIsCreateVendorOpen(false)}
      />
    </PageLayout>
  );
};

export default VendorManagementPage;
