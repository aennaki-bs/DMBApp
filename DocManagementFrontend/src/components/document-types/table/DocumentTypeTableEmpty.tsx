import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, Plus, Search, X } from "lucide-react";

interface DocumentTypeTableEmptyProps {
    onClearFilters: () => void;
    onCreateType?: () => void;
}

export function DocumentTypeTableEmpty({
    onClearFilters,
    onCreateType,
}: DocumentTypeTableEmptyProps) {
    return (
        <Card className="border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                        <Layers className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-400/30">
                        <Search className="h-3 w-3 text-orange-600" />
                    </div>
                </div>

                <div className="space-y-3 max-w-md">
                    <h3 className="text-lg font-semibold text-foreground">
                        No Document Types Found
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        We couldn't find any document types matching your current search and filter criteria.
                        Try adjusting your filters or search terms.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClearFilters}
                        className="flex items-center gap-2 bg-background/60 hover:bg-background/80 border-primary/20 text-foreground hover:text-primary transition-all duration-200"
                    >
                        <X className="h-4 w-4" />
                        Clear Filters
                    </Button>

                    {onCreateType && (
                        <Button
                            onClick={onCreateType}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200"
                        >
                            <Plus className="h-4 w-4" />
                            Create Document Type
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 