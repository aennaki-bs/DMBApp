import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import {
    MoreHorizontal,
    Edit,
    Eye,
    Trash2,
    GitBranch,
    Settings,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface CircuitTableRowProps {
    circuit: Circuit;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
    onToggleStatus: () => void;
    onManageSteps: () => void;
    isSimpleUser?: boolean;
}

export function CircuitTableRow({
    circuit,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onView,
    onToggleStatus,
    onManageSteps,
    isSimpleUser = false,
}: CircuitTableRowProps) {
    const handleRowClick = (e: React.MouseEvent) => {
        // Don't trigger row selection if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (
            target.closest('button') ||
            target.closest('input') ||
            target.closest('select') ||
            target.closest('[role="button"]') ||
            target.closest('[data-no-row-select]') ||
            target.classList.contains('no-row-select')
        ) {
            return;
        }

        onSelect();
    };

    return (
        <TableRow
            className={cn(
                "border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 group cursor-pointer",
                isSelected
                    ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:shadow-sm"
            )}
            onClick={handleRowClick}
        >
            {/* Selection Column */}
            {!isSimpleUser && (
                <TableCell className="w-[48px] text-center">
                    <div className="flex items-center justify-center">
                        <ProfessionalCheckbox
                            checked={isSelected}
                            onCheckedChange={onSelect}
                            size="md"
                            variant="row"
                        />
                    </div>
                </TableCell>
            )}

            {/* Icon Column */}
            <TableCell className="w-[48px] text-center">
                <div className="flex items-center justify-center">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-2 border-blue-300 dark:border-blue-900/50">
                        <GitBranch className="h-5 w-5 text-white" />
                    </div>
                </div>
            </TableCell>



            {/* Title Column */}
            <TableCell className="w-[300px]">
                <div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onView();
                        }}
                        className="font-medium text-blue-900 dark:text-blue-100 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 text-left w-full"
                    >
                        {circuit.title || "Unnamed Circuit"}
                    </button>
                    {circuit.descriptif && (
                        <div className="text-sm text-blue-800 dark:text-blue-200 truncate mt-1">
                            {circuit.descriptif}
                        </div>
                    )}
                </div>
            </TableCell>

            {/* Document Type Column */}
            <TableCell className="w-[180px] text-center">
                {circuit.documentType ? (
                    <Badge
                        variant="secondary"
                        className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 font-medium text-xs px-3 py-1"
                    >
                        {circuit.documentType.typeName}
                    </Badge>
                ) : (
                    <span className="text-slate-500 dark:text-slate-400 text-sm">No type</span>
                )}
            </TableCell>

            {/* Status Column */}
            <TableCell className="w-[120px] text-center">
                <Badge
                    variant={circuit.isActive ? "default" : "secondary"}
                    className={cn(
                        "flex items-center gap-1 w-fit",
                        circuit.isActive
                            ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-500/30"
                            : "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600/50"
                    )}
                >
                    {circuit.isActive ? (
                        <>
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                        </>
                    ) : (
                        <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                        </>
                    )}
                </Badge>
            </TableCell>

            {/* Toggle Column */}
            {!isSimpleUser && (
                <TableCell className="w-[100px] text-center">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
                                    <Switch
                                        checked={circuit.isActive}
                                        onCheckedChange={onToggleStatus}
                                        className="data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-600"
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                {circuit.isActive ? "Deactivate circuit" : "Activate circuit"}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </TableCell>
            )}

            {/* Actions Column */}
            <TableCell className="w-[100px] text-center">
                <div className="flex items-center justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="sr-only">Open menu for {circuit.title}</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl"
                        >
                            <DropdownMenuLabel className="flex items-center gap-2 text-blue-800 dark:text-blue-200 px-3 py-2">
                                <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Circuit Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView();
                                }}
                                className="rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>Manage Status</span>
                            </DropdownMenuItem>

                            {!isSimpleUser && (
                                <>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit();
                                        }}
                                        className="rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit Circuit</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onManageSteps();
                                        }}
                                        className="rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Manage Steps</span>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete();
                                        }}
                                        className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete Circuit</span>
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
} 