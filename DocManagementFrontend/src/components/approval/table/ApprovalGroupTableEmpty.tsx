import { Button } from "@/components/ui/button";
import { UsersRound, UserPlus, Filter } from "lucide-react";

interface ApprovalGroupTableEmptyProps {
  onClearFilters: () => void;
  onCreateGroup?: () => void;
}

export function ApprovalGroupTableEmpty({ 
  onClearFilters, 
  onCreateGroup 
}: ApprovalGroupTableEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl transform scale-150"></div>
        
        {/* Icon */}
        <div className="relative p-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 backdrop-blur-sm">
          <UsersRound className="h-12 w-12 text-primary" />
        </div>
      </div>

      <div className="mt-6 space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">
          No approval groups found
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We couldn't find any approval groups matching your current filters. 
          Try adjusting your search criteria or clearing all filters to see more results.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Button
          onClick={onClearFilters}
          variant="outline"
          className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear all filters
        </Button>
        
        {onCreateGroup && (
          <Button 
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl border border-primary/30 hover:border-primary/50 transition-all duration-300"
            onClick={onCreateGroup}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Create new group
          </Button>
        )}
      </div>
    </div>
  );
} 