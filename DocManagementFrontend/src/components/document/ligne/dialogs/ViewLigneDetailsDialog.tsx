import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ligne } from "@/models/document";
import { Calendar, Package, Hash, DollarSign, Calculator, Percent, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ViewLigneDetailsDialogProps {
    ligne: Ligne | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ViewLigneDetailsDialog({
    ligne,
    isOpen,
    onOpenChange,
}: ViewLigneDetailsDialogProps) {
    if (!ligne) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 10, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Package className="h-5 w-5 text-primary" />
                        Line Details: {ligne.ligneKey || `L${ligne.id}`}
                    </DialogTitle>
                </DialogHeader>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Basic Information Card */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Hash className="h-4 w-4" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Line Key</label>
                                        <div className="mt-1">
                                            <Badge variant="outline" className="text-sm">
                                                {ligne.ligneKey || `L${ligne.id}`}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Title</label>
                                        <p className="mt-1 text-sm">{ligne.title || "Untitled Line"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Items Information Card */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Package className="h-4 w-4" />
                                    Items Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Items</label>
                                        <p className="mt-1 text-sm font-medium">{ligne.article || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Code</label>
                                        <p className="mt-1 text-sm">{ligne.itemCode || ligne.generalAccountsCode || "N/A"}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                                        <p className="mt-1 text-sm font-medium">
                                            {formatNumber(ligne.quantity || 0)}
                                            {ligne.unit?.code && <span className="text-muted-foreground ml-1">({ligne.unit.code})</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Unit Price HT</label>
                                        <p className="mt-1 text-sm font-medium text-blue-600">
                                            {formatCurrency(ligne.priceHT || 0)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Financial Information Card */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <DollarSign className="h-4 w-4" />
                                    Financial Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calculator className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800 dark:text-green-200">Amount HT</span>
                                        </div>
                                        <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                            {formatCurrency(ligne.amountHT || 0)}
                                        </p>
                                    </div>

                                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Percent className="h-4 w-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Amount VAT</span>
                                        </div>
                                        <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                            {formatCurrency(ligne.amountVAT || 0)}
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Amount TTC</span>
                                        </div>
                                        <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                                            {formatCurrency(ligne.amountTTC || 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* Discount Information */}
                                {(ligne.discountAmount || ligne.discountPercentage) && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Discount Applied</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {ligne.discountAmount && (
                                                    <div>
                                                        <label className="text-sm text-red-600 dark:text-red-400">Discount Amount</label>
                                                        <p className="font-medium text-red-800 dark:text-red-200">
                                                            {formatCurrency(ligne.discountAmount)}
                                                        </p>
                                                    </div>
                                                )}
                                                {ligne.discountPercentage && (
                                                    <div>
                                                        <label className="text-sm text-red-600 dark:text-red-400">Discount Percentage</label>
                                                        <p className="font-medium text-red-800 dark:text-red-200">
                                                            {ligne.discountPercentage}%
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Additional Information */}
                    <motion.div variants={itemVariants}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="h-4 w-4" />
                                    Additional Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {ligne.createdAt && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                                            <p className="mt-1 text-sm">{formatDate(ligne.createdAt)}</p>
                                        </div>
                                    )}
                                    {ligne.updatedAt && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                            <p className="mt-1 text-sm">{formatDate(ligne.updatedAt)}</p>
                                        </div>
                                    )}
                                    {ligne.sousLignesCount !== undefined && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Sub-lines Count</label>
                                            <div className="mt-1">
                                                <Badge variant="secondary" className="text-sm">
                                                    {ligne.sousLignesCount} sub-lines
                                                </Badge>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
} 