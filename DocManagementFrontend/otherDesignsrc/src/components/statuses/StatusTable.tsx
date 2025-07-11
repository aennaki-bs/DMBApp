import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Edit,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DocumentStatus } from "@/models/documentCircuit";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface StatusTableProps {
  statuses: DocumentStatus[];
  selectedStatuses: number[];
  onSelectAll: () => void;
  onSelectStatus: (statusId: number, isSelected: boolean) => void;
  onEdit: (status: DocumentStatus) => void;
  onDelete: (status: DocumentStatus) => void;
  isLoading?: boolean;
  isError?: boolean;
  isSimpleUser?: boolean;
  circuitIsActive?: boolean;
  sortBy?: string;
  sortDirection?: string;
  onSort?: (field: string) => void;
}

function StatusTableEmpty({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full table-glass-empty-icon flex items-center justify-center mb-4">
        <Eye className="h-8 w-8" />
      </div>
      <h3 className="table-glass-empty-title mb-2">No statuses found</h3>
      <p className="table-glass-empty-text mb-4">
        Try adjusting your search or filter criteria.
      </p>
      {onClearFilters && (
        <Button variant="outline" onClick={onClearFilters} size="sm">
          Clear filters
        </Button>
      )}
    </div>
  );
}

function StatusTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
  sortBy,
  sortDirection,
  onSort,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortBy?: string;
  sortDirection?: string;
  onSort?: (field: string) => void;
}) {
  const renderSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const headerClass = (field: string) => `
    cursor-pointer hover:bg-primary/10 transition-colors duration-200 
    text-left font-semibold text-primary/90 hover:text-primary
    ${sortBy === field ? "bg-primary/5" : ""}
  `;

  const isAllSelected = totalCount > 0 && selectedCount === totalCount;

  return (
    <TableHeader className="bg-muted/20 backdrop-blur-sm">
      <TableRow className="table-glass-header-row">
        <TableHead className="w-[40px]">
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
          </div>
        </TableHead>

        <TableHead
          className={`w-[200px] ${headerClass("statusKey")}`}
          onClick={() => onSort?.("statusKey")}
        >
          <div className="flex items-center gap-2">
            Status Code
            {renderSortIcon("statusKey")}
          </div>
        </TableHead>

        <TableHead
          className={`w-[300px] ${headerClass("title")}`}
          onClick={() => onSort?.("title")}
        >
          <div className="flex items-center gap-2">
            Title
            {renderSortIcon("title")}
          </div>
        </TableHead>

        <TableHead
          className={`w-[200px] ${headerClass("type")}`}
          onClick={() => onSort?.("type")}
        >
          <div className="flex items-center gap-2">
            Type
            {renderSortIcon("type")}
          </div>
        </TableHead>

        <TableHead className="w-[120px] text-right pr-3">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}

function StatusTableBody({
  statuses,
  selectedStatuses,
  onSelectStatus,
  onEdit,
  onDelete,
  isSimpleUser,
  circuitIsActive,
}: {
  statuses: DocumentStatus[];
  selectedStatuses: number[];
  onSelectStatus: (statusId: number, isSelected: boolean) => void;
  onEdit: (status: DocumentStatus) => void;
  onDelete: (status: DocumentStatus) => void;
  isSimpleUser?: boolean;
  circuitIsActive?: boolean;
}) {
  const getStatusInitials = (status: DocumentStatus) => {
    return status.statusKey?.substring(0, 2).toUpperCase() || "ST";
  };

  const getTypeColor = (status: DocumentStatus) => {
    if (status.isInitial)
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (status.isFinal)
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (status.isFlexible)
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusType = (status: DocumentStatus) => {
    if (status.isInitial) return "Initial";
    if (status.isFinal) return "Final";
    if (status.isFlexible) return "Flexible";
    return "Normal";
  };

  return (
    <TableBody>
      {statuses.map((status) => (
        <TableRow key={status.statusId} className="table-glass-row h-12">
          <TableCell className="w-[40px]">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedStatuses.includes(status.statusId)}
                onCheckedChange={(checked) =>
                  onSelectStatus(status.statusId, checked as boolean)
                }
                className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
            </div>
          </TableCell>

          <TableCell className="w-[200px]">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                <AvatarFallback className="text-xs font-medium text-primary bg-transparent">
                  {getStatusInitials(status)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="font-medium text-foreground truncate">
                  {status.statusKey}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Status Code
                </div>
              </div>
            </div>
          </TableCell>

          <TableCell className="w-[300px]">
            <div className="flex flex-col min-w-0">
              <div className="font-medium text-foreground truncate">
                {status.title || "No title"}
              </div>
              {status.description && (
                <div className="text-xs text-muted-foreground truncate">
                  {status.description}
                </div>
              )}
            </div>
          </TableCell>

          <TableCell className="w-[200px]">
            <Badge
              variant="outline"
              className={`text-xs font-medium border ${getTypeColor(status)}`}
            >
              {getStatusType(status)}
            </Badge>
          </TableCell>

          <TableCell className="w-[120px] text-right pr-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!isSimpleUser && !circuitIsActive && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(status)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(status)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {(isSimpleUser || circuitIsActive) && (
                  <DropdownMenuItem disabled>
                    <Eye className="h-4 w-4 mr-2" />
                    View Only
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}

export function StatusTable({
  statuses,
  selectedStatuses,
  onSelectAll,
  onSelectStatus,
  onEdit,
  onDelete,
  isLoading = false,
  isError = false,
  isSimpleUser = false,
  circuitIsActive = false,
  sortBy,
  sortDirection,
  onSort,
}: StatusTableProps) {
  // Check if we have statuses to display
  const hasStatuses = statuses && statuses.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-loading shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin table-glass-loading-spinner" />
              <p className="table-glass-loading-text">Loading statuses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl table-glass-error shadow-lg">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 rounded-full table-glass-error-icon flex items-center justify-center">
                <span className="font-bold">!</span>
              </div>
              <p className="table-glass-error-text">
                Failed to load statuses. Please try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3" style={{ minHeight: "100%" }}>
      <div className="flex-1 relative overflow-hidden rounded-2xl table-glass-container min-h-0">
        {hasStatuses ? (
          <div className="relative h-full flex flex-col z-10">
            {/* Fixed Header - Never Scrolls */}
            <div className="flex-shrink-0 overflow-x-auto table-glass-header">
              <div className="min-w-[862px]">
                <Table className="table-fixed w-full">
                  <StatusTableHeader
                    selectedCount={
                      selectedStatuses.filter((id) =>
                        statuses.some((status) => status.statusId === id)
                      ).length
                    }
                    totalCount={statuses.length}
                    onSelectAll={onSelectAll}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </Table>
              </div>
            </div>

            {/* Scrollable Body - Only Content Scrolls */}
            <div
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(100vh - 280px)" }}
            >
              <ScrollArea className="h-full w-full">
                <div className="min-w-[862px] pb-2">
                  <Table className="table-fixed w-full">
                    <StatusTableBody
                      statuses={statuses}
                      selectedStatuses={selectedStatuses}
                      onSelectStatus={onSelectStatus}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isSimpleUser={isSimpleUser}
                      circuitIsActive={circuitIsActive}
                    />
                  </Table>
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="relative h-full flex items-center justify-center z-10">
            <StatusTableEmpty />
          </div>
        )}
      </div>
    </div>
  );
}
