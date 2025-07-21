import { TableRow, TableCell } from "@/components/ui/table";
import { DocumentType, TierType } from "@/models/document";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  AlertCircle,
  ChevronRight,
  Users,
  UserCheck,
  Package,
  Layers,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getErpTypeFromNumber } from "@/utils/erpTypeUtils";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface DocumentTypeTableRowProps {
  type: DocumentType;
  isSelected: boolean;
  onSelect: (typeId: number) => void;
  onEditType: (type: DocumentType) => void;
  onDeleteType: (typeId: number) => void;
  canSelectType?: (type: DocumentType) => boolean;
  getDisabledReason?: (type: DocumentType) => string | null;
}

export const DocumentTypeTableRow = ({
  type,
  isSelected,
  onSelect,
  onEditType,
  onDeleteType,
  canSelectType,
  getDisabledReason,
}: DocumentTypeTableRowProps) => {
  const navigate = useNavigate();

  // Use enhanced association checks if available, fallback to simple document counter check
  const hasDocuments = type.documentCounter && type.documentCounter > 0;
  const canSelect = canSelectType ? canSelectType(type) : !hasDocuments;
  const isDisabled = !canSelect;
  const disabledReason = getDisabledReason ? getDisabledReason(type) : 
    (hasDocuments ? `Cannot select: has ${type.documentCounter} document(s)` : null);

  const renderTierType = (tierType?: TierType | number) => {
    if (!tierType || tierType === TierType.None || tierType === 0) {
      return (
        <Badge
          variant="secondary"
          className="bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600/50"
        >
          None
        </Badge>
      );
    }

    const tierConfig: Record<TierType, {
      label: string;
      icon: any;
      className: string;
    }> = {
      [TierType.None]: {
        label: "None",
        icon: Users,
        className: "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600/50",
      },
      [TierType.Customer]: {
        label: "Customer",
        icon: Users,
        className: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30",
      },
      [TierType.Vendor]: {
        label: "Vendor",
        icon: Package,
        className: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30",
      },
    };

    const config = tierConfig[tierType];
    if (!config) return <Badge variant="secondary">Unknown</Badge>;

    const IconComponent = config.icon;

    return (
      <Badge
        variant="secondary"
        className={cn(config.className, "flex items-center gap-1")}
      >
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const renderErpType = (erpTypeNumber?: number) => {
    if (erpTypeNumber === undefined || erpTypeNumber === null) {
      return (
        <span className="text-slate-500 dark:text-slate-400 text-sm">None</span>
      );
    }

    const erpType = getErpTypeFromNumber(erpTypeNumber);
    return (
      <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
        {erpType || "Unknown"}
      </span>
    );
  };

  const handleTypeNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Allow navigation to subtypes for all document types
    navigate(`/document-types/${type.id}/subtypes`);
  };

  // Clean and format the type name to handle edge cases
  const getDisplayTypeName = (typeName?: string) => {
    if (!typeName || typeName.trim() === '') {
      return "Unnamed Type";
    }

    // Clean the type name by removing unwanted numeric suffixes
    let cleanName = typeName.trim();

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
      return "Unnamed Type";
    }

    // Final trim
    cleanName = cleanName.trim();

    // Check for numeric-only values like "00", "0", etc.
    if (/^\d+$/.test(cleanName)) {
      return `Type ${cleanName}`;
    }

    // Check for very short or invalid names after cleaning
    if (cleanName.length < 2) {
      return "Unnamed Type";
    }

    return cleanName;
  };

  return (
    <TableRow
      className={`border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 group ${isDisabled
        ? "bg-slate-50/50 dark:bg-slate-800/10 hover:bg-slate-100/50 dark:hover:bg-slate-800/20 cursor-default"
        : isSelected
          ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer hover:shadow-sm"
        }`}
      onClick={(e) => {
        // Don't allow selection of disabled types (those with documents)
        if (isDisabled) return;

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
        onSelect(type.id!);
      }}
    >
      {/* Selection Checkbox - exactly like UserTable */}
      <TableCell className="w-[48px] text-center">
        <div className="flex items-center justify-center">
          {isDisabled && disabledReason ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ProfessionalCheckbox
                      checked={false}
                      onCheckedChange={() => {}}
                      size="md"
                      variant="row"
                      disabled={true}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 border-slate-600 text-slate-200 max-w-xs">
                  <p>{disabledReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <ProfessionalCheckbox
              checked={isSelected && !isDisabled}
              onCheckedChange={() => !isDisabled && onSelect(type.id!)}
              size="md"
              variant="row"
              disabled={isDisabled}
            />
          )}
        </div>
      </TableCell>

      {/* Icon Column - like UserTable avatar */}
      <TableCell className="w-[48px] text-center">
        <div className="flex items-center justify-center">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center border-2 border-blue-300 dark:border-blue-900/50">
            <Layers className="h-5 w-5 text-white" />
          </div>
        </div>
      </TableCell>

      {/* Type Name - Enhanced clickable design */}
      <TableCell className="w-[200px]">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto px-2 py-1 font-medium justify-start text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all duration-200 rounded-md border border-transparent hover:border-blue-200 dark:hover:border-blue-700/50"
                  onClick={handleTypeNameClick}
                >
                  <span className="flex items-center gap-2 group">
                    <Eye className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="underline-offset-4 group-hover:underline">
                      {type.typeName}
                    </span>
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to manage series for this document type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>

      {/* Description */}
      <TableCell className="w-[280px] text-blue-800 dark:text-blue-200">
        <span className="block truncate">
          {type.typeAttr || "No description"}
        </span>
      </TableCell>

      {/* Tier Type */}
      <TableCell className="w-[150px] text-center">
        {renderTierType(type.tierType)}
      </TableCell>

      {/* ERP Type */}
      <TableCell className="w-[120px] text-center">
        {renderErpType(type.typeNumber)}
      </TableCell>

      {/* Actions */}
      <TableCell className="w-[100px] text-center">
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  // Allow navigation to series for all document types
                  navigate(`/document-types/${type.id}/subtypes`);
                }}
                className="rounded-lg cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
              >
                <Eye className="mr-2 h-4 w-4" />
                <span>View Series</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) onEditType(type);
                }}
                className={`rounded-lg ${isDisabled
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : "cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                  }`}
                disabled={isDisabled}
              >
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit{isDisabled ? ' (Protected)' : ''}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) onDeleteType(type.id!);
                }}
                className={`rounded-lg ${isDisabled
                  ? "opacity-50 cursor-not-allowed text-slate-400"
                  : "text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  }`}
                disabled={isDisabled}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete{isDisabled ? ' (Protected)' : ''}</span>
                {isDisabled && disabledReason && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="ml-2 h-3 w-3 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 border-slate-600 text-slate-200 max-w-xs">
                        <p>{disabledReason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}; 