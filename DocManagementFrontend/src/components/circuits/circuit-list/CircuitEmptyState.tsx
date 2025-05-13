import { Button } from "@/components/ui/button";
import { GitBranch, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "@/components/shared/EmptyState";

interface CircuitEmptyStateProps {
  searchQuery?: string;
  statusFilter?: string;
  isSimpleUser: boolean;
}

export function CircuitEmptyState({
  searchQuery,
  statusFilter,
  isSimpleUser,
}: CircuitEmptyStateProps) {
  const navigate = useNavigate();

  const hasFilters = searchQuery || (statusFilter && statusFilter !== "any");

  return (
    <EmptyState
      icon={<GitBranch className="h-10 w-10 text-blue-400" />}
      title="No circuits found"
      description={
        hasFilters
          ? "Try adjusting your search or filters"
          : "Create your first circuit to get started"
      }
      actionLabel={!isSimpleUser && !hasFilters ? "Create Circuit" : undefined}
      actionIcon={
        !isSimpleUser && !hasFilters ? <Plus className="h-4 w-4" /> : undefined
      }
      onAction={
        !isSimpleUser && !hasFilters
          ? () => navigate("/circuits/create")
          : undefined
      }
    />
  );
}
