import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { ItemsTable } from "@/components/reference-tables/ItemsTable";
import { PageLayout } from "@/components/layout/PageLayout";

const ItemsPage = () => {
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  const pageActions = [
    {
      label: "Create Item",
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
      title="Items"
      subtitle="Manage items used in document lines"
      icon={Package}
      actions={pageActions}
    >
      <ItemsTable />

      {/* TODO: Add CreateItemWizard component when it becomes available */}
      {/* <CreateItemWizard
        open={isCreateWizardOpen}
        onOpenChange={setIsCreateWizardOpen}
        onSuccess={() => {
          setIsCreateWizardOpen(false);
          // The table will automatically refresh via React Query
        }}
      /> */}
    </PageLayout>
  );
};

export default ItemsPage;
