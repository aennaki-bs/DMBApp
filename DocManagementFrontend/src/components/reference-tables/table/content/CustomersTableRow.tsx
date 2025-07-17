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
import { MoreVertical, Edit, Eye, Trash2, Users } from "lucide-react";
import { Customer } from "@/models/customer";
import { cn } from "@/lib/utils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface CustomersTableRowProps {
    customer: Customer;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
}

export function CustomersTableRow({
    customer,
    isSelected,
    onSelect,
    onEdit,
    onView,
    onDelete,
}: CustomersTableRowProps) {
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
                "border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group",
                isSelected
                    ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
                    : "hover:shadow-sm"
            )}
            onClick={handleRowClick}
        >
            {/* Selection Column */}
            <TableCell className="w-[48px]">
                <div className="flex items-center justify-center">
                    <ProfessionalCheckbox
                        checked={isSelected}
                        onCheckedChange={onSelect}
                        size="md"
                        variant="row"
                    />
                </div>
            </TableCell>

            {/* Code Column */}
            <TableCell className="w-[120px]">
                <Badge
                    variant="outline"
                    className="bg-orange-900/30 border-orange-500/30 text-orange-300 font-medium"
                >
                    {customer.code}
                </Badge>
            </TableCell>

            {/* Name Column */}
            <TableCell className="w-[200px]">
                <div className="font-medium text-blue-900 dark:text-blue-100">
                    {customer.name}
                </div>
            </TableCell>

            {/* Address Column */}
            <TableCell className="w-[250px] text-blue-800 dark:text-blue-200">
                <span className="block truncate" title={customer.address}>
                    {customer.address || 'No address'}
                </span>
            </TableCell>

            {/* City Column */}
            <TableCell className="w-[150px] text-blue-800 dark:text-blue-200">
                <span className="block truncate" title={customer.city}>
                    {customer.city || 'No city'}
                </span>
            </TableCell>

            {/* Country Column */}
            <TableCell className="w-[120px]">
                {customer.country ? (
                    <Badge
                        variant="secondary"
                        className="font-medium text-xs px-3 py-1 border"
                    >
                        {customer.country}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">No country</span>
                )}
            </TableCell>

            {/* Actions Column */}
            <TableCell className="w-[100px] text-right">
                <div className="flex items-center justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 no-row-select"
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                            >
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu for {customer.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-white dark:bg-gradient-to-b dark:from-[#1a2c6b] dark:to-[#0a1033] border border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-100 rounded-lg shadow-lg p-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
                        >
                            <DropdownMenuLabel className="flex items-center gap-2 text-blue-800 dark:text-blue-200 px-3 py-2">
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                Customer Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView();
                                }}
                                className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer opacity-50 cursor-not-allowed"
                                disabled={true}
                            >
                                <Eye className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>View Details</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="hover:bg-blue-100 dark:hover:bg-blue-800/40 rounded-md focus:bg-blue-100 dark:focus:bg-blue-800/40 px-3 py-2 cursor-pointer opacity-50 cursor-not-allowed"
                                disabled={true}
                            >
                                <Edit className="mr-2.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span>Edit</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-blue-300 dark:bg-blue-800/40 my-1" />

                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-900 dark:hover:text-red-200 rounded-md focus:bg-red-100 dark:focus:bg-red-900/30 focus:text-red-900 dark:focus:text-red-200 px-3 py-2 cursor-pointer opacity-50 cursor-not-allowed"
                                disabled={true}
                            >
                                <Trash2 className="mr-2.5 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
} 