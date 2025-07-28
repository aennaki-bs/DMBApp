import { Ligne } from "@/models/document";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Percent, Minus } from "lucide-react";
import { motion } from "framer-motion";

interface LignesTableFooterProps {
    lignes: Ligne[];
}

export function LignesTableFooter({ lignes }: LignesTableFooterProps) {
    // Format currency with MAD
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(price);
    };

    // Calculate comprehensive totals
    const totals = {
        // Line counts
        totalLines: lignes.length,
        totalSubLines: lignes.reduce((sum, ligne) => sum + (ligne.sousLignesCount || 0), 0),

        // Quantity totals
        totalQuantity: lignes.reduce((sum, ligne) => sum + (ligne.quantity || 0), 0),

        // Financial totals
        totalAmountHT: lignes.reduce((sum, ligne) => sum + (ligne.amountHT || 0), 0),
        totalAmountVAT: lignes.reduce((sum, ligne) => sum + (ligne.amountVAT || 0), 0),
        totalAmountTTC: lignes.reduce((sum, ligne) => sum + (ligne.amountTTC || 0), 0),

        // Discount totals
        totalDiscount: lignes.reduce((sum, ligne) => {
            if (ligne.discountAmount && ligne.discountAmount > 0) {
                return sum + ligne.discountAmount;
            } else if (ligne.discountPercentage && ligne.discountPercentage > 0) {
                const priceHT = ligne.priceHT || 0;
                const quantity = ligne.quantity || 0;
                return sum + (priceHT * quantity * ligne.discountPercentage / 100);
            }
            return sum;
        }, 0),

        // Average calculations
        averagePriceHT: lignes.length > 0 ? lignes.reduce((sum, ligne) => sum + (ligne.priceHT || 0), 0) / lignes.length : 0,
        averageQuantity: lignes.length > 0 ? lignes.reduce((sum, ligne) => sum + (ligne.quantity || 0), 0) / lignes.length : 0,
    };

    // Calculate additional metrics
    const metrics = {
        totalValue: totals.totalAmountTTC,
        averageLineValue: lignes.length > 0 ? totals.totalAmountTTC / lignes.length : 0,
        discountPercentage: totals.totalAmountHT > 0 ? (totals.totalDiscount / totals.totalAmountHT) * 100 : 0,
        vatEffectiveRate: totals.totalAmountHT > 0 ? (totals.totalAmountVAT / totals.totalAmountHT) * 100 : 0,
    };

    if (lignes.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className=""
        >
            {/* Main Financial Totals - 4 Compact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Discount */}
                <Card className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200/50 dark:border-slate-500/20 p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                                Total Discount
                            </p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                {formatPrice(totals.totalDiscount)}
                            </p>
                        </div>
                        <div className="bg-red-500/10 p-2 rounded-lg">
                            <Minus className="h-5 w-5 text-red-500" />
                        </div>
                    </div>
                </Card>

                {/* Total HT */}
                <Card className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200/50 dark:border-slate-500/20 p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                                Total HT
                            </p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                {formatPrice(totals.totalAmountHT)}
                            </p>
                        </div>
                        <div className="bg-green-500/10 p-2 rounded-lg">
                            <Calculator className="h-5 w-5 text-green-500" />
                        </div>
                    </div>
                </Card>

                {/* Total VAT */}
                <Card className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200/50 dark:border-slate-500/20 p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                                Total VAT
                            </p>
                            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                                {formatPrice(totals.totalAmountVAT)}
                            </p>
                        </div>
                        <div className="bg-purple-500/10 p-2 rounded-lg">
                            <Percent className="h-5 w-5 text-purple-500" />
                        </div>
                    </div>
                </Card>

                {/* Total TTC - Most prominent */}
                <Card className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 dark:from-slate-900/20 dark:to-slate-800/20 border-slate-200/50 dark:border-slate-500/20 p-4 hover:shadow-md transition-all duration-200 ring-2 ring-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">
                                Total TTC
                            </p>
                            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                                {formatPrice(totals.totalAmountTTC)}
                            </p>
                        </div>
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                            <div className="h-5 w-5 flex items-center justify-center text-blue-500 font-bold text-xs">
                                TTC
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
} 