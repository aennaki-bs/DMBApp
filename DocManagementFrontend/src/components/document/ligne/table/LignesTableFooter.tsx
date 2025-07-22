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
            className="mt-6"
        >
            {/* Main Financial Totals - 4 Cards Only */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Discount */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/20 p-6 ring-2 ring-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-300/60 text-sm font-medium mb-1">
                                Total Discount
                            </p>
                            <p className="text-3xl font-bold text-white">
                                {formatPrice(totals.totalDiscount)}
                            </p>
                            {/* <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-red-500/10 text-red-300 border-red-500/20 text-xs">
                                    {metrics.discountPercentage.toFixed(1)}% of total
                                </Badge>
                            </div> */}
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-lg">
                            <Minus className="h-8 w-8 text-red-400" />
                        </div>
                    </div>
                </Card>

                {/* Total HT */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/20 p-6 ring-2 ring-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-300/60 text-sm font-medium mb-1">
                                Total HT
                            </p>
                            <p className="text-3xl font-bold text-white">
                                {formatPrice(totals.totalAmountHT)}
                            </p>
                            {/* <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-green-500/10 text-green-300 border-green-500/20 text-xs">
                                    Avg: {formatPrice(totals.averagePriceHT)}
                                </Badge>
                            </div> */}
                        </div>
                        <div className="bg-green-500/10 p-3 rounded-lg">
                            <Calculator className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                </Card>

                {/* Total VAT */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/20 p-6 ring-2 ring-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                        <p className="text-blue-300/60 text-sm font-medium mb-1">
                                Total VAT
                            </p>
                            <p className="text-3xl font-bold text-white">
                                {formatPrice(totals.totalAmountVAT)}
                            </p>
                            {/* <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">
                                    {metrics.vatEffectiveRate.toFixed(1)}% effective
                                </Badge>
                            </div> */}
                        </div>
                        <div className="bg-purple-500/10 p-3 rounded-lg">
                            <Percent className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                </Card>

                {/* Total TTC - Most prominent */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/20 p-6 ring-2 ring-blue-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-300/60 text-sm font-medium mb-1">
                                Total TTC
                            </p>
                            <p className="text-4xl font-bold text-white">
                                {formatPrice(totals.totalAmountTTC)}
                            </p>
                            {/* <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-xs">
                                    Final Amount
                                </Badge>
                            </div> */}
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded-lg">
                            <div className="h-8 w-8 flex items-center justify-center text-blue-400 font-bold text-sm">
                                TTC
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </motion.div>
    );
} 