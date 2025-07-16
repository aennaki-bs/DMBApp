import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

interface StepTableEmptyProps {
    onCreateStep?: () => void;
}

export function StepTableEmpty({
    onCreateStep,
}: StepTableEmptyProps) {
    return (
        <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
                <Settings className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No steps found</p>
            <p className="text-sm text-muted-foreground mb-4">
                No steps have been created for this circuit yet.
            </p>
            {onCreateStep && (
                <Button
                    onClick={onCreateStep}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Step
                </Button>
            )}
        </div>
    );
} 