import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Tag,
  Activity,
  CalendarDays,
  User,
  MoreHorizontal,
  Eye,
  Edit,
  GitBranch,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DocumentTableRowProps {
  document: any;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: (document: any) => void;
  onDelete: () => void;
  onAssignCircuit: (document: any) => void;
  isSimpleUser: boolean;
}

export function DocumentTableRow({
  document,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onAssignCircuit,
  isSimpleUser,
}: DocumentTableRowProps) {
  const handleRowClick = () => {
    onSelect(!isSelected);
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect(checked);
  };

  const getStatusBadge = (status: number) => {
    if (status === 2) {
      return (
        <Badge
          variant="secondary"
          className={`text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200 ${
            isSelected
              ? "bg-green-500/30 text-green-400 border-green-500/40"
              : "bg-green-500/20 text-green-400 border-green-500/30"
          }`}
        >
          Completed
        </Badge>
      );
    } else if (status === 1) {
      return (
        <Badge
          variant="secondary"
          className={`text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200 ${
            isSelected
              ? "bg-blue-500/30 text-blue-400 border-blue-500/40"
              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
          }`}
        >
          In Progress
        </Badge>
      );
    } else if (status === 0) {
      return (
        <Badge
          variant="secondary"
          className={`text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200 ${
            isSelected
              ? "bg-amber-500/30 text-amber-400 border-amber-500/40"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          }`}
        >
          Draft
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="secondary"
          className={`text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200 ${
            isSelected
              ? "bg-gray-500/30 text-gray-400 border-gray-500/40"
              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
          }`}
        >
          Unknown
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCreatorInitials = (user: any) => {
    if (!user) return "??";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <TableRow
      className={`documents-table-layout transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? "bg-primary/10 border-primary/30 shadow-sm"
          : "hover:bg-muted/30"
      }`}
      onClick={handleRowClick}
    >
      {/* Selection Column */}
      <TableCell className="py-3 table-cell-center">
        <Checkbox
          enhanced={true}
          size="sm"
          checked={isSelected}
          onCheckedChange={handleSelectChange}
          className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
        />
      </TableCell>

      {/* Document Code Column */}
      <TableCell className="py-3 table-cell-start">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex-shrink-0">
            <div
              className={`h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? "from-primary/30 to-primary/20 border-primary/40 shadow-sm"
                  : ""
              }`}
            >
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`text-sm font-medium truncate transition-colors duration-200 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {document.documentKey}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              ID: {document.id}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Title Column */}
      <TableCell className="py-3 table-cell-start max-md:hidden">
        <div className="min-w-0">
          <div
            className={`text-sm font-medium truncate transition-colors duration-200 ${
              isSelected ? "text-primary" : "text-foreground"
            }`}
          >
            {document.title}
          </div>
        </div>
      </TableCell>

      {/* Status Column */}
      <TableCell className="py-3 table-cell-center">
        <div className="flex items-center justify-center">
          {getStatusBadge(document.status)}
        </div>
      </TableCell>

      {/* Type Column */}
      <TableCell className="py-3 table-cell-center max-md:hidden">
        <div className="flex items-center justify-center">
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-1 transition-colors duration-200 ${
              isSelected
                ? "bg-purple-500/30 text-purple-400 border-purple-500/40"
                : "bg-purple-500/20 text-purple-400 border-purple-500/30"
            }`}
          >
            <FileText className="h-3 w-3 mr-1" />
            {document.documentType?.typeName || "Document"}
          </Badge>
        </div>
      </TableCell>

      {/* Date Column */}
      <TableCell className="py-3 table-cell-center max-md:hidden">
        <div className="text-sm text-muted-foreground">
          {new Date(
            document.docDate || document.createdAt
          ).toLocaleDateString()}
        </div>
      </TableCell>

      {/* Creator Column */}
      <TableCell className="py-3 table-cell-center">
        <div className="text-sm text-muted-foreground truncate">
          {document.createdBy?.firstName ||
            document.createdBy?.username ||
            "Unknown"}
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="py-3 table-cell-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity duration-200 hover:bg-muted/50"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {!isSimpleUser && (
              <>
                <DropdownMenuItem onClick={() => onEdit(document)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssignCircuit(document)}>
                  <GitBranch className="mr-2 h-4 w-4" />
                  Assign Circuit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
