import { useState, useEffect } from "react";
import { toast } from "sonner";
import VendorTable from "@/components/reference-tables/VendorTable";
import CreateVendorWizard from "@/components/reference-tables/CreateVendorWizard";
import { Plus, Truck, FileDown } from "lucide-react";
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
      label: "Export Vendors",
      variant: "outline" as const,
      icon: FileDown,
      onClick: () => {
        // Export functionality
      },
    },
    {
      label: "Add Vendor",
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
