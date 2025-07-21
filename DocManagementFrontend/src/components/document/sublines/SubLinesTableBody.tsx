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

interface SubLinesTableBodyProps {
    subLines: SousLigne[];
    selectedSubLines: number[];
    onSelectSubLine: (subLineId: number) => void;
    onEdit: (subLine: SousLigne) => void;
    onDelete: (subLine: SousLigne) => void;
    canManageDocuments: boolean;
}

export function SubLinesTableBody({
    subLines,
    selectedSubLines,
    onSelectSubLine,
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

    return (
        <TableBody>
            {subLines.map((subLine) => (
                <TableRow
                    key={subLine.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-200/50 dark:border-slate-700/50"
                >
                    {/* Checkbox */}
                    <TableCell className="w-[48px]">
                        <div className="flex items-center justify-center">
                            <ProfessionalCheckbox
                                checked={selectedSubLines.includes(subLine.id)}
                                onCheckedChange={() => onSelectSubLine(subLine.id)}
                                size="md"
                                variant="table"
                                className="shadow-lg"
                            />
                        </div>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="w-[200px]">
                        <div className="max-w-[180px] truncate">
                            <span className="font-medium text-foreground">
                                {subLine.title || "Untitled Sub-Line"}
                            </span>
                        </div>
                    </TableCell>

                    {/* Attribute */}
                    <TableCell className="flex-1">
                        <div className="max-w-full">
                            <span className="text-foreground">
                                {subLine.attribute || "No attribute"}
                            </span>
                        </div>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="w-[150px]">
                        <span className="text-sm text-muted-foreground">
                            {subLine.createdAt ? formatDate(subLine.createdAt) : "N/A"}
                        </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="w-[100px]">
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
                                            onClick={() => onEdit(subLine)}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="h-4 w-4 mr-2 text-blue-500" />
                                            Edit Sub-Line
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete(subLine)}
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