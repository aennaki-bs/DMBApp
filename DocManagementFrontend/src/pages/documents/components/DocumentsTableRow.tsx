import { Link, useNavigate } from "react-router-dom";
import { Document } from "@/models/document";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface DocumentsTableRowProps {
  document: Document;
  index: number;
  isSelected: boolean;
  canManageDocuments: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAssignCircuit: () => void;
}

const getStatusBadge = (status: number) => {
  const { t } = useTranslation();
  switch (status) {
    case 0:
      return (
        <Badge className="table-glass-badge-warning">
          {t("documents.statusDraft")}
        </Badge>
      );
    case 1:
      return (
        <Badge className="table-glass-badge-success">
          {t("documents.statusInProgress")}
        </Badge>
      );
    default:
      return <Badge variant="outline">{t("common.unknown")}</Badge>;
  }
};

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

  // Check if document is already assigned to a circuit
  const isAssignedToCircuit = !!document.circuitId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="table-glass-action-button" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="table-glass-dropdown">
        <DropdownMenuLabel className="table-glass-dropdown-label">
          {t("common.actions")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="table-glass-dropdown-separator" />

        <DropdownMenuItem
          onClick={() => navigate(`/documents/${document.id}`)}
          className="table-glass-dropdown-item"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {t("common.view")}
        </DropdownMenuItem>

        {canManageDocuments && (
          <>
            <DropdownMenuItem
              onClick={() => navigate(`/documents/${document.id}/edit`)}
              className="table-glass-dropdown-item"
            >
              <Edit className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onAssignCircuit}
              disabled={isAssignedToCircuit}
              className="table-glass-dropdown-item"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              {isAssignedToCircuit
                ? "Already Assigned"
                : t("documents.assignCircuit")}
              {isAssignedToCircuit && (
                <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="table-glass-dropdown-separator" />
            <DropdownMenuItem
              onClick={onDelete}
              className="table-glass-dropdown-item-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t("common.delete")}
            </DropdownMenuItem>
          </>
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
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={`table-glass-row ${
        isSelected ? "table-glass-row-selected" : ""
      }`}
    >
      <TableCell className="w-[50px] py-3">
        {canManageDocuments ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="table-glass-checkbox"
          />
        ) : (
          <span className="table-glass-index">{index + 1}</span>
        )}
      </TableCell>
      <TableCell className="w-[160px] font-mono text-sm py-3">
        <Link
          to={`/documents/${document.id}`}
          className="table-glass-link flex items-center gap-1"
        >
          <FileText className="h-3.5 w-3.5 opacity-70" />
          {document.documentKey}
        </Link>
      </TableCell>
      <TableCell className="w-[250px] py-3">
        <Link
          to={`/documents/${document.id}`}
          className="table-glass-link-primary"
        >
          {document.title}
        </Link>
      </TableCell>
      <TableCell className="w-[120px] py-3">
        {getStatusBadge(document.status)}
      </TableCell>
      <TableCell className="w-[150px] table-glass-text py-3">
        {document.documentType.typeName}
      </TableCell>
      <TableCell className="w-[140px] table-glass-text py-3">
        {new Date(document.docDate).toLocaleDateString()}
      </TableCell>
      <TableCell className="w-[150px] py-3">
        <div className="flex items-center gap-2">
          <Avatar className="table-glass-avatar">
            <AvatarFallback className="table-glass-avatar-fallback">
              {document.createdBy.firstName[0]}
              {document.createdBy.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="table-glass-text-secondary">
            {document.createdBy.username}
          </span>
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
            <TooltipContent className="table-glass-tooltip">
              Document Actions
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </motion.tr>
  );
}
