import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    User,
    Layers,
    Calendar,
    Building2,
    Users,
    Sparkles,
    CheckCircle,
    ArrowRight,
    Eye,
    Zap,
    Target,
    Accessibility
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedStepIndicator from '@/components/shared/EnhancedStepIndicator';
import {
    EnhancedInput,
    EnhancedPassword,
    EnhancedTextarea,
    EnhancedSelect
} from '@/components/shared/EnhancedFormFields';

// Mock wizard for demo
import CreateDocumentWizardEnhanced from '@/components/create-document/CreateDocumentWizardEnhanced';

const EnhancedWizardShowcase: React.FC = () => {
    const [showDocumentWizard, setShowDocumentWizard] = useState(false);
    const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

    // Sample steps for demonstration
    const sampleSteps = [
        {
            id: 1,
            title: 'User Information',
            description: 'Enter basic user details',
            icon: <User className="h-4 w-4" />,
            completed: true,
        },
        {
            id: 2,
            title: 'Document Type',
            description: 'Select document category',
            icon: <FileText className="h-4 w-4" />,
            completed: true,
        },
        {
            id: 3,
            title: 'Content Details',
            description: 'Add document content',
            icon: <Layers className="h-4 w-4" />,
            completed: false,
        },
        {
            id: 4,
            title: 'Review & Submit',
            description: 'Confirm and create',
            icon: <CheckCircle className="h-4 w-4" />,
            completed: false,
        },
    ];

    const improvementFeatures = [
        {
            icon: <Sparkles className="h-5 w-5" />,
            title: 'Modern Visual Design',
            description: 'Beautiful glassmorphism effects, gradients, and professional dark theme',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            icon: <Zap className="h-5 w-5" />,
            title: 'Smooth Animations',
            description: 'Fluid transitions, micro-interactions, and spring-based animations',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        },
        {
            icon: <Target className="h-5 w-5" />,
            title: 'Enhanced Validation',
            description: 'Real-time feedback, visual indicators, and helpful error messages',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20'
        },
        {
            icon: <Eye className="h-5 w-5" />,
            title: 'Step Preview',
            description: 'See upcoming steps, progress tracking, and navigation hints',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20'
        },
        {
            icon: <Accessibility className="h-5 w-5" />,
            title: 'Accessibility',
            description: 'Full keyboard navigation, screen reader support, and ARIA labels',
            color: 'text-pink-400',
            bgColor: 'bg-pink-500/10',
            borderColor: 'border-pink-500/20'
        },
        {
            icon: <Building2 className="h-5 w-5" />,
            title: 'Mobile Responsive',
            description: 'Optimized for all devices with touch-friendly interactions',
            color: 'text-cyan-400',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/20'
        },
    ];

    const demoComponents = [
        {
            id: 'step-indicator',
            title: 'Enhanced Step Indicator',
            description: 'Interactive progress visualization with hover effects',
            component: (
                <div className="space-y-6">
                    <EnhancedStepIndicator
                        steps={sampleSteps}
                        currentStep={3}
                        allowStepNavigation={true}
                        showStepPreview={true}
                        variant="horizontal"
                        size="md"
                    />
                    <EnhancedStepIndicator
                        steps={sampleSteps.slice(0, 3)}
                        currentStep={2}
                        allowStepNavigation={true}
                        showStepPreview={true}
                        variant="vertical"
                        size="sm"
                    />
                </div>
            )
        },
        {
            id: 'form-fields',
            title: 'Enhanced Form Fields',
            description: 'Beautiful inputs with validation and animations',
            component: (
                <div className="space-y-4 max-w-md">
                    <EnhancedInput
                        label="Email Address"
                        description="Enter your work email address"
                        value="john.doe@company.com"
                        onChange={() => { }}
                        type="email"
                        success="Email is available"
                        icon={<User className="w-4 h-4" />}
                    />
                    <EnhancedPassword
                        label="Password"
                        description="Create a strong password"
                        value="MyPassword123!"
                        onChange={() => { }}
                        showStrengthIndicator={true}
                        strengthScore={4}
                        strengthText="Strong"
                    />
                    <EnhancedSelect
                        label="Department"
                        description="Select your department"
                        value="engineering"
                        onChange={() => { }}
                        options={[
                            { value: 'engineering', label: 'Engineering', icon: <Building2 className="w-4 h-4" /> },
                            { value: 'design', label: 'Design', icon: <Sparkles className="w-4 h-4" /> },
                            { value: 'sales', label: 'Sales', icon: <Users className="w-4 h-4" /> },
                        ]}
                        searchable={true}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Enhanced UI/UX Design</span>
                    </div>

                    <h1 className="text-4xl font-bold text-slate-100">
                        Modern Creation Forms
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Experience the completely redesigned creation wizards with modern UI, smooth animations,
                        and enhanced user experience while keeping all existing functionality.
                    </p>
                </motion.div>

                {/* Key Improvements */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {improvementFeatures.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`p-6 rounded-xl border backdrop-blur-sm ${feature.bgColor} ${feature.borderColor}`}
                        >
                            <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                                <div className={feature.color}>
                                    {feature.icon}
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-slate-400">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Live Demo Section */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-100 mb-2">
                            Live Components Demo
                        </h2>
                        <p className="text-slate-400">
                            Interact with the enhanced components to see the improvements in action
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {demoComponents.map((demo) => (
                            <Card
                                key={demo.id}
                                className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
                            >
                                <CardHeader>
                                    <CardTitle className="text-slate-100 flex items-center gap-2">
                                        <span>{demo.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                            Interactive
                                        </Badge>
                                    </CardTitle>
                                    <p className="text-sm text-slate-400">
                                        {demo.description}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    {demo.component}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Full Wizard Demo */}
                <motion.div
                    className="text-center space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-100">
                            Complete Wizard Experience
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">
                            Try the fully enhanced Document Creation Wizard to experience all improvements together
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowDocumentWizard(true)}
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Launch Enhanced Document Wizard
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </motion.div>

                {/* Before/After Comparison */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-100 mb-2">
                            Key Improvements Summary
                        </h2>
                        <p className="text-slate-400">
                            See what's been enhanced while maintaining all existing functionality
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-red-500/5 border-red-500/20">
                            <CardHeader>
                                <CardTitle className="text-red-300 text-lg">Before</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-slate-400">
                                <div>• Basic step indicators</div>
                                <div>• Standard form inputs</div>
                                <div>• Limited animations</div>
                                <div>• Basic validation feedback</div>
                                <div>• Simple navigation</div>
                                <div>• Minimal visual hierarchy</div>
                            </CardContent>
                        </Card>

                        <Card className="bg-emerald-500/5 border-emerald-500/20">
                            <CardHeader>
                                <CardTitle className="text-emerald-300 text-lg">After</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-slate-400">
                                <div>• Interactive progress visualization</div>
                                <div>• Enhanced form fields with animations</div>
                                <div>• Smooth micro-interactions</div>
                                <div>• Real-time validation with visual feedback</div>
                                <div>• Step preview and navigation hints</div>
                                <div>• Professional visual design</div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>

            {/* Enhanced Document Wizard */}
            <CreateDocumentWizardEnhanced
                open={showDocumentWizard}
                onOpenChange={setShowDocumentWizard}
                onSuccess={() => {
                    setShowDocumentWizard(false);
                    // Handle success
                }}
            />
        </div>
    );
};

export default EnhancedWizardShowcase; 