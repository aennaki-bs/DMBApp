import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { SousLigne } from "@/models/document";

interface EditSousLigneDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sousLigne: SousLigne | null;
    onSubmit: (data: { title: string; attribute: string }) => Promise<void>;
}

export function EditSousLigneDialog({
    open,
    onOpenChange,
    sousLigne,
    onSubmit,
}: EditSousLigneDialogProps) {
    const [title, setTitle] = useState("");
    const [attribute, setAttribute] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form when sousLigne changes
    useEffect(() => {
        if (sousLigne) {
            setTitle(sousLigne.title || "");
            setAttribute(sousLigne.attribute || "");
        } else {
            setTitle("");
            setAttribute("");
        }
    }, [sousLigne]);

    const handleSubmit = async () => {
        if (!title || !attribute) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ title, attribute });
        } catch (error) {
            console.error("Failed to update sub-line:", error);
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
                        <Edit className="h-5 w-5 mr-2" /> Edit Sub-Line
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-sl-title" className="text-foreground">
                            Title<span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="edit-sl-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter sub-line title"
                            className="bg-background/80 border-border/70"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-sl-attribute" className="text-foreground">
                            Attribute<span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="edit-sl-attribute"
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
                        {isSubmitting ? "Updating..." : "Update Sub-Line"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 