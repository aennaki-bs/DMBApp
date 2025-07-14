import React from "react";
import { Button } from "@/components/ui/button";
import { Hash, X } from "lucide-react";

interface UnitCodesTableEmptyProps {
  hasSearchQuery: boolean;
  onClearSearch: () => void;
}

export const UnitCodesTableEmpty: React.FC<UnitCodesTableEmptyProps> = ({
  hasSearchQuery,
  onClearSearch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-primary/10 rounded-full p-6 mb-6">
        <Hash className="h-16 w-16 text-primary/60" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        {hasSearchQuery ? "No unit codes found" : "No unit codes yet"}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        {hasSearchQuery
          ? "Try adjusting your search criteria or filters to find what you're looking for."
          : "Get started by creating your first unit code for measurement units."}
      </p>
      {hasSearchQuery && (
        <Button
          variant="outline"
          onClick={onClearSearch}
          className="border-primary/30 text-primary hover:bg-primary/5"
        >
          <X className="h-4 w-4 mr-2" />
          Clear search
        </Button>
      )}
    </div>
  );
};

export default UnitCodesTableEmpty; 