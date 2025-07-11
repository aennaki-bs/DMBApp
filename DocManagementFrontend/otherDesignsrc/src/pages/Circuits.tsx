import { useState, useEffect } from "react";
import { toast } from "sonner";
import { CircuitTable } from "@/components/circuits/CircuitTable";
import CreateCircuitDialog from "@/components/circuits/CreateCircuitDialog";
import { Button } from "@/components/ui/button";
import { Plus, GitBranch } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";

export default function CircuitsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);

  const isSimpleUser = user?.role === "SimpleUser";

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  const pageActions = [
    ...(isSimpleUser
      ? []
      : [
          {
            label: "New Circuit",
            variant: "default" as const,
            icon: Plus,
            onClick: () => setCreateOpen(true),
          },
        ]),
  ];

  return (
    <PageLayout
      title="Circuit Management"
      subtitle={
        isSimpleUser
          ? "View document workflow circuits"
          : "Create and manage document workflow circuits"
      }
      icon={GitBranch}
      actions={pageActions}
    >
      <CircuitTable />
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          // Circuit table will refresh automatically
          setCreateOpen(false);
        }}
      />
    </PageLayout>
  );
}
