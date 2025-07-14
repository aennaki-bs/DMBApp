import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Eye, Trash2 } from "lucide-react";
import { LignesElementType } from "@/models/lineElements";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ElementTypesTableRowProps {
    elementType: LignesElementType;
    isSelected: boolean;
    onSelect: () => void;
    onEdit: () => void;
    onView: () => void;
    onDelete: () => void;
}

export function ElementTypesTableRow({
    elementType,
    isSelected,
    onSelect,
    onEdit,
    onView,
    onDelete,
}: ElementTypesTableRowProps) {
    // Clean and format the code name to handle edge cases
    const getDisplayCodeName = (code?: string) => {
        if (!code || code.trim() === '') {
            return "Unnamed Element";
        }

        // Clean the code name by removing unwanted numeric suffixes
        let cleanName = code.trim();

        // Very aggressive cleaning to handle all possible patterns:

        // 1. Remove numbers directly attached to the end (like "Name0", "Name123")
        cleanName = cleanName.replace(/\d+$/, '');

        // 2. Remove trailing spaces and numbers (like " 0 0", " 1 2 3", etc.)
        cleanName = cleanName.replace(/(\s+\d+)+\s*$/, '');

        // 3. Remove any remaining standalone numbers at the end
        cleanName = cleanName.replace(/\s+\d+$/, '');

        // 4. Remove multiple spaces and clean up
        cleanName = cleanName.replace(/\s+/g, ' ');

        // 5. Remove any trailing zeros specifically (with or without spaces)
        cleanName = cleanName.replace(/\s*0+\s*$/, '');

        // 6. Final cleanup of any remaining numbers at the end
        cleanName = cleanName.replace(/[\s\d]*$/, '').trim();

        // If the name is empty after cleaning, it was probably all numbers
        if (!cleanName || cleanName.trim() === '') {
            return "Unnamed Element";
        }

        // Final trim
        cleanName = cleanName.trim();

        // Check for numeric-only values like "00", "0", etc.
        if (/^\d+$/.test(cleanName)) {
            return `Element ${cleanName}`;
        }

        // Check for very short or invalid names after cleaning
        if (cleanName.length < 2) {
            return "Unnamed Element";
        }

        return cleanName;
    };

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case "Item":
                return "default";
            case "GeneralAccounts":
                return "secondary";
            default:
                return "outline";
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "Item":
                return "Item";
            case "GeneralAccounts":
                return "General Account";
            default:
                return type;
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy");
        } catch {
            return "Invalid date";
        }
    };

    return (
        <TableRow
            className={cn(
                "border-b border-primary/10 hover:bg-primary/5 transition-colors duration-200",
                isSelected && "bg-primary/10 hover:bg-primary/15"
            )}
        >
            {/* Selection Column */}
            <TableCell className="w-12 px-4">
                <div className="flex items-center justify-center">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onSelect}
                        className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        aria-label={`Select element type ${getDisplayCodeName(elementType.code)}`}
                    />
                </div>
            </TableCell>

            {/* Code Column */}
            <TableCell className="w-36 px-4">
                <div className="font-medium text-foreground">{getDisplayCodeName(elementType.code)}</div>
            </TableCell>

            {/* Type Column */}
            <TableCell className="w-44 px-4">
                <Badge variant={getTypeBadgeVariant(elementType.typeElement)}>
                    {getTypeLabel(elementType.typeElement)}
                </Badge>
            </TableCell>

            {/* Description Column */}
            <TableCell className="flex-1 px-4">
                <div className="max-w-xs truncate text-muted-foreground" title={elementType.description}>
                    {elementType.description}
                </div>
            </TableCell>

            {/* Table Name Column */}
            <TableCell className="w-40 px-4">
                <div className="text-sm text-muted-foreground font-mono">
                    {elementType.tableName}
                </div>
            </TableCell>

            {/* Created Date Column */}
            <TableCell className="w-36 px-4">
                <div className="text-sm text-muted-foreground">
                    {formatDate(elementType.createdAt)}
                </div>
            </TableCell>

            {/* Actions Column */}
            <TableCell className="w-24 px-4">
                <div className="flex items-center justify-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu for {elementType.code}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl"
                        >
                            <DropdownMenuItem
                                onClick={onView}
                                className="hover:bg-primary/10 hover:text-primary cursor-pointer"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onEdit}
                                className="hover:bg-primary/10 hover:text-primary cursor-pointer"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={onDelete}
                                className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </TableCell>
        </TableRow>
    );
} 