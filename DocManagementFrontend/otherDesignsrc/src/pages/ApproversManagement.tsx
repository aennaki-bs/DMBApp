import { useState, useRef } from "react";
import { toast } from "sonner";
import { UserCog, UserPlus } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";
import { ApproversTable } from "@/components/approvers/ApproversTable";
import ApproverCreateWizard from "@/components/approval/ApproverCreateWizard";

export default function ApproversManagement() {
  const [isCreateApproverOpen, setIsCreateApproverOpen] = useState(false);

  // Ref to hold the table's refetch function
  const tableRefetchRef = useRef<(() => void) | null>(null);

  const pageActions = [
    {
      label: "New Approver",
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => setIsCreateApproverOpen(true),
    },
  ];

  const handleCreateSuccess = () => {
    setIsCreateApproverOpen(false);
    // Trigger immediate table refresh
    if (tableRefetchRef.current) {
      tableRefetchRef.current();
      // Don't show redundant toast here since the dialog already shows success message
    }
  };

  return (
    <PageLayout
      title="Approvers Management"
      subtitle="Manage individual approvers for document workflows"
      icon={UserCog}
      actions={pageActions}
    >
      <ApproversTable
        onRefetchReady={(refetchFn) => {
          tableRefetchRef.current = refetchFn;
        }}
      />
      <ApproverCreateWizard
        open={isCreateApproverOpen}
        onOpenChange={setIsCreateApproverOpen}
        onSuccess={handleCreateSuccess}
      />
    </PageLayout>
  );
}
