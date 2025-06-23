import { useState, useRef } from "react";
import { toast } from "sonner";
import { UserPlus, Users } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { PageLayout } from "@/components/layout/PageLayout";
import { ApprovalGroupTable } from "@/components/approval-groups/ApprovalGroupTable";
import ApprovalGroupCreateDialog from "@/components/approval/ApprovalGroupCreateDialog";

const ApprovalGroupsManagement = () => {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const { t } = useTranslation();

  // Ref to hold the table's refetch function
  const tableRefetchRef = useRef<(() => void) | null>(null);

  const pageActions = [
    {
      label: "New Approval Group",
      variant: "default" as const,
      icon: UserPlus,
      onClick: () => setIsCreateGroupOpen(true),
    },
  ];

  const handleCreateSuccess = () => {
    setIsCreateGroupOpen(false);
    // Trigger immediate table refresh
    if (tableRefetchRef.current) {
      tableRefetchRef.current();
      // Don't show redundant toast here since the dialog already shows success message
    }
  };

  return (
    <PageLayout
      title="Approval Groups"
      subtitle="Manage approval groups for document workflows"
      icon={Users}
      actions={pageActions}
    >
      <ApprovalGroupTable
        onRefetchReady={(refetchFn) => {
          tableRefetchRef.current = refetchFn;
        }}
      />
      <ApprovalGroupCreateDialog
        open={isCreateGroupOpen}
        onOpenChange={setIsCreateGroupOpen}
        onSuccess={handleCreateSuccess}
      />
    </PageLayout>
  );
};

export default ApprovalGroupsManagement;
