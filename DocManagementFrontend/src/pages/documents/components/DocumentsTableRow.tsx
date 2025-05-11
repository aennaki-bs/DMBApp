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
  const navigate = useNavigate();
  const isAssignedToCircuit = !!document.circuitId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="bg-[#0d1117] border-gray-800 text-white"
      >
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem
          className="hover:bg-blue-900/20"
          onClick={() => navigate(`/documents/${document.id}`)}
        >
          <ExternalLink className="mr-2 h-4 w-4 text-blue-400" />
          View Document
        </DropdownMenuItem>

        {canManageDocuments && (
          <>
            {/* Show Document Flow if assigned to circuit */}
            {isAssignedToCircuit && (
              <DropdownMenuItem
                className="hover:bg-blue-900/20"
                onClick={() => navigate(`/documents/${document.id}/flow`)}
              >
                <GitBranch className="mr-2 h-4 w-4 text-blue-400" />
                Document Flow
              </DropdownMenuItem>
            )}

            {/* Show Assign to Circuit if not assigned */}
            {!isAssignedToCircuit && (
              <DropdownMenuItem
                className="hover:bg-blue-900/20"
                onClick={onAssignCircuit}
              >
                <GitBranch className="mr-2 h-4 w-4 text-blue-400" />
                Assign to Circuit
              </DropdownMenuItem>
            )}

            <DropdownMenuItem className="hover:bg-blue-900/20" asChild>
              <Link to={`/documents/${document.id}/edit`}>
                <Edit className="mr-2 h-4 w-4 text-blue-400" />
                Edit
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-700" />

            <DropdownMenuItem
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
              onClick={onDelete}
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}

        {!canManageDocuments && (
          <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed">
            <Edit className="mr-2 h-4 w-4" />
            Requires permissions
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
        <DocumentActionsDropdown
          document={document}
          canManageDocuments={canManageDocuments}
          onDelete={onDelete}
          onAssignCircuit={onAssignCircuit}
        />
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
