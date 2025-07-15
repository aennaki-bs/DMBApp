import { useState } from "react";
import { Hash, Plus } from "lucide-react";
import { UnitCodesTable } from "@/components/reference-tables/UnitCodesTable";
import { PageLayout } from "@/components/layout/PageLayout";

const UnitCodesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pageActions = [
    {
      label: "Create Unit Code (Disabled)",
      variant: "outline" as const,
      icon: Plus,
      onClick: () => {
        // Disabled - no action
      },
    },
  ];

  return (
    <PageLayout
      title="Unit Codes"
      subtitle="Manage unit codes used in document lines"
      icon={Hash}
      actions={pageActions}
    >
      <UnitCodesTable />
    </PageLayout>
  );
};

export default UnitCodesPage;
