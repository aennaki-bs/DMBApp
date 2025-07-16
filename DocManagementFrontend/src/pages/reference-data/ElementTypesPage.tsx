import { useState, useEffect } from "react";
import { Database, Plus } from "lucide-react";
import { ElementTypesTable } from "@/components/line-elements/ElementTypesTable";
import CreateElementTypeWizard from "@/components/line-elements/CreateElementTypeWizard";
import { PageLayout } from "@/components/layout/PageLayout";
import lineElementsService from "@/services/lineElementsService";
import { Item, GeneralAccounts } from "@/models/lineElements";

const ElementTypesPage = () => {
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [availableGeneralAccounts, setAvailableGeneralAccounts] = useState<GeneralAccounts[]>([]);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(false);

  // Load reference data when component mounts
  useEffect(() => {
    const loadReferenceData = async () => {
      setIsLoadingReferenceData(true);
      try {
        const [itemsData, generalAccountsData] = await Promise.all([
          lineElementsService.items.getAll(),
          lineElementsService.generalAccounts.getAll(),
        ]);
        setAvailableItems(itemsData);
        setAvailableGeneralAccounts(generalAccountsData);
      } catch (error) {
        console.error("Failed to load reference data:", error);
        // Don't show error toast here as it's not critical for page functionality
        // Users can still create element types without this data
      } finally {
        setIsLoadingReferenceData(false);
      }
    };

    loadReferenceData();
  }, []);

  const pageActions = [
    {
      label: "Create Element Type",
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
        availableItems={availableItems}
        availableGeneralAccounts={availableGeneralAccounts}
      />
    </PageLayout>
  );
};

export default ElementTypesPage; 