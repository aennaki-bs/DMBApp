import React from "react";
import { Button } from "@/components/ui/button";
import { FileX, RotateCcw, Plus } from "lucide-react";

interface SubTypesTableEmptyProps {
    onClearFilters: () => void;
    onCreateSeries?: () => void;
}

export function SubTypesTableEmpty({ onClearFilters, onCreateSeries }: SubTypesTableEmptyProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileX className="h-8 w-8 text-primary/70" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        No series found
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mb-4">
                        No series match your current filters. Try adjusting your search criteria or create a new series.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            className="hover:bg-primary/10 hover:border-primary/40"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Clear Filters
                        </Button>
                        {onCreateSeries && (
                            <Button
                                onClick={onCreateSeries}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Series
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 