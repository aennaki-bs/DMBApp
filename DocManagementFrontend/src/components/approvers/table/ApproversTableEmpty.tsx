import { Button } from "@/components/ui/button";
import { User, UserPlus } from "lucide-react";

interface ApproversTableEmptyProps {
  onClearFilters?: () => void;
}

export function ApproversTableEmpty({
  onClearFilters,
}: ApproversTableEmptyProps) {
  return (
    <div className="text-center py-12">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full table-glass-empty-icon flex items-center justify-center">
          <User className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium table-glass-empty-title">
            No approvers found
          </h3>
          <p className="table-glass-empty-description text-sm max-w-md">
            Get started by adding your first approver to manage document
            workflows
          </p>
        </div>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="table-glass-empty-button"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
