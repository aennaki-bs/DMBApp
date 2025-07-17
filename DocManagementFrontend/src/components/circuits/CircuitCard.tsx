// Circuit interface is globally available from vite-env.d.ts
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
    GitBranch,
    Edit,
    Trash2,
    Eye,
    ArrowRight,
    MoreVertical,
    CheckCircle2,
    XCircle,
    Settings,
    Users,
    FileText
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { motion } from "framer-motion";

interface CircuitCardProps {
    circuit: Circuit;
    isSelected: boolean;
    onSelect: (checked: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    onToggleStatus: () => void;
    onManageSteps: () => void;
    isSimpleUser?: boolean;
}

export function CircuitCard({
    circuit,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onView,
    onToggleStatus,
    onManageSteps,
    isSimpleUser = false,
}: CircuitCardProps) {
    const handleCardClick = () => {
        onView();
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        className="h-full"
                    >
                        <Card
                            className={cn(
                                "bg-[#0f1642] border-blue-900/30 shadow-lg overflow-hidden transition-all group relative cursor-pointer hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-[1.02] h-full flex flex-col",
                                isSelected
                                    ? "border-l-4 border-l-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50"
                                    : ""
                            )}
                            onClick={handleCardClick}
                        >
                            <div className="absolute inset-0 transition-colors bg-blue-500/0 group-hover:bg-blue-500/10"></div>

                            <CardHeader className="relative z-10 pb-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {!isSimpleUser && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <ProfessionalCheckbox
                                                    checked={isSelected}
                                                    onCheckedChange={onSelect}
                                                    size="md"
                                                    variant="card"
                                                />
                                            </div>
                                        )}

                                        {/* Circuit Icon */}
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-2 border-blue-300 dark:border-blue-900/50 flex-shrink-0">
                                            <GitBranch className="h-6 w-6 text-white" />
                                        </div>
                                    </div>

                                    {!isSimpleUser && (
                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="bg-[#1a2c6b] border-blue-500/30 text-blue-100 rounded-lg shadow-lg"
                                                >
                                                    <DropdownMenuLabel className="flex items-center gap-2 text-blue-200">
                                                        <GitBranch className="h-4 w-4 text-blue-400" />
                                                        Circuit Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator className="bg-blue-800/40" />

                                                    <DropdownMenuItem
                                                        onClick={onView}
                                                        className="hover:bg-blue-800/40 text-blue-100"
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        Manage Status
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={onEdit}
                                                        className="hover:bg-blue-800/40 text-blue-100"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Circuit
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        onClick={onManageSteps}
                                                        className="hover:bg-blue-800/40 text-blue-100"
                                                    >
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        Manage Steps
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="bg-blue-800/40" />

                                                    <DropdownMenuItem
                                                        onClick={onDelete}
                                                        className="text-red-300 hover:bg-red-900/30 hover:text-red-200"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete Circuit
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    )}
                                </div>

                                <CardTitle className="text-xl text-white mb-1 group-hover:text-blue-100 transition-colors">
                                    {circuit.title || "Unnamed Circuit"}
                                </CardTitle>

                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="outline"
                                        className="bg-blue-900/30 border-blue-500/30 text-blue-300 font-medium text-xs"
                                    >
                                        {circuit.circuitKey}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="relative z-10 flex-1 space-y-4">
                                {/* Document Type */}
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-300/70 text-sm">Type:</span>
                                    {circuit.documentType ? (
                                        <Badge
                                            variant="secondary"
                                            className="bg-emerald-900/30 border-emerald-500/30 text-emerald-300 text-xs"
                                        >
                                            <FileText className="h-3 w-3 mr-1" />
                                            {circuit.documentType.typeName}
                                        </Badge>
                                    ) : (
                                        <span className="text-slate-400 text-sm">No type</span>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-blue-300/70 text-sm">Status:</span>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={circuit.isActive ? "default" : "secondary"}
                                            className={cn(
                                                "text-xs",
                                                circuit.isActive
                                                    ? "bg-green-900/30 border-green-500/30 text-green-300"
                                                    : "bg-slate-800/50 border-slate-600/50 text-slate-400"
                                            )}
                                        >
                                            {circuit.isActive ? (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Active
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="h-3 w-3 mr-1" />
                                                    Inactive
                                                </>
                                            )}
                                        </Badge>

                                        {!isSimpleUser && (
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Switch
                                                                checked={circuit.isActive}
                                                                onCheckedChange={onToggleStatus}
                                                                size="sm"
                                                                className="data-[state=checked]:bg-green-600"
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {circuit.isActive ? "Deactivate circuit" : "Activate circuit"}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                {circuit.descriptif && (
                                    <div>
                                        <span className="text-blue-300/70 text-sm block mb-2">Description:</span>
                                        <p className="text-blue-200 text-sm line-clamp-3 leading-relaxed">
                                            {circuit.descriptif}
                                        </p>
                                    </div>
                                )}

                                {/* Circuit Properties */}
                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-300/70 text-xs">Ordered Flow:</span>
                                        {circuit.hasOrderedFlow ? (
                                            <Badge variant="outline" className="bg-green-900/20 border-green-500/30 text-green-300 text-xs">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Yes
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-800/50 border-slate-600/50 text-slate-400 text-xs">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                No
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-300/70 text-xs">Backtrack:</span>
                                        {circuit.allowBacktrack ? (
                                            <Badge variant="outline" className="bg-green-900/20 border-green-500/30 text-green-300 text-xs">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Allowed
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-slate-800/50 border-slate-600/50 text-slate-400 text-xs">
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Disabled
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="relative z-10 pt-0 flex gap-2 mt-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onView();
                                    }}
                                    className="flex-1 border-blue-600/30 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 hover:border-blue-500/50"
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Button>

                                {!isSimpleUser && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onManageSteps();
                                        }}
                                        className="flex-1 border-blue-600/30 text-blue-300 hover:bg-blue-900/30 hover:text-blue-200 hover:border-blue-500/50"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Steps
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Click to view circuit details</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} 