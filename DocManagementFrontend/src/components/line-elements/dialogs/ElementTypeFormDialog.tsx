import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { LignesElementType } from "@/models/lineElements";
import lineElementsService from "@/services/lineElementsService";

interface ElementTypeFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    elementType: LignesElementType;
    onSuccess: () => void;
}

export function ElementTypeFormDialog({
    open,
    onOpenChange,
    elementType,
    onSuccess,
}: ElementTypeFormDialogProps) {
    const [formData, setFormData] = useState({
        code: "",
        description: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form data when element type changes
    useEffect(() => {
        if (elementType) {
            setFormData({
                code: elementType.code || "",
                description: elementType.description || "",
            });
            setErrors({});
        }
    }, [elementType]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.code.trim()) {
            newErrors.code = "Code is required";
        } else if (formData.code.length > 50) {
            newErrors.code = "Code must be 50 characters or less";
        } else if (!/^[A-Z0-9_]+$/.test(formData.code)) {
            newErrors.code = "Code must contain only uppercase letters, numbers, and underscores";
        }

        if (formData.description.length > 255) {
            newErrors.description = "Description must be 255 characters or less";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        try {
            await lineElementsService.elementTypes.update(elementType.id, {
                code: formData.code.trim(),
                description: formData.description.trim(),
                // Don't allow changing type as it affects the underlying table structure
                typeElement: elementType.typeElement,
                tableName: elementType.tableName,
            });

            toast.success("Element type updated successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Failed to update element type:", error);
            toast.error(error?.message || "Failed to update element type");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "Item":
                return "Item";
            case "GeneralAccounts":
                return "General Account";
            default:
                return type;
        }
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case "Item":
                return "default";
            case "GeneralAccounts":
                return "secondary";
            default:
                return "outline";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        Edit Element Type
                        <Badge variant={getTypeBadgeVariant(elementType?.typeElement)}>
                            {getTypeLabel(elementType?.typeElement)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Code Field */}
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-foreground font-medium">
                                Code *
                            </Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                                placeholder="Enter element type code"
                                className={`bg-background/50 border-primary/20 ${errors.code ? "border-destructive" : ""
                                    }`}
                                disabled={isLoading}
                            />
                            {errors.code && (
                                <p className="text-sm text-destructive">{errors.code}</p>
                            )}
                        </div>

                        {/* Type Field (Read-only) */}
                        <div className="space-y-2">
                            <Label className="text-foreground font-medium">
                                Type
                            </Label>
                            <div className="p-3 bg-muted/50 rounded-md border border-primary/10">
                                <Badge variant={getTypeBadgeVariant(elementType?.typeElement)}>
                                    {getTypeLabel(elementType?.typeElement)}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Type cannot be changed after creation
                                </p>
                            </div>
                        </div>

                        {/* Description Field */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-foreground font-medium">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Enter description (optional)"
                                rows={3}
                                className={`bg-background/50 border-primary/20 resize-none ${errors.description ? "border-destructive" : ""
                                    }`}
                                disabled={isLoading}
                            />
                            {errors.description && (
                                <p className="text-sm text-destructive">{errors.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {formData.description.length}/255 characters
                            </p>
                        </div>

                        {/* Table Name (Read-only) */}
                        <div className="space-y-2">
                            <Label className="text-foreground font-medium">
                                Table Name
                            </Label>
                            <div className="p-3 bg-muted/50 rounded-md border border-primary/10">
                                <code className="text-sm font-mono">{elementType?.tableName}</code>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Database table mapping (read-only)
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="border-primary/20 hover:bg-primary/5"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 