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
  CheckCircle,
  Clock,
  FileEdit,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme.mode === "dark";

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't trigger row selection when clicking on buttons or links
    if (
      (e.target as HTMLElement).closest("button") ||
      (e.target as HTMLElement).closest("a")
    ) {
      return;
    }
    onSelect(!isSelected);
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect(checked);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 2: // Completed
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200",
              isDark
                ? "bg-green-950/60 text-green-300 border-green-800/60"
                : "bg-green-50 text-green-700 border-green-200/80",
              isSelected &&
                (isDark
                  ? "bg-green-900/60 border-green-700/60"
                  : "bg-green-100 border-green-300/80")
            )}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 1: // In Progress
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200",
              isDark
                ? "bg-blue-950/60 text-blue-300 border-blue-800/60"
                : "bg-blue-50 text-blue-700 border-blue-200/80",
              isSelected &&
                (isDark
                  ? "bg-blue-900/60 border-blue-700/60"
                  : "bg-blue-100 border-blue-300/80")
            )}
          >
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case 0: // Draft
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200",
              isDark
                ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                : "bg-amber-50 text-amber-700 border-amber-200/80",
              isSelected &&
                (isDark
                  ? "bg-amber-900/60 border-amber-700/60"
                  : "bg-amber-100 border-amber-300/80")
            )}
          >
            <FileEdit className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200",
              isDark
                ? "bg-gray-800/60 text-gray-300 border-gray-700/60"
                : "bg-gray-100 text-gray-700 border-gray-200/80"
            )}
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
      className={cn(
        "documents-table-layout transition-all duration-200 cursor-pointer select-none border-border/30",
        isSelected
          ? isDark
            ? "bg-primary/10 border-primary/30"
            : "bg-primary/5 border-primary/20"
          : "hover:bg-accent/10"
      )}
      onClick={handleRowClick}
    >
      {/* Selection Column */}
      <TableCell className="py-3 table-cell-center">
        <div className="flex items-center justify-center">
          <Checkbox
            enhanced={true}
            size="sm"
            checked={isSelected}
            onCheckedChange={handleSelectChange}
            className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </TableCell>

      {/* Document Code Column */}
      <TableCell className="py-3 table-cell-start">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex-shrink-0">
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200",
                isDark
                  ? "bg-background/80 border border-border/60"
                  : "bg-background border border-border/40",
                isSelected &&
                  (isDark
                    ? "bg-primary/10 border-primary/30"
                    : "bg-primary/5 border-primary/20")
              )}
            >
              <FileText
                className={cn(
                  "h-4 w-4",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={cn(
                "text-sm font-medium truncate transition-colors duration-200",
                isSelected ? "text-primary" : "text-foreground"
              )}
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
            className={cn(
              "text-sm font-medium truncate transition-colors duration-200",
              isSelected ? "text-primary" : "text-foreground"
            )}
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
            variant="outline"
            className={cn(
              "text-xs inline-flex items-center gap-1 px-2.5 py-1 transition-all duration-200",
              isDark
                ? "bg-purple-950/60 text-purple-300 border-purple-800/60"
                : "bg-purple-50 text-purple-700 border-purple-200/80",
              isSelected &&
                (isDark
                  ? "bg-purple-900/60 border-purple-700/60"
                  : "bg-purple-100 border-purple-300/80")
            )}
          >
            <FileText className="h-3 w-3 mr-1" />
            {document.documentType?.typeName || "Document"}
          </Badge>
        </div>
      </TableCell>

      {/* Date Column */}
      <TableCell className="py-3 table-cell-center max-md:hidden">
        <div
          className={cn(
            "text-sm transition-colors duration-200",
            isSelected ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {new Date(
            document.docDate || document.createdAt
          ).toLocaleDateString()}
        </div>
      </TableCell>

      {/* Creator Column */}
      <TableCell className="py-3 table-cell-center">
        <div className="flex items-center justify-center">
          <Avatar className="h-7 w-7">
            {document.createdBy?.profileImage ? (
              <AvatarImage src={document.createdBy.profileImage} />
            ) : null}
            <AvatarFallback
              className={cn(
                "text-xs font-medium",
                isSelected
                  ? "bg-primary/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {getCreatorInitials(document.createdBy)}
            </AvatarFallback>
          </Avatar>
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="py-3 table-cell-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 transition-all duration-200",
                isSelected
                  ? "text-primary hover:text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link
                to={`/documents/${document.id}`}
                className="flex items-center cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>

            {!isSimpleUser && (
              <>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(document);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignCircuit(document);
                  }}
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Assign Circuit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
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
