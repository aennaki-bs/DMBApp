import { Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ApprovalGroupTableEmptyProps {
  onClearFilters?: () => void;
}

export function ApprovalGroupTableEmpty({
  onClearFilters,
}: ApprovalGroupTableEmptyProps) {
  return (
    <div className="table-glass-container rounded-lg shadow-lg p-12">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full table-glass-empty-icon flex items-center justify-center">
          <Users className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold table-glass-empty-title mb-2">
          No Approval Groups Found
        </h3>
        <p className="table-glass-empty-description mb-6 max-w-md mx-auto">
          {onClearFilters
            ? "No approval groups match your current search criteria. Try adjusting your filters or search terms."
            : "Get started by creating your first approval group for document workflows."}
        </p>
        {onClearFilters && (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="table-glass-empty-button"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
