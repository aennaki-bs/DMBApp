import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, GitBranch, Filter, X } from "lucide-react";

interface StepsTableEmptyProps {
    searchQuery?: string;
    searchField?: string;
    onClearFilters: () => void;
    searchFields?: Array<{ id: string; label: string }>;
}

export function StepsTableEmpty({
    searchQuery,
    searchField = "all",
    onClearFilters,
    searchFields = []
}: StepsTableEmptyProps) {
    const isFiltered = searchQuery && searchQuery.trim().length > 0;
    const currentFieldLabel = searchFields.find(f => f.id === searchField)?.label?.toLowerCase() || "all fields";

    return (
        <div className="w-full h-full flex-1 relative overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl shadow-lg">
            {/* Subtle animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-primary/2 animate-pulse"></div>

            <motion.div
                className="relative z-10 flex flex-col items-center justify-center h-full py-16 px-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="relative mb-6">
                    {/* Professional glowing background effect */}
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl w-24 h-24 -z-10"></div>

                    <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-blue-950/80 shadow-2xl border border-blue-400/30 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="relative"
                        >
                            <GitBranch
                                className="h-12 w-12 text-blue-400"
                                strokeWidth={1.5}
                            />
                            {isFiltered && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500/20 border border-orange-400/40 flex items-center justify-center backdrop-blur-sm">
                                    <Search className="h-3 w-3 text-orange-400" />
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>

                <motion.h3
                    className="text-2xl font-semibold text-blue-100 mb-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    {isFiltered ? "No steps match your search" : "No steps found"}
                </motion.h3>

                <motion.div
                    className="text-blue-300/90 max-w-md mx-auto mb-6 leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    {isFiltered ? (
                        <div className="space-y-2">
                            <p>
                                No steps found for <span className="font-medium text-blue-200 px-2 py-1 bg-blue-500/20 rounded-md border border-blue-400/30">"{searchQuery}"</span> in {currentFieldLabel}.
                            </p>
                            <div className="text-sm text-blue-400/80 mt-4">
                                <div className="mb-2 font-medium">Try:</div>
                                <ul className="text-left space-y-1 text-blue-300/70">
                                    <li>• Different keywords or search terms</li>
                                    <li>• Searching in "All fields" instead</li>
                                    <li>• Using quotes for exact phrases: "document canceled"</li>
                                    <li>• Checking for typos or exact spelling</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p>
                            This circuit doesn't have any steps configured yet. Steps define the workflow stages that documents will follow through this circuit.
                        </p>
                    )}
                </motion.div>

                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    {isFiltered ? (
                        <Button
                            variant="outline"
                            onClick={onClearFilters}
                            className="bg-blue-500/10 border-blue-400/30 text-blue-200 hover:bg-blue-500/20 hover:text-blue-100 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Search
                        </Button>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-blue-400/70">
                            <GitBranch className="h-4 w-4" />
                            <span>Use the "Add Step" button to create your first step</span>
                        </div>
                    )}
                </motion.div>

            </motion.div>
        </div>
    );
} 