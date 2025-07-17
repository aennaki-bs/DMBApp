import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Link,
    Info,
    AlertCircle,
    Check,
    ExternalLink
} from 'lucide-react';
import {
    EnhancedInput,
    EnhancedTextarea
} from '@/components/shared/EnhancedFormFields';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface ContentStepEnhancedProps {
    content: string;
    isExternal: boolean;
    externalReference: string;
    onContentChange: (content: string) => void;
    onExternalChange: (isExternal: boolean) => void;
    onExternalReferenceChange: (reference: string) => void;
}

export const ContentStepEnhanced: React.FC<ContentStepEnhancedProps> = ({
    content,
    isExternal,
    externalReference,
    onContentChange,
    onExternalChange,
    onExternalReferenceChange,
}) => {
    const { t } = useTranslation();
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);

    // Update counts when content changes
    React.useEffect(() => {
        if (!isExternal) {
            setCharCount(content.length);
            setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
        }
    }, [content, isExternal]);

    const handleContentChange = (newContent: string) => {
        onContentChange(newContent);
    };

    const handleExternalToggle = (checked: boolean) => {
        onExternalChange(checked);
        // Clear the other field when switching modes
        if (checked) {
            onContentChange('');
        } else {
            onExternalReferenceChange('');
        }
    };

    const getContentValidation = () => {
        if (isExternal) {
            if (!externalReference.trim()) {
                return { type: 'error', message: t('documents.externalDocumentReference') + ' is required' };
            }
            return { type: 'success', message: 'External reference provided' };
        } else {
            if (!content.trim()) {
                return { type: 'error', message: t('documents.documentContentRequired') };
            }
            if (content.length < 10) {
                return { type: 'warning', message: 'Content seems very short. Consider adding more details.' };
            }
            if (content.length > 5000) {
                return { type: 'warning', message: 'Content is quite long. Consider breaking it into sections.' };
            }
            return { type: 'success', message: 'Content looks good' };
        }
    };

    const validation = getContentValidation();

    const contentSuggestions = [
        'Document purpose and objectives',
        'Key requirements or specifications',
        'Timeline and deliverables',
        'Responsible parties',
        'Budget considerations',
        'Risk factors and mitigation',
    ];

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="text-center space-y-2">
                <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                        delay: 0.1
                    }}
                >
                    <FileText className="w-8 h-8 text-blue-400" />
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-100">
                    {t('documents.enterDocumentContent')}
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                    {t('documents.contentDescription')}
                </p>
            </div>

            {/* Document Type Toggle */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Label htmlFor="external-toggle" className="text-sm font-medium text-slate-200">
                                        {t('documents.externalDocument')}
                                    </Label>
                                    <Badge variant={isExternal ? "default" : "secondary"} className="text-xs">
                                        {isExternal ? 'External' : 'Internal'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-slate-400">
                                    {t('documents.externalDocumentDescription')}
                                </p>
                            </div>
                            <Switch
                                id="external-toggle"
                                checked={isExternal}
                                onCheckedChange={handleExternalToggle}
                                className="data-[state=checked]:bg-blue-600"
                            />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Content Input Area */}
            <AnimatePresence mode="wait">
                {isExternal ? (
                    // External Document Reference
                    <motion.div
                        key="external"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        <EnhancedInput
                            label={t('documents.externalDocumentReference')}
                            description={t('documents.externalDocumentReferenceDescription')}
                            value={externalReference}
                            onChange={onExternalReferenceChange}
                            placeholder="Enter external document reference, URL, or identifier..."
                            icon={<ExternalLink className="w-4 h-4" />}
                            required
                            error={validation.type === 'error' ? validation.message : undefined}
                            success={validation.type === 'success' ? validation.message : undefined}
                            maxLength={500}
                            showCharCount
                        />

                        {/* External document info */}
                        <Alert className="border-blue-500/50 bg-blue-500/10">
                            <Info className="h-4 w-4 text-blue-400" />
                            <AlertDescription className="text-blue-300">
                                External documents will be linked rather than storing content directly.
                                Make sure the reference is accessible to relevant team members.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                ) : (
                    // Internal Document Content
                    <motion.div
                        key="internal"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                    >
                        <EnhancedTextarea
                            label="Document Content"
                            description="Enter the main content of your document. Use clear and concise language."
                            value={content}
                            onChange={handleContentChange}
                            placeholder="Start typing your document content here..."
                            rows={8}
                            maxLength={10000}
                            showCharCount
                            autoResize
                            required
                            error={validation.type === 'error' ? validation.message : undefined}
                            success={validation.type === 'success' ? validation.message : undefined}
                        />

                        {/* Content Statistics */}
                        <motion.div
                            className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/30 rounded-lg p-3 border border-slate-700/30"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    Words: {wordCount}
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    Characters: {charCount}
                                </span>
                            </div>
                            {content.length > 0 && (
                                <span className="text-slate-500">
                                    ~{Math.ceil(wordCount / 200)} min read
                                </span>
                            )}
                        </motion.div>

                        {/* Content Suggestions (only show when content is empty or short) */}
                        {content.length < 50 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ delay: 0.4 }}
                                className="space-y-3"
                            >
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Info className="w-4 h-4" />
                                    <span>Consider including:</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {contentSuggestions.map((suggestion, index) => (
                                        <motion.button
                                            key={suggestion}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            onClick={() => {
                                                const currentContent = content ? content + '\n\n' : '';
                                                onContentChange(currentContent + `${suggestion}:\n`);
                                            }}
                                            className={cn(
                                                "text-left p-3 rounded-lg border text-xs transition-all duration-200",
                                                "bg-slate-800/50 border-slate-700/50 text-slate-300",
                                                "hover:bg-slate-700/50 hover:border-slate-600/50 hover:text-slate-200",
                                                "focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Check className="w-3 h-3 text-slate-400" />
                                                {suggestion}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Validation Message */}
            <AnimatePresence>
                {validation.type === 'warning' && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Alert className="border-yellow-500/50 bg-yellow-500/10">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                            <AlertDescription className="text-yellow-300">
                                {validation.message}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}; 