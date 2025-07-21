import { Link, useNavigate } from "react-router-dom";
import { Document } from "@/models/document";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Edit,
  Trash,
  GitBranch,
  CheckCircle,
  MoreVertical,
  ExternalLink,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface DocumentsTableRowProps {
  document: Document;
  index: number;
  isSelected: boolean;
  canManageDocuments: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAssignCircuit: () => void;
}

// Document Actions Dropdown component
const DocumentActionsDropdown = ({
  document,
  canManageDocuments,
  onDelete,
  onAssignCircuit,
}: {
  document: Document;
  canManageDocuments: boolean;
  onDelete: () => void;
  onAssignCircuit: () => void;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isAssignedToCircuit = !!document.circuitId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors"
        >
          <MoreVertical className="h-4 w-4 text-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-background/95 backdrop-blur-xl border border-primary/20 text-foreground rounded-lg shadow-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
      >
        <DropdownMenuLabel className="text-muted-foreground">{t("common.actions")}</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-primary/20" />

        <DropdownMenuItem
          className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
          onClick={() => {
            sessionStorage.setItem('documentContext', 'active');
            navigate(`/documents/${document.id}`);
          }}
        >
          <ExternalLink className="mr-2 h-4 w-4 text-primary" />
          {t("documents.viewDocument")}
        </DropdownMenuItem>

        {canManageDocuments && (
          <>
            {/* Show Document Flow if assigned to circuit */}
            {isAssignedToCircuit && (
              <DropdownMenuItem
                className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                onClick={() => navigate(`/documents/${document.id}/flow`)}
              >
                <GitBranch className="mr-2 h-4 w-4 text-primary" />
                {t("documents.documentFlow")}
              </DropdownMenuItem>
            )}

            {/* Show Assign to Circuit if not assigned */}
            {!isAssignedToCircuit && (
              <DropdownMenuItem
                className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
                onClick={onAssignCircuit}
              >
                <GitBranch className="mr-2 h-4 w-4 text-primary" />
                Assign to Circuit
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer"
              asChild
            >
              <Link to={`/documents/${document.id}/edit`}>
                <Edit className="mr-2 h-4 w-4 text-primary" />
                {t("common.edit")}
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-primary/20" />

            <DropdownMenuItem
              className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </>
        )}

        {!canManageDocuments && (
          <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
            <Edit className="mr-2 h-4 w-4" />
            No Permission
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default function DocumentsTableRow({
  document,
  index,
  isSelected,
  canManageDocuments,
  onSelect,
  onDelete,
  onAssignCircuit,
}: DocumentsTableRowProps) {
  // Check if document is already assigned to a circuit
  const isAssignedToCircuit = !!document.circuitId;

  return (
    <TableRow
      className={`border-primary/10 hover:bg-primary/5 transition-all duration-200 ${isSelected ? "bg-primary/10 border-l-4 border-l-primary" : ""
        }`}
    >
      <TableCell className="w-[50px] py-3">
        {canManageDocuments ? (
          <ProfessionalCheckbox
            checked={isSelected}
            onCheckedChange={onSelect}
            size="md"
            variant="row"
            className="shadow-sm"
          />
        ) : (
          <span className="text-sm text-muted-foreground">{index + 1}</span>
        )}
      </TableCell>
      <TableCell className="w-[160px] font-mono text-sm py-3">
        <Link
          to={`/documents/${document.id}`}
          className="text-primary hover:text-primary/80 hover:underline transition-colors flex items-center gap-1"
          onClick={() => sessionStorage.setItem('documentContext', 'active')}
        >
          <FileText className="h-3.5 w-3.5 opacity-70" />
          {document.documentKey}
        </Link>
      </TableCell>
      <TableCell className="w-[250px] py-3">
        <Link
          to={`/documents/${document.id}`}
          className="text-foreground hover:text-primary font-medium hover:underline transition-colors"
          onClick={() => sessionStorage.setItem('documentContext', 'active')}
        >
          {document.title}
        </Link>
      </TableCell>
      <TableCell className="w-[150px] text-foreground py-3">
        {document.documentType.typeName}
      </TableCell>
      <TableCell className="w-[140px] text-muted-foreground text-sm py-3">
        {new Date(document.docDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="w-[150px] py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">
              {document.responsibilityCentre?.code || 'N/A'}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[100px] text-right py-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <DocumentActionsDropdown
                  document={document}
                  canManageDocuments={canManageDocuments}
                  onDelete={onDelete}
                  onAssignCircuit={onAssignCircuit}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-background/95 backdrop-blur-xl border border-primary/20 text-foreground">
              Document Actions
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}

function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return (
        <Badge className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border-amber-500/30 px-3 py-1 text-xs font-medium">
          Draft
        </Badge>
      );
    case 1:
      return (
        <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/30 px-3 py-1 text-xs font-medium">
          In progress
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-blue-600/20 text-blue-500 hover:bg-blue-600/30 border-blue-500/30 px-3 py-1 text-xs font-medium">
          Completed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="px-3 py-1 text-xs font-medium">
          Unknown
        </Badge>
      );
  }
}
