import { FileText, BarChart2, TrendingUp, Calculator, Percent } from "lucide-react";
import { Ligne } from "@/models/document";
import { motion } from "framer-motion";

interface LigneSummaryFooterProps {
  lignes: Ligne[];
}

// Format price with MAD currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const LigneSummaryFooter = ({ lignes }: LigneSummaryFooterProps) => {
  // Calculate totals using new fields
  const totalAmountHT = lignes.reduce((sum, ligne) => sum + ligne.amountHT, 0);
  const totalAmountVAT = lignes.reduce((sum, ligne) => sum + ligne.amountVAT, 0);
  const totalAmountTTC = lignes.reduce((sum, ligne) => sum + ligne.amountTTC, 0);
  
  const averageAmountTTC = totalAmountTTC / lignes.length;
  const maxAmountTTC = Math.max(...lignes.map((ligne) => ligne.amountTTC));
  
  // Calculate total quantity
  const totalQuantity = lignes.reduce((sum, ligne) => sum + ligne.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 space-y-4"
    >
      {/* Main totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg border border-green-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-300/60 text-sm font-medium mb-1">
                Total Amount HT
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(totalAmountHT)}
              </p>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Calculator className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-lg border border-purple-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-300/60 text-sm font-medium mb-1">
                Total VAT
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(totalAmountVAT)}
              </p>
            </div>
            <div className="bg-purple-500/10 p-2 rounded-lg">
              <Percent className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-300/60 text-sm font-medium mb-1">
                Total Amount TTC
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(totalAmountTTC)}
              </p>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <div className="h-6 w-6 flex items-center justify-center text-blue-400 font-bold text-xs">
                TTC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900/30 to-slate-900/30 rounded-lg border border-gray-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300/60 text-sm font-medium mb-1">
                Total Items
              </p>
              <p className="text-2xl font-bold text-white">
                {lignes.length}
              </p>
            </div>
            <div className="bg-gray-500/10 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 rounded-lg border border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300/60 text-sm font-medium mb-1">
                Total Quantity
              </p>
              <p className="text-2xl font-bold text-white">
                {totalQuantity.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-500/10 p-2 rounded-lg">
              <BarChart2 className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/30 to-teal-900/30 rounded-lg border border-cyan-500/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-300/60 text-sm font-medium mb-1">
                Average Amount
              </p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(averageAmountTTC)}
              </p>
            </div>
            <div className="bg-cyan-500/10 p-2 rounded-lg">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LigneSummaryFooter;
