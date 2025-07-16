import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit2, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface StatusTableRowProps {
    status: any;
    isSelected: boolean;
    onSelect: (statusId: number) => void;
    onEdit: (status: any) => void;
    onDelete: (statusId: number) => void;
    isCircuitActive: boolean;
}

export function StatusTableRow({
    status,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    isCircuitActive,
}: StatusTableRowProps) {
    // Get the correct ID field (could be id, statusId, or other variations)
    const statusId = status.id || status.statusId || status.Id;

    console.log("StatusTableRow rendered with:", {
        status,
        statusId,
        isCircuitActive,
        onEdit: typeof onEdit,
        onDelete: typeof onDelete
    });

    const getStatusTypeBadge = (status: any) => {
        // Determine type based on status properties
        let type = "Normal";
        let badgeClass = "bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-500/30";

        if (status.isInitial || status.IsInitial || status.type === "Initial") {
            type = "Initial";
            badgeClass = "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-500/30";
        } else if (status.isFinal || status.IsFinal || status.type === "Final") {
            type = "Final";
            badgeClass = "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30";
        }

        return (
            <Badge variant="secondary" className={`text-xs px-2 py-1 font-medium ${badgeClass}`}>
                {type}
            </Badge>
        );
    };

    return (
        <TableRow
            className={`border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group ${isSelected
                ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
                : "hover:shadow-sm"
                }`}
            onClick={(e) => {
                // Don't trigger row selection if clicking on interactive elements
                const target = e.target as HTMLElement;
                if (
                    target.closest('button') ||
                    target.closest('input') ||
                    target.closest('select') ||
                    target.closest('[role="button"]')
                ) {
                    return;
                }
                if (!isCircuitActive) {
                    onSelect(statusId);
                }
            }}
        >
            <TableCell className="w-[48px]">
                <div className="flex items-center justify-center py-2">
                    <ProfessionalCheckbox
                        checked={isSelected}
                        onCheckedChange={() => {
                            if (!isCircuitActive) {
                                onSelect(statusId);
                            }
                        }}
                        size="md"
                        variant="row"
                        disabled={isCircuitActive}
                    />
                </div>
            </TableCell>

            <TableCell className="w-[60px]">
                <div className="flex items-center justify-center py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white border border-blue-300 dark:border-blue-900/50 flex items-center justify-center">
                        <FileText className="h-3.5 w-3.5" />
                    </div>
                </div>
            </TableCell>

            <TableCell className="w-[280px] px-3 py-3">
                <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                    {status.title || status.Title || status.name || status.Name || "Untitled Status"}
                </div>
            </TableCell>

            <TableCell className="flex-1 min-w-[200px] px-3 py-3">
                <span className="block truncate text-blue-800 dark:text-blue-200">
                    {status.description || status.Description || status.descriptif || status.Descriptif || "No description"}
                </span>
            </TableCell>

            <TableCell className="w-[120px] px-2 py-3">
                <div className="flex items-center justify-center">
                    {getStatusTypeBadge(status)}
                </div>
            </TableCell>

            <TableCell className="w-[90px] px-2 py-3">
                <div className="flex items-center justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200"
                                disabled={isCircuitActive}
                                onClick={(e) => {
                                    console.log("Dropdown trigger clicked");
                                    e.stopPropagation();
                                }}
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-100 rounded-lg shadow-lg p-1.5"
                        >
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Edit clicked for status:", status);
                                    console.log("Status ID:", statusId);
                                    onEdit(status);
                                }}
                                className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer"
                                disabled={isCircuitActive}
                            >
                                <Edit2 className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>Edit Status</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Delete clicked for status:", status);
                                    console.log("Status ID:", statusId);
                                    onDelete(statusId);
                                }}
                                className="hover:bg-red-100 dark:hover:bg-red-800/40 rounded-md focus:bg-red-100 dark:focus:bg-red-800/40 px-3 py-2 cursor-pointer text-red-700 dark:text-red-300"
                                disabled={isCircuitActive}
                            >
                                <Trash2 className="mr-2.5 h-4 w-4" />
                                <span>Delete Status</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add tooltip separately for disabled state */}
                    {isCircuitActive && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-blue-900/90 text-blue-100 text-xs rounded border border-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Actions disabled - Circuit is active
                        </div>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
} 