import { TableRow, TableCell } from "@/components/ui/table";
import { DocumentType } from "@/models/document";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentTypeTableRowProps {
  type: DocumentType;
  isSelected: boolean;
  onSelectType: (id: number, checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
}

export const DocumentTypeTableRow = ({
  type,
  isSelected,
  onSelectType,
  onDeleteType,
  onEditType,
}: DocumentTypeTableRowProps) => {
  const isEligibleForSelection = type.documentCounter === 0;

  return (
    <TableRow
      className={`border-blue-900/30 hover:bg-blue-900/20 transition-colors ${
        isSelected ? "bg-blue-900/30 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectType(type.id!, !!checked)}
          disabled={!isEligibleForSelection}
          className="border-blue-500/50"
        />
      </TableCell>
      <TableCell className="font-medium text-blue-100">
        {type.typeKey || "No code"}
      </TableCell>
      <TableCell className="text-blue-100">
        {type.typeName || "Unnamed Type"}
      </TableCell>
      <TableCell className="text-blue-200/70 max-w-xs truncate">
        {type.typeAttr || "No description"}
      </TableCell>
      <TableCell className="text-blue-200">
        {type.documentCounter || 0}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
                  asChild
                >
                  <Link to={`/document-types/${type.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Document Type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-400 hover:text-green-300 hover:bg-green-800/30"
                  asChild
                >
                  <Link to={`/document-types/${type.id}/subtypes`}>
                    <Layers className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Subtypes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
                  onClick={() => onEditType(type)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Document Type</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={() => onDeleteType(type.id!)}
                  disabled={type.documentCounter !== 0}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {type.documentCounter !== 0
                    ? "Cannot delete (in use)"
                    : "Delete Document Type"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
};
