import { useState, useEffect } from "react";
import { Database, Plus } from "lucide-react";
import LineElementTypeManagement from "@/components/line-elements/LineElementTypeManagement";
import { PageLayout } from "@/components/layout/PageLayout";

const ElementTypesPage = () => {
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  const pageActions = [
    {
      label: "Create Element Type",
      variant: "default" as const,
      icon: Plus,
      onClick: () => setIsCreateWizardOpen(true),
    },
  ];

  return (
    <PageLayout
      title="Element Types"
      subtitle="Manage element types for document line items"
      icon={Database}
      actions={pageActions}
    >
      <LineElementTypeManagement 
        isCreateWizardOpen={isCreateWizardOpen}
        setIsCreateWizardOpen={setIsCreateWizardOpen}
      />
    </PageLayout>
  );
};

export default ElementTypesPage; 