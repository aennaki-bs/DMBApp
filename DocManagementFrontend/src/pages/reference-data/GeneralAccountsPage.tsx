import { useState } from "react";
import { Calculator, Plus } from "lucide-react";
import { GeneralAccountsTable } from "@/components/reference-tables/GeneralAccountsTable";
import { PageLayout } from "@/components/layout/PageLayout";

const GeneralAccountsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const pageActions = [
    {
      label: "Create General Account",
      variant: "outline" as const,
      icon: Plus,
      onClick: () => setIsCreateModalOpen(true),
    },
  ];

  return (
    <PageLayout
      title="General Accounts"
      subtitle="Manage general accounts used in document lines"
      icon={Calculator}
      actions={pageActions}
    >
      <GeneralAccountsTable />
    </PageLayout>
  );
};

export default GeneralAccountsPage;
