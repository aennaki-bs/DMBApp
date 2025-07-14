import { Button } from "@/components/ui/button";
import { Database, Search, Filter } from "lucide-react";

interface ElementTypesTableEmptyProps {
    onClearFilters: () => void;
}

export function ElementTypesTableEmpty({ onClearFilters }: ElementTypesTableEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="flex flex-col items-center gap-4 max-w-md text-center">
                {/* Icon */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Database className="h-8 w-8 text-primary/60" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                        <Search className="h-3 w-3 text-muted-foreground" />
                    </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                        No Element Types Found
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        No element types match your current search criteria. Try adjusting your filters or search terms, or create a new element type.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="bg-background/60 backdrop-blur-md border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all duration-300"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Clear Filters
                    </Button>
                </div>

                {/* Helpful Tips */}
                <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground">
                        <strong>Tips:</strong> Element types define the structure for document line items.
                        You can create Item types for physical products or General Account types for accounting purposes.
                    </p>
                </div>
            </div>
        </div>
    );
} 