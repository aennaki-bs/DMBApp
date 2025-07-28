import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SousLigne } from "@/models/document";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { Edit, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { cn } from "@/lib/utils";

interface SubLinesTableBodyProps {
    subLines: SousLigne[];
    bulkSelection: ReturnType<typeof useBulkSelection<SousLigne>>;
    onEdit: (subLine: SousLigne) => void;
    onDelete: (subLine: SousLigne) => void;
    canManageDocuments: boolean;
}

export function SubLinesTableBody({
    subLines,
    bulkSelection,
    onEdit,
    onDelete,
    canManageDocuments,
}: SubLinesTableBodyProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleRowClick = (subLine: SousLigne, event: React.MouseEvent) => {
        // Don't trigger row selection if clicking on interactive elements
        const target = event.target as HTMLElement;
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
        
        // Toggle selection on row click
        bulkSelection.toggleItem(subLine);
    };

    return (
        <TableBody>
            {subLines.map((subLine) => (
                <TableRow
                    key={subLine.id}
                    className={cn(
                        "border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group",
                        bulkSelection.isSelected(subLine)
                            ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
                            : "hover:shadow-sm"
                    )}
                    onClick={(e) => handleRowClick(subLine, e)}
                >
                    {/* Selection Column */}
                    <TableCell className="w-[48px]">
                        <div className="flex items-center justify-center">
                            <ProfessionalCheckbox
                                checked={bulkSelection.isSelected(subLine)}
                                onCheckedChange={() => bulkSelection.toggleItem(subLine)}
                                size="md"
                                variant="row"
                            />
                        </div>
                    </TableCell>

                    {/* Title Column */}
                    <TableCell className="w-[200px]">
                        <div className="max-w-[180px]">
                            <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                                {subLine.title || "Untitled Sub-Line"}
                            </div>
                        </div>
                    </TableCell>

                    {/* Attribute Column */}
                    <TableCell className="flex-1">
                        <div className="max-w-full">
                            <div className="font-medium text-blue-900 dark:text-blue-100">
                                {subLine.attribute || "No attribute"}
                            </div>
                        </div>
                    </TableCell>

                    {/* Created Date Column */}
                    <TableCell className="w-[150px]">
                        <span className="text-sm text-blue-600 dark:text-blue-400">
                            {subLine.createdAt ? formatDate(subLine.createdAt) : "N/A"}
                        </span>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="w-[100px] text-center" data-no-row-select>
                        <div className="flex items-center justify-center">
                            {canManageDocuments ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-primary/10"
                                        >
                                            <span className="sr-only">Open menu</span>
                                            <div className="flex flex-col gap-0.5">
                                                <div className="w-1 h-1 bg-foreground rounded-full"></div>
                                                <div className="w-1 h-1 bg-foreground rounded-full"></div>
                                                <div className="w-1 h-1 bg-foreground rounded-full"></div>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[160px]">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(subLine);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="h-4 w-4 mr-2 text-blue-500" />
                                            Edit Sub-Line
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(subLine);
                                            }}
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete Sub-Line
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
} 