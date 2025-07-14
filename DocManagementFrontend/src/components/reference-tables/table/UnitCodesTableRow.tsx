import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { UnitCodesActionsDropdown } from "./row/UnitCodesActionsDropdown";
import { UniteCode } from "@/models/lineElements";

interface UnitCodesTableRowProps {
  unitCode: UniteCode;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const UnitCodesTableRow: React.FC<UnitCodesTableRowProps> = ({
  unitCode,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TableRow className="border-b border-primary/10 hover:bg-primary/5 transition-all duration-200">
      <TableCell className="w-[50px] text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${unitCode.code}`}
          className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </TableCell>
      <TableCell className="font-mono font-semibold text-foreground">
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20 transition-colors">
          {unitCode.code}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="truncate max-w-[300px]">{unitCode.description}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(unitCode.createdAt)}
      </TableCell>
      <TableCell className="text-right pr-6">
        <UnitCodesActionsDropdown
          unitCode={unitCode}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      </TableCell>
    </TableRow>
  );
};

export default UnitCodesTableRow; 