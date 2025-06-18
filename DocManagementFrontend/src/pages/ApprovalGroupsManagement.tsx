import { useState } from "react";
import { toast } from "sonner";
import { UserPlus, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import { ApprovalGroupTable } from "@/components/approval-groups/ApprovalGroupTable";
import ApprovalGroupCreateDialog from "@/components/approval/ApprovalGroupCreateDialog";

const ApprovalGroupsManagement = () => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { t } = useTranslation();

  const pageActions = [
    {
      label: "New Approval Group",
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => setIsCreateGroupOpen(true),
    },
  ];

  return (
    <PageLayout
      title="Approval Groups"
      subtitle="Manage approval groups for document workflows"
      icon={Users}
      actions={pageActions}
    >
      <ApprovalGroupTable />
      <ApprovalGroupCreateDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onSuccess={() => {
          setIsCreateGroupOpen(false);
          // The table will automatically refetch via the hook
        }}
      />
    </PageLayout>
  );
};

export default ApprovalGroupsManagement;
