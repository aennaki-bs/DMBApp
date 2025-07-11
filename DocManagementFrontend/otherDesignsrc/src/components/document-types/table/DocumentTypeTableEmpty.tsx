import { FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentTypeTableEmptyProps {
  onClearFilters?: () => void;
}

export function DocumentTypeTableEmpty({
  onClearFilters,
}: DocumentTypeTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No document types found
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        There are no document types matching your current filters. Try adjusting
        your search criteria or clearing the filters.
      </p>
      {onClearFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
