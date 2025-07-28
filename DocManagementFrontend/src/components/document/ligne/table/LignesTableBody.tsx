import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ligne } from "@/models/document";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { Edit, Trash2, Eye, FileStack } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { cn } from "@/lib/utils";

interface LignesTableBodyProps {
    lignes: Ligne[];
    bulkSelection: ReturnType<typeof useBulkSelection<Ligne>>;
    onEdit: (ligne: Ligne) => void;
    onDelete: (ligne: Ligne) => void;
    canManageDocuments: boolean;
    documentId: number;
}

export function LignesTableBody({
    lignes,
    bulkSelection,
    onEdit,
    onDelete,
    canManageDocuments,
    documentId,
}: LignesTableBodyProps) {
    const navigate = useNavigate();

    const handleRowClick = (ligne: Ligne, event: React.MouseEvent) => {
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
        bulkSelection.toggleItem(ligne);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(num);
    };

    const handleViewSublines = (ligneId: number, event: React.MouseEvent) => {
        event.stopPropagation();
        navigate(`/documents/${documentId}/lines/${ligneId}/sublines`);
    };

    return (
        <TableBody>
            {lignes.map((ligne) => (
                <TableRow
                    key={ligne.id}
                    className={cn(
                        "border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group",
                        bulkSelection.isSelected(ligne)
                            ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
                            : "hover:shadow-sm"
                    )}
                    onClick={(e) => handleRowClick(ligne, e)}
                >
                    {/* Selection Column */}
                    <TableCell className="w-[48px]">
                        <div className="flex items-center justify-center">
                            <ProfessionalCheckbox
                                checked={bulkSelection.isSelected(ligne)}
                                onCheckedChange={() => bulkSelection.toggleItem(ligne)}
                                size="md"
                                variant="row"
                            />
                        </div>
                    </TableCell>

                    {/* Line Key Column */}
                    <TableCell className="w-[120px]">
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                            {ligne.ligneKey || `L${ligne.id}`}
                        </div>
                    </TableCell>

                    {/* Title Column */}
                    <TableCell className="w-[200px]">
                        <div className="max-w-[180px]">
                            <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                                {ligne.title || "Untitled Line"}
                            </div>
                            {ligne.description && (
                                <div className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                    {ligne.description}
                                </div>
                            )}
                        </div>
                    </TableCell>

                    {/* Article Column */}
                    <TableCell className="w-[200px]">
                        <div className="max-w-[180px]">
                            <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
                                {ligne.article || "N/A"}
                            </div>
                            {ligne.code && (
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                    Code: {ligne.code}
                                </div>
                            )}
                        </div>
                    </TableCell>

                    {/* Quantity Column */}
                    <TableCell className="w-[100px] text-right">
                        <div className="flex flex-col items-end">
                            <span className="font-medium text-blue-900 dark:text-blue-100">
                                {formatNumber(ligne.quantity || 0)}
                            </span>
                            {ligne.unite && (
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                    {ligne.unite}
                                </span>
                            )}
                        </div>
                    </TableCell>

                    {/* Price HT Column */}
                    <TableCell className="w-[120px] text-right">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                            {formatCurrency(ligne.priceHT || 0)}
                        </span>
                    </TableCell>

                    {/* Amount HT Column */}
                    <TableCell className="w-[120px] text-right">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                            {formatCurrency(ligne.amountHT || 0)}
                        </span>
                    </TableCell>

                    {/* Amount TTC Column */}
                    <TableCell className="w-[120px] text-right">
                        <span className="font-bold text-blue-900 dark:text-blue-100">
                            {formatCurrency(ligne.amountTTC || 0)}
                        </span>
                    </TableCell>

                    {/* Actions Column */}
                    <TableCell className="w-[120px] text-center" data-no-row-select>
                        <div className="flex items-center justify-center">
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
                                        onClick={(e) => handleViewSublines(ligne.id, e)}
                                        className="cursor-pointer"
                                    >
                                        <FileStack className="h-4 w-4 mr-2 text-blue-500" />
                                        View Sub-lines
                                    </DropdownMenuItem>
                                    {canManageDocuments && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(ligne);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="h-4 w-4 mr-2 text-blue-500" />
                                                Edit Line
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(ligne);
                                                }}
                                                className="cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete Line
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
} 