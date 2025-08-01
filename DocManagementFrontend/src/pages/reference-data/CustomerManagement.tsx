import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomerTable } from "@/components/reference-tables/CustomerTable";
import CreateCustomerWizard from "@/components/reference-tables/CreateCustomerWizard";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";

const CustomerManagementPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // You can add role-based access control here if needed
    // if (user?.role !== "Admin" && user?.role !== "FullUser") {
    //   toast.error("You do not have permission to access customer management");
    //   navigate("/dashboard");
    // }
  }, [isAuthenticated, user, navigate]);

  const pageActions = [
    {
      label: "Create Customer",
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
      title="Customer Management"
      subtitle="Manage customer information and relationships"
      icon={Users}
      actions={pageActions}
    >
      <CustomerTable />
      <CreateCustomerWizard
        isOpen={isCreateCustomerOpen}
        onClose={() => setIsCreateCustomerOpen(false)}
      />
    </PageLayout>
  );
};

export default CustomerManagementPage;
