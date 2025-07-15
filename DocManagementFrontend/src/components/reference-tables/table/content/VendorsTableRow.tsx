import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, Trash2, Truck } from "lucide-react";
import { Vendor } from "@/models/vendor";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VendorsTableRowProps {
    vendor: Vendor;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
}

export function VendorsTableRow({
    vendor,
    isSelected,
    onSelect,
    onEdit,
    onView,
    onDelete,
}: VendorsTableRowProps) {
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

            {/* Icon Column */}
            <TableCell className="w-[48px] text-center">
                <div className="flex items-center justify-center">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center border-2 border-orange-300 dark:border-orange-900/50">
                        <Truck className="h-5 w-5 text-white" />
                    </div>
                </div>
            </TableCell>

            {/* Vendor Code Column */}
            <TableCell className="w-[120px]">
                <Badge
                    variant="outline"
                    className="bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-300 font-medium"
                >
                    {vendor.vendorCode}
                </Badge>
            </TableCell>

            {/* Name Column */}
            <TableCell className="w-[200px]">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                    {vendor.name}
                </div>
            </TableCell>

            {/* Address Column */}
            <TableCell className="w-[250px] text-blue-800 dark:text-blue-200">
                <span className="block truncate" title={vendor.address}>
                    {vendor.address || 'No address'}
                </span>
            </TableCell>

            {/* City Column */}
            <TableCell className="w-[150px] text-blue-800 dark:text-blue-200">
                <span className="block truncate" title={vendor.city}>
                    {vendor.city || 'No city'}
                </span>
            </TableCell>

            {/* Country Column */}
            <TableCell className="w-[120px]">
                {vendor.country ? (
                    <Badge
                        variant="secondary"
                        className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600/50 font-medium text-xs px-3 py-1"
                    >
                        {vendor.country}
                    </Badge>
                ) : (
                    <span className="text-slate-500 dark:text-slate-400 text-sm">No country</span>
                )}
            </TableCell>

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
                                <span className="sr-only">Open menu for {vendor.name}</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl"
                        >
                            <DropdownMenuLabel className="flex items-center gap-2 text-blue-800 dark:text-blue-200 px-3 py-2">
                                <Truck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                Vendor Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView();
                                }}
                                className="rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary opacity-50 cursor-not-allowed"
                                disabled={true}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary opacity-50 cursor-not-allowed"
                                disabled={true}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer opacity-50 cursor-not-allowed"
                                disabled={true}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
} 