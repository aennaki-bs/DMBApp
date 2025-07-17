import { useSubTypeForm } from "./SubTypeFormProvider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const EnhancedSeriesDatesStep = () => {
    const { formData, updateForm, errors } = useSubTypeForm();

    const formatDateForInput = (date: Date | string | undefined) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
    };

    const handleDateChange = (field: string, value: string) => {
        updateForm({ [field]: value });
    };

    const getFieldStatus = (fieldName: string) => {
        if (errors[fieldName]) return "error";
        if (formData[fieldName as keyof typeof formData]) return "success";
        return "default";
    };

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
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <Calendar className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Date Range Configuration</h3>
                        <p className="text-slate-400 text-sm">Define when this series will be active and available for use</p>
                    </div>
                </div>
            </div>

            {/* Info Panel */}
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-blue-300">Important Date Guidelines</h4>
                        <ul className="text-xs text-blue-200/80 space-y-1">
                            <li>• Series date ranges cannot overlap with existing series for the same document type</li>
                            <li>• End date must be after the start date</li>
                            <li>• Future dates are allowed for planning purposes</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-slate-200">
                            Start Date *
                        </Label>
                        {getFieldStatus("startDate") === "success" && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                    </div>

                    <div className="relative">
                        <Input
                            type="date"
                            value={formatDateForInput(formData.startDate)}
                            onChange={(e) => handleDateChange("startDate", e.target.value)}
                            className={cn(
                                "h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200",
                                "rounded-lg pl-4 pr-4",
                                {
                                    "border-red-400 focus:border-red-400 focus:ring-red-400/20": errors.startDate,
                                    "border-green-400 focus:border-green-400 focus:ring-green-400/20":
                                        getFieldStatus("startDate") === "success"
                                }
                            )}
                        />

                        {/* Error Message */}
                        {errors.startDate && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mt-2 text-red-400"
                            >
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{errors.startDate}</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* End Date */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium text-slate-200">
                            End Date *
                        </Label>
                        {getFieldStatus("endDate") === "success" && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                    </div>

                    <div className="relative">
                        <Input
                            type="date"
                            value={formatDateForInput(formData.endDate)}
                            onChange={(e) => handleDateChange("endDate", e.target.value)}
                            className={cn(
                                "h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200",
                                "rounded-lg pl-4 pr-4",
                                {
                                    "border-red-400 focus:border-red-400 focus:ring-red-400/20": errors.endDate,
                                    "border-green-400 focus:border-green-400 focus:ring-green-400/20":
                                        getFieldStatus("endDate") === "success"
                                }
                            )}
                        />

                        {/* Error Message */}
                        {errors.endDate && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mt-2 text-red-400"
                            >
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{errors.endDate}</span>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Status Toggle */}
            <div className="space-y-4">
                <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-400" />
                                Series Status
                            </h4>
                            <p className="text-xs text-slate-400">
                                Active series are available for document creation
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "text-sm font-medium transition-colors",
                                formData.isActive ? "text-green-400" : "text-slate-400"
                            )}>
                                {formData.isActive ? "Active" : "Inactive"}
                            </span>

                            <Switch
                                checked={formData.isActive ?? true}
                                onCheckedChange={(checked) => updateForm({ isActive: checked })}
                                className="data-[state=checked]:bg-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Preview */}
            {formData.startDate && formData.endDate && !errors.startDate && !errors.endDate && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/5 border border-green-500/20 rounded-xl p-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-green-300">Valid Date Range</h4>
                            <p className="text-xs text-green-200/80">
                                Series will be active from {new Date(formData.startDate).toLocaleDateString()}
                                to {new Date(formData.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}; 