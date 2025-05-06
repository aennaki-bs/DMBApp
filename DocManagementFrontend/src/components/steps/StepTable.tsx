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
import { StepTableHeader } from './table/StepTableHeader';
import { StepTableRow } from './table/StepTableRow';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface StepTableProps {
  steps: Step[];
  selectedSteps: number[];
  onSelectStep: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onDelete?: (step: Step) => void;
  onEdit?: (step: Step) => void;
  circuits?: Circuit[];
  onSort?: (field: string) => void;
  sortField?: string | null;
  sortDirection?: 'asc' | 'desc';
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterOptions?: StepFilterOptions;
  setFilterOptions?: (options: StepFilterOptions) => void;
  resetFilters?: () => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onReorderSteps?: (dragIndex: number, hoverIndex: number) => void;
  className?: string;
}

export function StepTable({
  steps,
  selectedSteps,
  onSelectStep,
  onSelectAll,
  onDelete,
  onEdit,
  circuits = [],
  onSort,
  sortField = null,
  sortDirection = 'asc',
  searchQuery = '',
  onSearchChange,
  filterOptions = {},
  setFilterOptions,
  resetFilters,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onReorderSteps,
  className,
}: StepTableProps) {
  // Check if all eligible steps are selected
  const areAllEligibleSelected = steps.length > 0 && steps.length === selectedSteps.length;
  const hasEligibleSteps = steps.length > 0;

  // Create circuit info map with title, key, and active status
  const circuitInfoMap = circuits.reduce((map, circuit) => {
    map[circuit.id] = {
      title: circuit.title,
      key: circuit.circuitKey,
      isActive: circuit.isActive
    };
    return map;
  }, {} as Record<number, { title: string; key: string; isActive: boolean }>);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={cn("w-full", className)}>
        <div className="border rounded-md border-blue-900/30">
          <Table>
            <StepTableHeader
              onSelectAll={onSelectAll}
              areAllEligibleSelected={areAllEligibleSelected}
              hasEligibleSteps={hasEligibleSteps}
              onSort={onSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
            <TableBody>
              {steps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="h-24 text-center text-muted-foreground">
                    No steps found
                  </td>
                </tr>
              ) : (
                steps.map((step, index) => {
                  const circuitInfo = circuitInfoMap[step.circuitId] || {
                    title: `Circuit #${step.circuitId}`,
                    key: '',
                    isActive: false
                  };
                  return (
                    <StepTableRow
                      key={step.id}
                      step={step}
                      isSelected={selectedSteps.includes(step.id)}
                      onSelectStep={onSelectStep}
                      onDeleteStep={onDelete}
                      onEditStep={onEdit}
                      circuitName={circuitInfo.title}
                      circuitKey={circuitInfo.key}
                      isCircuitActive={circuitInfo.isActive}
                      index={index}
                      onReorder={onReorderSteps}
                    />
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DndProvider>
  );
}
