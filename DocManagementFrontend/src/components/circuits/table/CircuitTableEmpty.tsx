import { Button } from "@/components/ui/button";
import { GitBranch } from "lucide-react";

interface CircuitTableEmptyProps {
    onClearFilters: () => void;
    onCreateCircuit?: () => void;
    isSimpleUser?: boolean;
}

export function CircuitTableEmpty({
    onClearFilters,
    onCreateCircuit,
    isSimpleUser = false
}: CircuitTableEmptyProps) {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
                <GitBranch className="h-12 w-12 text-primary/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">No circuits found</h3>
            <p className="text-muted-foreground max-w-md">
                No circuits have been created yet. Create your first circuit to get started.
            </p>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onClearFilters}
                    className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                    <GitBranch className="h-4 w-4 mr-2" />
                    Clear Filters
                </Button>
                {!isSimpleUser && onCreateCircuit && (
                    <Button
                        onClick={onCreateCircuit}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        <GitBranch className="h-4 w-4 mr-2" />
                        Create Circuit
                    </Button>
                )}
            </div>
        </div>
    );
} 