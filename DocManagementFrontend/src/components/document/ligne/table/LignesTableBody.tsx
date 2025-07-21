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

interface LignesTableBodyProps {
    lignes: Ligne[];
    selectedLignes: number[];
    onSelectLigne: (ligneId: number) => void;
    onEdit: (ligne: Ligne) => void;
    onDelete: (ligne: Ligne) => void;
    canManageDocuments: boolean;
    documentId: number;
}

export function LignesTableBody({
    lignes,
    selectedLignes,
    onSelectLigne,
    onEdit,
    onDelete,
    canManageDocuments,
    documentId,
}: LignesTableBodyProps) {
    const navigate = useNavigate();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(num);
    };

    const handleViewSublines = (ligneId: number) => {
        navigate(`/documents/${documentId}/lines/${ligneId}/sublines`);
    };

    return (
        <TableBody>
            {lignes.map((ligne) => (
                <TableRow
                    key={ligne.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-200/50 dark:border-slate-700/50"
                >
                    {/* Checkbox */}
                    <TableCell className="w-[48px]">
                        <div className="flex items-center justify-center">
                            <ProfessionalCheckbox
                                checked={selectedLignes.includes(ligne.id)}
                                onCheckedChange={() => onSelectLigne(ligne.id)}
                                size="md"
                                variant="row"
                                className="shadow-lg"
                            />
                        </div>
                    </TableCell>

                    {/* Line Key */}
                    <TableCell className="w-[120px]">
                        <span className="font-mono text-sm text-foreground font-medium">
                            {ligne.ligneKey || `L${ligne.id}`}
                        </span>
                    </TableCell>

                    {/* Title */}
                    <TableCell className="w-[200px]">
                        <div className="max-w-[180px] truncate">
                            <span className="font-medium text-foreground">
                                {ligne.title || "Untitled Line"}
                            </span>
                        </div>
                    </TableCell>

                    {/* Article */}
                    <TableCell className="w-[200px]">
                        <div className="max-w-[180px] truncate">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <div className="font-medium text-foreground">
                                        {ligne.item?.description || ligne.lignesElementType?.typeElement || "N/A"}
                                    </div>
                                    {ligne.item?.code && (
                                        <div className="text-xs text-muted-foreground">
                                            Code: {ligne.item.code}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="w-[100px] text-right">
                        <div className="flex flex-col items-end">
                            <span className="font-medium text-foreground">
                                {formatNumber(ligne.quantity || 0)}
                            </span>
                            {ligne.unit?.code && (
                                <span className="text-xs text-muted-foreground">
                                    {ligne.unit.code}
                                </span>
                            )}
                        </div>
                    </TableCell>

                    {/* Price HT */}
                    <TableCell className="w-[120px] text-right">
                        <span className="font-medium text-foreground">
                            {formatCurrency(ligne.priceHT || 0)}
                        </span>
                    </TableCell>

                    {/* Amount HT */}
                    <TableCell className="w-[120px] text-right">
                        <span className="font-medium text-foreground">
                            {formatCurrency(ligne.amountHT || 0)}
                        </span>
                    </TableCell>

                    {/* Amount TTC */}
                    <TableCell className="w-[120px] text-right">
                        <span className="font-bold text-foreground">
                            {formatCurrency(ligne.amountTTC || 0)}
                        </span>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="w-[120px] text-center">
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
                                        onClick={() => handleViewSublines(ligne.id)}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="h-4 w-4 mr-2 text-blue-500" />
                                        View Sublines
                                    </DropdownMenuItem>
                                    {canManageDocuments && (
                                        <>
                                            <DropdownMenuItem
                                                onClick={() => onEdit(ligne)}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="h-4 w-4 mr-2 text-blue-500" />
                                                Edit Line
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(ligne)}
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