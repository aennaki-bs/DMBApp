import { useSubTypeForm } from "./SubTypeFormProvider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Type, MessageSquare, Info, AlertTriangle, CheckCircle, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const EnhancedSeriesBasicInfoStep = () => {
    const { formData, updateForm, errors } = useSubTypeForm();

    const getFieldStatus = (fieldName: string) => {
        if (errors[fieldName]) return "error";
        if (formData[fieldName as keyof typeof formData]) return "success";
        return "default";
    };

    const getPrefixPreview = () => {
        if (formData.name) {
            return formData.name.toUpperCase();
        }
        return "AUTO-GENERATED";
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
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Series Information</h3>
                        <p className="text-slate-400 text-sm">Configure the name and description for your document series</p>
                    </div>
                </div>
            </div>

            {/* Info Panel */}
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-purple-300">Series Naming Guidelines</h4>
                        <ul className="text-xs text-purple-200/80 space-y-1">
                            <li>• Prefix is optional - if left empty, one will be auto-generated</li>
                            <li>• Prefix must be unique within the document type</li>
                            <li>• Use letters, numbers, hyphens, and underscores only</li>
                            <li>• Description helps users understand the series purpose</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
                {/* Series Prefix */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Type className="w-4 h-4 text-blue-400" />
                        <Label className="text-sm font-medium text-slate-200">
                            Series Prefix <span className="text-slate-400">(Optional)</span>
                        </Label>
                        {getFieldStatus("name") === "success" && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                    </div>

                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="e.g., INV, PO, REQ (leave empty for auto-generation)"
                            value={formData.name || ""}
                            onChange={(e) => updateForm({ name: e.target.value })}
                            className={cn(
                                "h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-500",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200",
                                "rounded-lg pl-12 pr-4",
                                {
                                    "border-red-400 focus:border-red-400 focus:ring-red-400/20": errors.name,
                                    "border-green-400 focus:border-green-400 focus:ring-green-400/20":
                                        getFieldStatus("name") === "success"
                                }
                            )}
                        />

                        {/* Prefix Icon */}
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                            <Type className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Error Message */}
                        {errors.name && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 mt-2 text-red-400"
                            >
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-sm">{errors.name}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Prefix Preview */}
                    <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Wand2 className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white">Generated Prefix Preview</h4>
                                    <p className="text-xs text-slate-400">How your prefix will appear in documents</p>
                                </div>
                            </div>

                            <div className="bg-slate-700/50 px-3 py-2 rounded-lg border border-slate-600/50">
                                <span className="text-sm font-mono text-blue-300 font-medium">
                                    {getPrefixPreview()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <Label className="text-sm font-medium text-slate-200">
                            Description <span className="text-slate-400">(Optional)</span>
                        </Label>
                    </div>

                    <div className="relative">
                        <Textarea
                            placeholder="Describe the purpose of this series (e.g., 'Monthly financial reports', 'Purchase orders for equipment')"
                            value={formData.description || ""}
                            onChange={(e) => updateForm({ description: e.target.value })}
                            rows={4}
                            className={cn(
                                "bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-500",
                                "focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200",
                                "rounded-lg resize-none",
                                "min-h-[100px]"
                            )}
                        />

                        {/* Character Count */}
                        <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                            {(formData.description || "").length} / 500
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Preview */}
            {(formData.name || formData.description) && !errors.name && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-500/5 border border-green-500/20 rounded-xl p-4"
                >
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h4 className="text-sm font-medium text-green-300">Series Information Ready</h4>
                            <div className="space-y-1">
                                <p className="text-xs text-green-200/80">
                                    <strong>Prefix:</strong> {getPrefixPreview()}
                                </p>
                                {formData.description && (
                                    <p className="text-xs text-green-200/80">
                                        <strong>Description:</strong> {formData.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Auto-generation Note */}
            {!formData.name && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <Wand2 className="w-5 h-5 text-blue-400" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-300">Auto-Generation Enabled</h4>
                            <p className="text-xs text-blue-200/80">
                                Since no prefix is specified, the system will automatically generate a unique prefix for this series
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}; 