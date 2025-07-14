import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { ItemsTable } from "@/components/reference-tables/ItemsTable";
import { PageLayout } from "@/components/layout/PageLayout";

const ItemsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pageActions = [
    {
      label: "Create Item",
      variant: "outline" as const,
      icon: Plus,
      onClick: () => setIsCreateModalOpen(true),
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
    </PageLayout>
  );
};

export default ItemsPage;
