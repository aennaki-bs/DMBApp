import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface CreateSousLigneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: { title: string; attribute: string }) => Promise<void>;
}

export function CreateSousLigneDialog({
    open,
    onOpenChange,
    onSubmit,
}: CreateSousLigneDialogProps) {
    const [title, setTitle] = useState("");
    const [attribute, setAttribute] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title || !attribute) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ title, attribute });
            setTitle("");
            setAttribute("");
        } catch (error) {
            console.error("Failed to create sub-line:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setTitle("");
            setAttribute("");
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-primary">
                        <Plus className="h-5 w-5 mr-2" /> Add Sub-Line
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="sl-title" className="text-foreground">
                            Title<span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="sl-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter sub-line title"
                            className="bg-background/80 border-border/70"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sl-attribute" className="text-foreground">
                            Attribute<span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="sl-attribute"
                            value={attribute}
                            onChange={(e) => setAttribute(e.target.value)}
                            placeholder="Enter attribute value"
                            rows={3}
                            className="bg-background/80 border-border/70"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title || !attribute}
                        className="bg-primary hover:bg-primary/90"
                    >
                        {isSubmitting ? "Creating..." : "Create Sub-Line"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 