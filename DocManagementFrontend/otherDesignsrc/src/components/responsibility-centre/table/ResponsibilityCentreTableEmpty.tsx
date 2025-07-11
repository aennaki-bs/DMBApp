import { Button } from "@/components/ui/button";
import { Building2, Search, FileX } from "lucide-react";

interface ResponsibilityCentreTableEmptyProps {
  onClearFilters?: () => void;
}

export function ResponsibilityCentreTableEmpty({
  onClearFilters,
}: ResponsibilityCentreTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 mb-6 rounded-2xl table-glass-empty-icon flex items-center justify-center">
        <Building2 className="w-10 h-10 table-glass-empty-icon-color" />
      </div>

      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-lg font-semibold table-glass-empty-title">
          No responsibility centres found
        </h3>
        <p className="text-sm table-glass-empty-description leading-relaxed">
          {onClearFilters
            ? "No centres match your current search criteria. Try adjusting your filters or search terms."
            : "Get started by creating your first responsibility centre to organize document management across different departments."}
        </p>
      </div>

      {onClearFilters && (
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-4 text-sm table-glass-empty-button hover:table-glass-empty-button-hover transition-all duration-200 shadow-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      )}

      <div className="mt-8 text-xs table-glass-empty-hint">
        <div className="flex items-center gap-1">
          <FileX className="w-3.5 h-3.5" />
          <span>
            Responsibility centres help organize users and documents by
            department or function
          </span>
        </div>
      </div>
    </div>
  );
}
