import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
  ArrowUpDown,
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
  // Sort functions would go here in a real implementation

  return (
    <div className="rounded-xl border border-blue-900/30 overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 shadow-lg">
      <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
        <div className="min-w-[700px]">
          <Table className={cn("", className)}>
            <TableHeader className="bg-blue-900/20">
              <TableRow className="hover:bg-transparent border-blue-900/30">
                {onSelectStatus && onSelectAll && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        statuses.length > 0 &&
                        selectedStatusIds.length === statuses.length
                      }
                      onCheckedChange={(checked) => {
                        onSelectAll(!!checked);
                      }}
                      aria-label="Select all"
                      className="translate-y-[2px]"
                    />
                  </TableHead>
                )}
                <TableHead className="w-[150px]">
                  <div className="flex items-center">
                    Status ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statuses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={onSelectStatus ? 5 : 4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No statuses found
                  </TableCell>
                </TableRow>
              ) : (
                statuses.map((status) => (
                  <TableRow
                    key={status.statusId}
                    className={cn(
                      "border-blue-900/20 hover:bg-blue-900/20",
                      selectedStatusIds.includes(status.statusId) &&
                        "bg-blue-900/30"
                    )}
                  >
                    {onSelectStatus && (
                      <TableCell>
                        <Checkbox
                          checked={selectedStatusIds.includes(status.statusId)}
                          onCheckedChange={(checked) => {
                            onSelectStatus(status.statusId, !!checked);
                          }}
                          aria-label={`Select status ${status.title}`}
                          className="translate-y-[2px]"
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-xs text-blue-300">
                      {status.statusKey}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-blue-100">
                          {status.title}
                        </span>
                        {status.description && (
                          <span className="text-xs text-blue-400 line-clamp-1">
                            {status.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {status.isInitial && (
                          <Badge
                            variant="outline"
                            className="bg-blue-900/30 text-blue-400 border-blue-700/30"
                          >
                            Initial
                          </Badge>
                        )}
                        {status.isFinal && (
                          <Badge
                            variant="outline"
                            className="bg-purple-900/30 text-purple-400 border-purple-700/30"
                          >
                            Final
                          </Badge>
                        )}
                        {status.isFlexible && (
                          <Badge
                            variant="outline"
                            className="bg-amber-900/30 text-amber-400 border-amber-700/30"
                          >
                            Flexible
                          </Badge>
                        )}
                        {!status.isInitial &&
                          !status.isFinal &&
                          !status.isFlexible && (
                            <Badge
                              variant="outline"
                              className="text-gray-400 border-gray-700"
                            >
                              Normal
                            </Badge>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#1e2a4a] border border-blue-900/40"
                        >
                          {isCircuitActive ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative flex cursor-not-allowed items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                    <AlertCircle className="ml-2 h-3 w-3" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cannot edit status in active circuit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <DropdownMenuItem onClick={() => onEdit(status)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                          )}

                          {isCircuitActive ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="relative flex cursor-not-allowed items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                    <AlertCircle className="ml-2 h-3 w-3" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cannot delete status in active circuit</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => onDelete(status)}
                              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  );
}
