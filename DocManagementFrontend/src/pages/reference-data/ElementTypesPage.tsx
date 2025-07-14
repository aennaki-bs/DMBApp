import { useState } from "react";
import { Database, Plus } from "lucide-react";
import { ElementTypesTable } from "@/components/line-elements/ElementTypesTable";
import CreateElementTypeWizard from "@/components/line-elements/CreateElementTypeWizard";
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
      <ElementTypesTable
        isCreateWizardOpen={isCreateWizardOpen}
        setIsCreateWizardOpen={setIsCreateWizardOpen}
      />

      {/* Create Element Type Wizard */}
      <CreateElementTypeWizard
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        onSuccess={() => {
          setIsCreateWizardOpen(false);
          // The table will automatically refresh via React Query
        }}
        availableItems={[]} // TODO: Load from API if needed
        availableGeneralAccounts={[]} // TODO: Load from API if needed
      />
    </PageLayout>
  );
};

export default ElementTypesPage; 