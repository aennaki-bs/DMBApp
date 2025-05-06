import { Link } from "react-router-dom";
import { Document } from "@/models/document";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash, GitBranch, CheckCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentsTableRowProps {
  document: Document;
  index: number;
  isSelected: boolean;
  canManageDocuments: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAssignCircuit: () => void;
}

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
      key={document.id}
      className={`border-blue-900/30 hover:bg-blue-900/20 transition-all ${
        isSelected ? "bg-blue-900/30 border-l-4 border-l-blue-500" : ""
      }`}
    >
      <TableCell>
        {canManageDocuments ? (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="border-blue-500/50"
          />
        ) : (
          <span className="text-sm text-gray-500">{index + 1}</span>
        )}
      </TableCell>
      <TableCell className="font-mono text-sm">
        <Link
          to={`/documents/${document.id}`}
          className="text-blue-300 hover:text-blue-200 hover:underline"
        >
          {document.documentKey}
        </Link>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link
            to={`/documents/${document.id}`}
            className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
          >
            {document.title}
          </Link>
          {getStatusBadge(document.status)}
        </div>
      </TableCell>
      <TableCell className="text-blue-100">
        {document.documentType.typeName}
      </TableCell>
      <TableCell className="text-blue-100/70 text-sm">
        {new Date(document.docDate).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-blue-800 text-xs">
              {document.createdBy.firstName[0]}
              {document.createdBy.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-blue-100/80">
            {document.createdBy.username}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-1">
          {canManageDocuments ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isAssignedToCircuit ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 text-green-400 cursor-not-allowed opacity-80"
                      disabled
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                      onClick={onAssignCircuit}
                    >
                      <GitBranch className="h-4 w-4" />
                    </Button>
                  )}
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                  <p>
                    {isAssignedToCircuit
                      ? "Document is already assigned to a circuit"
                      : "Assign to circuit"}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                    asChild
                  >
                    <Link to={`/documents/${document.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                  <p>Edit document</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                    onClick={onDelete}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                  <p>Delete document</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-not-allowed opacity-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                  <p>Only Admin or FullUser can edit documents</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function getStatusBadge(status: number) {
  switch (status) {
    case 0:
      return (
        <Badge className="bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border-amber-500/30">
          Draft
        </Badge>
      );
    case 1:
      return (
        <Badge className="bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/30">
          In progress
        </Badge>
      );
    case 2:
      return (
        <Badge className="bg-red-600/20 text-red-500 hover:bg-red-600/30 border-red-500/30">
          Completed
        </Badge>
      );
    case 3:
      return (
        <Badge className="bg-red-600/20 text-red-500 hover:bg-red-600/30 border-red-500/30">
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}
