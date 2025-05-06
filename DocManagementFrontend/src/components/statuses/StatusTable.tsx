import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2, AlertCircle } from "lucide-react";
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

export interface StatusTableProps {
  statuses: DocumentStatus[];
  onEdit: (status: DocumentStatus) => void;
  onDelete: (status: DocumentStatus) => void;
  onActivate?: (status: DocumentStatus) => void;
  onDeactivate?: (status: DocumentStatus) => void;
  className?: string;
  isCircuitActive?: boolean;
}

export function StatusTable({
  statuses,
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
  className,
  isCircuitActive,
}: StatusTableProps) {
  return (
    <Table className={cn("", className)}>
      <TableHeader>
        <TableRow>
          <TableHead>Status ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Required</TableHead>
          <TableHead>Complete</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {statuses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
              No statuses found for this step
            </TableCell>
          </TableRow>
        ) : (
          statuses.map((status) => (
            <TableRow key={status.statusId}>
              <TableCell className="font-mono text-xs text-gray-400">
                {status.statusKey}
              </TableCell>
              <TableCell>{status.title}</TableCell>
              <TableCell>
                {status.isRequired ? (
                  <Badge variant="outline" className="bg-amber-900/30 text-amber-400 border-amber-700/30">
                    Required
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-400 border-gray-700">
                    Optional
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {status.isComplete ? (
                  <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-700/30">
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-700/30">
                    Incomplete
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
  );
}
