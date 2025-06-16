import { Building2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResponsibilityCentreTableEmptyProps {
  onClearFilters: () => void;
}

export function ResponsibilityCentreTableEmpty({
  onClearFilters,
}: ResponsibilityCentreTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="mb-6 p-4 rounded-full table-glass-empty-icon">
        <Building2 className="h-12 w-12" />
      </div>

      <h3 className="text-xl font-semibold table-glass-empty-title mb-2">
        No responsibility centres found
      </h3>

      <p className="table-glass-empty-description mb-6 max-w-md">
        No responsibility centres match your current search criteria. Try
        adjusting your filters or search terms.
      </p>

      <Button
        variant="outline"
        onClick={onClearFilters}
        className="table-glass-empty-button shadow-lg rounded-xl flex items-center gap-2 transition-all duration-300 hover:shadow-xl"
      >
        <X className="h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
}
