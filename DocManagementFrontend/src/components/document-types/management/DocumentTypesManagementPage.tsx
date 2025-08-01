import { useState } from "react";
import { DocumentType } from "@/models/document";
import DocumentTypeDrawer from "./DocumentTypeDrawer";
import { Layers, Plus } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { DocumentTypesTable } from "../DocumentTypesTable";
import { useTranslation } from "@/hooks/useTranslation";

const DocumentTypesManagementPage = () => {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);

  // Page actions for PageLayout
  const pageActions = [
    {
      label: t('documents.newType'),
      variant: "default" as const,
      icon: Plus,
      onClick: () => setIsDrawerOpen(true),
    },
  ];

  return (
    <PageLayout
      title={t('documents.documentTypesManagement')}
      subtitle={t('documents.documentTypesManagementSubtitle')}
      icon={Layers}
      actions={pageActions}
    >
      {/* Document Types Table with Search and Filters like User Management */}
      <DocumentTypesTable 
        onCreateType={() => setIsDrawerOpen(true)}
        onEditType={(type) => {
          setTypeToEdit(type);
          setIsDrawerOpen(true);
        }}
      />

      {/* Drawer for editing/creating types */}
      <DocumentTypeDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        type={typeToEdit}
        onSuccess={() => {
          setTypeToEdit(null);
        }}
      />
    </PageLayout>
  );
};

export default DocumentTypesManagementPage;
