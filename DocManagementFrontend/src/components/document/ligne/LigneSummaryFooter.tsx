import { DollarSign, FileText, BarChart2, TrendingUp } from 'lucide-react';
import { Ligne } from '@/models/document';
import { motion } from 'framer-motion';

interface LigneSummaryFooterProps {
  lignes: Ligne[];
}

const LigneSummaryFooter = ({ lignes }: LigneSummaryFooterProps) => {
  const totalAmount = lignes.reduce((sum, ligne) => sum + ligne.prix, 0);
  const averageAmount = totalAmount / lignes.length;
  const maxAmount = Math.max(...lignes.map(ligne => ligne.prix));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300/60 text-sm font-medium mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-white">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300/60 text-sm font-medium mb-1">Average Amount</p>
            <p className="text-2xl font-bold text-white">
              ${averageAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <BarChart2 className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg border border-blue-500/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300/60 text-sm font-medium mb-1">Highest Amount</p>
            <p className="text-2xl font-bold text-white">
              ${maxAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-500/10 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LigneSummaryFooter;
