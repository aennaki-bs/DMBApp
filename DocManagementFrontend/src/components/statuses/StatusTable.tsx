import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
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
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";

export interface StatusTableProps {
  statuses: DocumentStatus[];
  onEdit: (status: DocumentStatus) => void;
  onDelete: (status: DocumentStatus) => void;
  onActivate?: (status: DocumentStatus) => void;
  onDeactivate?: (status: DocumentStatus) => void;
  className?: string;
  isCircuitActive?: boolean;
  selectedStatusIds?: number[];
  onSelectStatus?: (statusId: number, isSelected: boolean) => void;
  onSelectAll?: (isSelected: boolean) => void;
}

export function StatusTable({
  statuses,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  className,
  isCircuitActive,
  selectedStatusIds = [],
  onSelectStatus,
  onSelectAll,
}: StatusTableProps) {
  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedStatuses,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: statuses,
    initialPageSize: 25,
  });

  if (statuses.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/20 flex items-center justify-center">
            <Pencil className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">No statuses found</p>
          <p className="text-sm text-muted-foreground">
            {statuses.length === 0 ? "No statuses have been created yet." : "No statuses match your current filters."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header - Never Scrolls */}
      <div className="flex-shrink-0 overflow-x-auto border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm">
        <div className="min-w-[700px]">
          <Table className={cn("table-fixed w-full", className)}>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-primary/10">
                {onSelectStatus && onSelectAll && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        paginatedStatuses.length > 0 &&
                        selectedStatusIds.filter((id) =>
                          paginatedStatuses.some((s) => s.statusId === id)
                        ).length === paginatedStatuses.length
                      }
                      onCheckedChange={(checked) => {
                        onSelectAll(!!checked);
                      }}
                      aria-label="Select all"
                      className="translate-y-[2px]"
                    />
                  </TableHead>
                )}
                <TableHead className="w-[300px] text-foreground font-medium">
                  <div className="flex items-center">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead className="w-[250px] text-foreground font-medium">
                  Type
                </TableHead>
                <TableHead className="w-[100px] text-right text-foreground font-medium">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>

      {/* Scrollable Body - Only Content Scrolls - FILL REMAINING HEIGHT */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="min-w-[700px]">
          <Table className={cn("table-fixed w-full", className)}>
            <TableBody>
              {paginatedStatuses.map((status) => (
                <TableRow
                  key={status.statusId}
                  className={cn(
                    "border-primary/10 hover:bg-primary/5 transition-colors duration-200",
                    selectedStatusIds.includes(status.statusId) &&
                    "bg-primary/10 border-primary/20"
                  )}
                >
                  {onSelectStatus && (
                    <TableCell className="w-[50px]">
                      <Checkbox
                        checked={selectedStatusIds.includes(
                          status.statusId
                        )}
                        onCheckedChange={(checked) => {
                          onSelectStatus(status.statusId, !!checked);
                        }}
                        aria-label={`Select status ${status.title}`}
                        className="translate-y-[2px]"
                      />
                    </TableCell>
                  )}
                  <TableCell className="w-[300px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {status.title}
                      </span>
                      {status.description && (
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {status.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="w-[250px]">
                    <div className="flex flex-wrap gap-1">
                      {status.isInitial && (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-400 border-blue-500/20"
                        >
                          Initial
                        </Badge>
                      )}
                      {status.isFinal && (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-400 border-purple-500/20"
                        >
                          Final
                        </Badge>
                      )}
                      {status.isFlexible && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-400 border-amber-500/20"
                        >
                          Flexible
                        </Badge>
                      )}
                      {!status.isInitial &&
                        !status.isFinal &&
                        !status.isFlexible && (
                          <Badge
                            variant="outline"
                            className="bg-muted/20 text-muted-foreground border-border"
                          >
                            Normal
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="w-[100px] text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isCircuitActive ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Cannot edit status in active circuit</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                          onClick={() => onEdit(status)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      {isCircuitActive ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-not-allowed opacity-50"
                                disabled
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Cannot delete status in active circuit
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                          onClick={() => onDelete(status)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 border-t border-primary/10 bg-background/50 backdrop-blur-sm p-4">
          <SmartPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
