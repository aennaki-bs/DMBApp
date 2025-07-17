import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import EnhancedSeriesCreateDialog from "../sub-types/EnhancedSeriesCreateDialog";
import SubTypeCreateDialog from "../sub-types/SubTypeCreateDialog";
import { Play, Sparkles, Palette, Zap, CheckCircle, Eye, Code2 } from "lucide-react";
import { motion } from "framer-motion";
import { DocumentType } from "@/models/document";
import { toast } from "sonner";

const mockDocumentTypes: DocumentType[] = [
    { id: 1, name: "Invoice", description: "Financial invoices", isActive: true },
    { id: 2, name: "Purchase Order", description: "Purchase orders", isActive: true },
    { id: 3, name: "Report", description: "Business reports", isActive: true }
];

export const EnhancedSeriesCreationShowcase = () => {
    const [showEnhanced, setShowEnhanced] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [activeDemo, setActiveDemo] = useState<"enhanced" | "original" | null>(null);

    const handleEnhancedSubmit = (data: any) => {
        console.log("Enhanced form submitted:", data);
        toast.success("Series created successfully with enhanced form!");
        setShowEnhanced(false);
    };

    const handleOriginalSubmit = (data: any) => {
        console.log("Original form submitted:", data);
        toast.success("Series created successfully with original form!");
        setShowOriginal(false);
    };

    const features = [
        {
            icon: <Sparkles className="w-5 h-5" />,
            title: "Glassmorphism Design",
            description: "Modern glass-like effects with backdrop blur and professional gradients"
        },
        {
            icon: <Palette className="w-5 h-5" />,
            title: "Uniform Dashboard Theme",
            description: "Consistent dark slate color palette with blue accents matching your dashboard"
        },
        {
            icon: <Zap className="w-5 h-5" />,
            title: "Enhanced Animations",
            description: "Smooth transitions, micro-interactions, and loading states"
        },
        {
            icon: <CheckCircle className="w-5 h-5" />,
            title: "Advanced Validation",
            description: "Real-time feedback, error handling, and success indicators"
        }
    ];

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Enhanced Series Creation Form
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Professional UI/UX upgrade with glassmorphism effects and modern design
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">
                        ✨ All Functionality Preserved
                    </Badge>
                </motion.div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                    >
                        <Card className="bg-slate-800/30 border-slate-700/50 h-full">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                                        <p className="text-slate-400 text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Demo Section */}
            <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Play className="w-5 h-5 text-blue-400" />
                        Interactive Demo
                    </CardTitle>
                    <CardDescription>
                        Compare the enhanced version with the original form to see the improvements
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Demo Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            onClick={() => {
                                setShowEnhanced(true);
                                setActiveDemo("enhanced");
                            }}
                            className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="font-semibold">Enhanced Version</div>
                                    <div className="text-sm opacity-90">Modern UI with glassmorphism</div>
                                </div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowOriginal(true);
                                setActiveDemo("original");
                            }}
                            className="h-16 border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        >
                            <div className="flex items-center gap-3">
                                <Eye className="w-6 h-6" />
                                <div className="text-left">
                                    <div className="font-semibold">Original Version</div>
                                    <div className="text-sm opacity-75">Standard form design</div>
                                </div>
                            </div>
                        </Button>
                    </div>

                    {/* Active Demo Indicator */}
                    {activeDemo && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                                <span className="text-blue-300 font-medium">
                                    {activeDemo === "enhanced" ? "Enhanced" : "Original"} demo is active
                                </span>
                            </div>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            {/* Usage Example */}
            <Card className="bg-slate-800/30 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Code2 className="w-5 h-5 text-purple-400" />
                        Usage Example
                    </CardTitle>
                    <CardDescription>
                        How to integrate the enhanced series creation form in your application
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-sm text-slate-300">
                            <code>{`// Import the enhanced component
import EnhancedSeriesCreateDialog from '@/components/sub-types/EnhancedSeriesCreateDialog';

// Use in your component
const [isDialogOpen, setIsDialogOpen] = useState(false);

const handleSeriesSubmit = (data) => {
  // Handle series creation
  console.log('Series data:', data);
};

// Render the dialog
<EnhancedSeriesCreateDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  onSubmit={handleSeriesSubmit}
  documentTypes={documentTypes}
/>`}</code>
                        </pre>
                    </div>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <EnhancedSeriesCreateDialog
                open={showEnhanced}
                onOpenChange={setShowEnhanced}
                onSubmit={handleEnhancedSubmit}
                documentTypes={mockDocumentTypes}
            />

            <SubTypeCreateDialog
                open={showOriginal}
                onOpenChange={setShowOriginal}
                onSubmit={handleOriginalSubmit}
                documentTypes={mockDocumentTypes}
            />
        </div>
    );
}; 