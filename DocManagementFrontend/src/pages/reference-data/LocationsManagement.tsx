import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { LocationsTable } from "@/components/reference-tables/LocationsTable";
import { PageLayout } from "@/components/layout/PageLayout";

const LocationsManagementPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pageActions = [
    {
      label: "Create Location",
      variant: "outline" as const,
      icon: Plus,
      onClick: () => {
        // Do nothing when disabled
      },
      disabled: true, // Disabled create functionality
    },
  ];

  return (
    <PageLayout
      title="Locations Management"
      subtitle="Manage warehouse and storage locations for items"
      icon={MapPin}
      actions={pageActions}
    >
      <LocationsTable />
    </PageLayout>
  );
};

export default LocationsManagementPage; 