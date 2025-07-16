import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LignesElementType } from "@/models/lineElements";
import { Database, Calendar, Table, FileText } from "lucide-react";
import { format } from "date-fns";

interface ViewElementTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    elementType: LignesElementType;
}

export function ViewElementTypeDialog({
    open,
    onOpenChange,
    elementType,
}: ViewElementTypeDialogProps) {
    if (!elementType) return null;

    // Display code exactly as stored without any formatting
    const getDisplayCodeName = (code?: string) => {
        if (!code || code.trim() === '') {
            return "N/A";
        }
        // Return code exactly as stored without any formatting
        return code;
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

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMMM dd, yyyy 'at' h:mm a");
        } catch {
            return "Invalid date";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Database className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <DialogTitle className="text-foreground text-xl">Element Type Details</DialogTitle>
                            <p className="text-muted-foreground text-sm">View complete information for this element type</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">Code</label>
                                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <span className="font-mono text-foreground">{getDisplayCodeName(elementType.code)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">Type</label>
                                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <Badge variant={getTypeBadgeVariant(elementType.typeElement)}>
                                        {getTypeLabel(elementType.typeElement)}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">Table Name</label>
                                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-center gap-2">
                                    <Table className="h-4 w-4 text-primary" />
                                    <span className="font-mono text-foreground text-sm">{elementType.tableName}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-1">ID</label>
                                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                    <span className="font-mono text-foreground text-sm">{elementType.id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-medium text-muted-foreground block mb-1 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Description
                        </label>
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <p className="text-foreground">{elementType.description}</p>
                        </div>
                    </div>

                    {/* Associated Data */}
                    {(elementType.itemCode || elementType.accountCode) && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground block mb-3">Associated Data</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {elementType.itemCode && (
                                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Item Code</label>
                                        <span className="font-mono text-foreground text-sm">{elementType.itemCode}</span>
                                    </div>
                                )}
                                {elementType.accountCode && (
                                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                                        <label className="text-xs font-medium text-muted-foreground block mb-1">Account Code</label>
                                        <span className="font-mono text-foreground text-sm">{elementType.accountCode}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-primary/10">
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block">Created</label>
                                <span className="text-sm text-foreground">{formatDate(elementType.createdAt)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <Calendar className="h-4 w-4 text-primary" />
                            <div>
                                <label className="text-xs font-medium text-muted-foreground block">Updated</label>
                                <span className="text-sm text-foreground">{formatDate(elementType.updatedAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 