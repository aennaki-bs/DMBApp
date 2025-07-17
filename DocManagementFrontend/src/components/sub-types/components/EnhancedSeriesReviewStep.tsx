import { useSubTypeForm } from "./SubTypeFormProvider";
import { CheckCircle, Calendar, Type, MessageSquare, Clock, Zap, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const EnhancedSeriesReviewStep = () => {
    const { formData } = useSubTypeForm();

    const formatDate = (date: Date | string | undefined) => {
        if (!date) return "Not set";
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPrefixDisplay = () => {
        return formData.name || "AUTO-GENERATED";
    };

    const getDateRange = () => {
        if (!formData.startDate || !formData.endDate) return null;

        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffYears = (diffDays / 365).toFixed(1);

        return {
            days: diffDays,
            years: diffYears,
            isLongTerm: diffDays > 365
        };
    };

    const dateRange = getDateRange();

    return (
        <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Review & Confirm</h3>
                        <p className="text-slate-400 text-sm">Review your series configuration before creating</p>
                    </div>
                </div>
            </div>

            {/* Confirmation Panel */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                        <h4 className="text-sm font-medium text-green-300">Configuration Complete</h4>
                        <p className="text-xs text-green-200/80">
                            Your series is ready to be created. Review the details below and click 'Create Series' to proceed.
                        </p>
                    </div>
                </div>
            </div>

            {/* Series Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date Configuration */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <h4 className="text-base font-semibold text-white">Date Range</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-400">Start Date:</span>
                            <span className="text-sm font-medium text-white">{formatDate(formData.startDate)}</span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-t border-slate-700/30">
                            <span className="text-sm text-slate-400">End Date:</span>
                            <span className="text-sm font-medium text-white">{formatDate(formData.endDate)}</span>
                        </div>

                        {dateRange && (
                            <div className="pt-2 border-t border-slate-700/30">
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-medium text-blue-300">Duration</span>
                                    </div>
                                    <p className="text-xs text-blue-200/80">
                                        {dateRange.days} days ({dateRange.years} years)
                                        {dateRange.isLongTerm && " - Long-term series"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Series Information */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Type className="w-5 h-5 text-purple-400" />
                        </div>
                        <h4 className="text-base font-semibold text-white">Series Details</h4>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-slate-400">Prefix:</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-medium text-blue-300 bg-slate-700/50 px-2 py-1 rounded">
                                    {getPrefixDisplay()}
                                </span>
                                {!formData.name && (
                                    <Zap className="w-3 h-3 text-yellow-400" title="Auto-generated" />
                                )}
                            </div>
                        </div>

                        <div className="py-2 border-t border-slate-700/30">
                            <span className="text-sm text-slate-400 block mb-2">Description:</span>
                            <div className="bg-slate-700/30 rounded-lg p-3 min-h-[80px]">
                                {formData.description ? (
                                    <p className="text-sm text-white leading-relaxed">{formData.description}</p>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No description provided</p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Status Configuration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-500/10">
                        <Clock className="w-5 h-5 text-green-400" />
                    </div>
                    <h4 className="text-base font-semibold text-white">Status Configuration</h4>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-300">Initial Status</p>
                        <p className="text-xs text-slate-500 mt-1">The series will be created with this status</p>
                    </div>

                    <div className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm",
                        formData.isActive
                            ? "bg-green-500/10 border border-green-500/20 text-green-300"
                            : "bg-slate-700/50 border border-slate-600/50 text-slate-400"
                    )}>
                        {formData.isActive ? "Active" : "Inactive"}
                    </div>
                </div>
            </motion.div>

            {/* Creation Summary */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-green-500/5 border border-slate-600/30 rounded-xl p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                        <Info className="w-6 h-6 text-white" />
                    </div>

                    <div className="space-y-3 flex-1">
                        <h4 className="text-lg font-semibold text-white">Ready to Create Series</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                                <div className="text-blue-400 font-semibold">{getPrefixDisplay()}</div>
                                <div className="text-slate-400 text-xs">Prefix</div>
                            </div>

                            <div className="text-center">
                                <div className="text-purple-400 font-semibold">
                                    {dateRange ? `${dateRange.days} days` : "Date range set"}
                                </div>
                                <div className="text-slate-400 text-xs">Duration</div>
                            </div>

                            <div className="text-center">
                                <div className={cn(
                                    "font-semibold",
                                    formData.isActive ? "text-green-400" : "text-slate-400"
                                )}>
                                    {formData.isActive ? "Active" : "Inactive"}
                                </div>
                                <div className="text-slate-400 text-xs">Status</div>
                            </div>
                        </div>

                        <p className="text-slate-300 text-sm leading-relaxed">
                            Once created, this series will be available for document creation
                            {formData.isActive ? " immediately" : " after activation"}.
                            {!formData.name && " The system will generate a unique prefix automatically."}
                        </p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}; 