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
        <Badge
          variant="secondary"
          className="bg-orange-500/20 text-orange-600 border-orange-500/30 hover:bg-orange-500/30 transition-colors"
        >
          {t("documents.statusDraft")}
        </Badge>
      );
    case 1:
      return (
        <Badge
          variant="secondary"
          className="bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30 transition-colors"
        >
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
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors duration-200"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/95 border-border/40 shadow-xl rounded-xl backdrop-blur-md"
      >
        <DropdownMenuLabel className="text-sm font-medium text-foreground">
          {t("common.actions")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/30" />

        <DropdownMenuItem
          onClick={() => navigate(`/documents/${document.id}`)}
          className="text-sm focus:bg-primary/10 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {t("common.view")}
        </DropdownMenuItem>

        {canManageDocuments && (
          <>
            <DropdownMenuItem
              onClick={() => navigate(`/documents/${document.id}/edit`)}
              className="text-sm focus:bg-primary/10 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              {t("common.edit")}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onAssignCircuit}
              disabled={isAssignedToCircuit}
              className="text-sm focus:bg-primary/10 hover:bg-primary/5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              {isAssignedToCircuit
                ? "Already Assigned"
                : t("documents.assignCircuit")}
              {isAssignedToCircuit && (
                <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border/30" />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-sm focus:bg-destructive/10 hover:bg-destructive/5 text-destructive rounded-lg transition-colors cursor-pointer"
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

  const handleRowClick = (event: React.MouseEvent) => {
    // Don't trigger row selection if clicking on action buttons or links
    const target = event.target as HTMLElement;
    const isActionElement = target.closest(
      'button, a, [role="button"], .dropdown-trigger'
    );

    if (!isActionElement && canManageDocuments) {
      onSelect();
    }
  };

  return (
    <TableRow
      className={`
        documents-table-layout transition-all duration-200 cursor-pointer select-none relative
        ${
          isSelected
            ? "bg-primary/10 border-primary/30 shadow-sm"
            : "hover:bg-muted/30"
        }
        border-b border-border/5
      `}
      onClick={handleRowClick}
      style={
        isSelected
          ? {
              borderLeft: "4px solid hsl(var(--primary))",
              background:
                "linear-gradient(90deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)",
            }
          : {}
      }
    >
      {/* Selection/Index Column */}
      <TableCell className="py-4 table-cell-center w-[50px]">
        {canManageDocuments ? (
          <Checkbox
            enhanced={true}
            size="sm"
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        ) : (
          <span className="text-sm text-muted-foreground font-medium">
            {index + 1}
          </span>
        )}
      </TableCell>

      {/* Document Code Column */}
      <TableCell className="py-4 table-cell-start w-[160px]">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex-shrink-0">
            <div
              className={`h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? "from-primary/30 to-primary/20 border-primary/40 shadow-sm"
                  : ""
              }`}
            >
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <Link
              to={`/documents/${document.id}`}
              className={`text-sm font-medium truncate transition-colors duration-200 hover:text-primary ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {document.documentKey}
            </Link>
            <div className="text-xs text-muted-foreground truncate">
              ID: {document.id}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Title Column */}
      <TableCell className="py-4 table-cell-start w-[250px]">
        <Link
          to={`/documents/${document.id}`}
          className={`text-sm font-medium truncate transition-colors duration-200 hover:text-primary ${
            isSelected ? "text-primary" : "text-foreground"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {document.title}
        </Link>
      </TableCell>

      {/* Status Column */}
      <TableCell className="py-4 table-cell-center w-[120px]">
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 transition-colors duration-200 ${
            document.status === 0
              ? isSelected
                ? "bg-orange-500/30 text-orange-400 border-orange-500/40"
                : "bg-orange-500/20 text-orange-600 border-orange-500/30"
              : document.status === 1
              ? isSelected
                ? "bg-green-500/30 text-green-400 border-green-500/40"
                : "bg-green-500/20 text-green-600 border-green-500/30"
              : "bg-muted/50 text-muted-foreground border-muted/30"
          }`}
        >
          {document.status === 0
            ? "Draft"
            : document.status === 1
            ? "In Progress"
            : "Unknown"}
        </Badge>
      </TableCell>

      {/* Type Column */}
      <TableCell className="py-4 table-cell-start w-[150px]">
        <div
          className={`text-sm truncate transition-colors duration-200 ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {document.documentType.typeName}
        </div>
      </TableCell>

      {/* Date Column */}
      <TableCell className="py-4 table-cell-center w-[140px]">
        <div
          className={`text-sm transition-colors duration-200 ${
            isSelected ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {new Date(document.docDate).toLocaleDateString()}
        </div>
      </TableCell>

      {/* Created By Column */}
      <TableCell className="py-4 table-cell-start w-[150px]">
        <div className="flex items-center gap-2">
          <Avatar
            className={`h-8 w-8 border-2 transition-all duration-200 ${
              isSelected ? "border-primary/40 shadow-sm" : "border-border/30"
            }`}
          >
            <AvatarFallback
              className={`text-xs font-medium transition-colors duration-200 ${
                isSelected
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              {document.createdBy.firstName[0]}
              {document.createdBy.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span
            className={`text-sm truncate transition-colors duration-200 ${
              isSelected ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {document.createdBy.username}
          </span>
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell
        className="py-4 table-cell-center w-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
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
            <TooltipContent className="bg-background/95 border-border/40 shadow-xl rounded-lg backdrop-blur-md">
              Document Actions
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}
