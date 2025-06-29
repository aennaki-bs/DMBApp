import { useState } from "react";
import { UserCog, UserPlus } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ApproversTable } from "@/components/approvers/ApproversTable";
import ApproverCreateWizard from "@/components/approval/ApproverCreateWizard";

export default function ApproversManagement() {
  const [isCreateApproverOpen, setIsCreateApproverOpen] = useState(false);

  const pageActions = [
    {
      label: "New Approver",
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => setIsCreateApproverOpen(true),
    },
  ];

  return (
    <PageLayout
      title="Approvers Management"
      subtitle="Manage individual approvers for document workflows"
      icon={UserCog}
      actions={pageActions}
    >
      <ApproversTable />
      <ApproverCreateWizard
        open={isCreateApproverOpen}
        onOpenChange={setIsCreateApproverOpen}
        onSuccess={() => {
          setIsCreateApproverOpen(false);
          // The table will automatically refetch via the hook
        }}
      />
    </PageLayout>
  );
}
