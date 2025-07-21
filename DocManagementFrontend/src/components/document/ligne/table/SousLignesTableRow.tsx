import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SousLigne } from "@/models/document";
import { Edit, Trash2, Plus } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface SousLignesTableRowProps {
    sousLignes: SousLigne[];
    onEdit: (sousLigne: SousLigne) => void;
    onDelete: (sousLigne: SousLigne) => void;
    onAdd: () => void;
    canManageDocuments: boolean;
    isLoading?: boolean;
}

export function SousLignesTableRow({
    sousLignes,
    onEdit,
    onDelete,
    onAdd,
    canManageDocuments,
    isLoading = false,
}: SousLignesTableRowProps) {
    if (isLoading) {
        return (
            <TableRow className="bg-slate-50/30 dark:bg-slate-800/30">
                <TableCell colSpan={10} className="py-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-muted-foreground">Loading sub-lines...</span>
                    </div>
                </TableCell>
            </TableRow>
        );
    }

    if (sousLignes.length === 0) {
        return (
            <TableRow className="bg-slate-50/30 dark:bg-slate-800/30 border-l-4 border-l-primary/20">
                <TableCell></TableCell> {/* Checkbox column */}
                <TableCell colSpan={8} className="py-6">
                    <div className="flex items-center justify-center">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground italic mb-3">
                                <div className="w-6 h-[1px] bg-border"></div>
                                <span>No sub-lines available for this line</span>
                                <div className="w-6 h-[1px] bg-border"></div>
                            </div>
                            {canManageDocuments && (
                                <Button
                                    onClick={onAdd}
                                    size="sm"
                                    className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-md"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add First Sub-Line
                                </Button>
                            )}
                        </div>
                    </div>
                </TableCell>
                <TableCell></TableCell> {/* Actions column */}
            </TableRow>
        );
    }

    return (
        <>
            {sousLignes.map((sousLigne, index) => (
                <TableRow
                    key={sousLigne.id}
                    className="bg-slate-50/30 dark:bg-slate-800/30 border-l-4 border-l-primary/30 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    {/* Checkbox - empty for sub-lines */}
                    <TableCell className="w-[48px]">
                        <div className="flex items-center justify-center">
                            <div className="w-3 h-[1px] bg-border"></div>
                        </div>
                    </TableCell>

                    {/* Sub-Line Key */}
                    <TableCell className="w-[120px]">
                        <div className="flex items-center gap-2 pl-4">
                            <div className="w-2 h-2 rounded-full bg-primary/40"></div>
                            <span className="font-mono text-xs text-muted-foreground">
                                {sousLigne.sousLigneKey || `SL${sousLigne.id}`}
                            </span>
                        </div>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="w-[200px]">
                        <div className="max-w-[180px] pl-4">
                            <p className="font-medium text-foreground/80 truncate text-sm" title={sousLigne.title}>
                                {sousLigne.title}
                            </p>
                            <p className="text-xs text-muted-foreground">Sub-line</p>
                        </div>
                    </TableCell>

                    {/* Attribute */}
                    <TableCell className="w-[150px]">
                        <div className="max-w-[130px]">
                            <span className="text-sm text-foreground/80 truncate block" title={sousLigne.attribute}>
                                {sousLigne.attribute || '-'}
                            </span>
                        </div>
                    </TableCell>

                    {/* Empty cells for numerical columns */}
                    <TableCell className="w-[100px] text-right">
                        <span className="text-xs text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell className="w-[120px] text-right">
                        <span className="text-xs text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell className="w-[120px] text-right">
                        <span className="text-xs text-muted-foreground">-</span>
                    </TableCell>
                    <TableCell className="w-[120px] text-right">
                        <span className="text-xs text-muted-foreground">-</span>
                    </TableCell>

                    {/* Sub-Lines indicator - empty for sub-lines */}
                    <TableCell className="w-[100px] text-center">
                        <span className="text-xs text-muted-foreground">-</span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="w-[120px]">
                        <div className="flex items-center justify-center">
                            {canManageDocuments ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 hover:bg-primary/10"
                                        >
                                            <span className="sr-only">Open menu</span>
                                            <div className="h-3 w-3 flex items-center justify-center">
                                                <div className="grid grid-cols-1 gap-0.5">
                                                    <div className="h-0.5 w-0.5 bg-current rounded-full"></div>
                                                    <div className="h-0.5 w-0.5 bg-current rounded-full"></div>
                                                    <div className="h-0.5 w-0.5 bg-current rounded-full"></div>
                                                </div>
                                            </div>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(sousLigne);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Edit className="h-3 w-3 mr-2" />
                                            Edit Sub-Line
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(sousLigne);
                                            }}
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            Delete Sub-Line
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            ))}
            {/* Add Sub-Line row */}
            {canManageDocuments && sousLignes.length > 0 && (
                <TableRow className="bg-slate-50/20 dark:bg-slate-800/20 border-l-4 border-l-primary/20">
                    <TableCell></TableCell>
                    <TableCell colSpan={8} className="py-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-[1px] bg-border"></div>
                            <Button
                                onClick={onAdd}
                                size="sm"
                                variant="ghost"
                                className="text-primary hover:bg-primary/10 h-6 text-xs"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Another Sub-Line
                            </Button>
                        </div>
                    </TableCell>
                    <TableCell></TableCell>
                </TableRow>
            )}
        </>
    );
} 