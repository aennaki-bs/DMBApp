import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit2, Trash2, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { Step } from "@/models/step";

interface Circuit {
  id: number;
  title: string;
  circuitKey: string;
  isActive: boolean;
}

interface StepTableRowProps {
  step: Step;
  isSelected: boolean;
  onSelect: (stepId: number) => void;
  onEdit: (step: Step) => void;
  onDelete: (step: Step) => void;
  isCircuitActive?: boolean;
  isSimpleUser?: boolean;
  circuit?: Circuit;
}

export function StepTableRow({
  step,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  isCircuitActive = false,
  isSimpleUser = false,
  circuit,
}: StepTableRowProps) {
  // Get the correct ID field
  const stepId = step.id;

  const getStepTypeBadge = (step: Step) => {
    // Determine type based on step properties
    let type = "Normal";
    let badgeClass = "bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-500/30";

    if (step.orderIndex === 0) {
      type = "Initial";
      badgeClass = "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-500/30";
    }

    return (
      <Badge variant="secondary" className={`text-xs px-2 py-1 font-medium ${badgeClass}`}>
        {type}
      </Badge>
    );
  };

  return (
    <TableRow
      className={`border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all duration-200 ${isSelected ? "bg-blue-50/70 dark:bg-blue-950/20 border-blue-200/70 dark:border-blue-800/50" : ""
        }`}
    >
      <TableCell className="w-[48px] text-center">
        <div className="flex items-center justify-center py-2">
          <ProfessionalCheckbox
            checked={isSelected}
            onCheckedChange={() => {
              if (!isCircuitActive && !isSimpleUser) {
                onSelect(stepId);
              }
            }}
            size="md"
            variant="row"
            className="shadow-sm"
            disabled={isCircuitActive || isSimpleUser}
          />
        </div>
      </TableCell>

      <TableCell className="w-[60px]">
        <div className="flex items-center justify-center py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white border border-blue-300 dark:border-blue-900/50 flex items-center justify-center">
            <Settings className="h-3.5 w-3.5" />
          </div>
        </div>
      </TableCell>

      <TableCell className="w-[280px] px-3 py-3">
        <div className="font-medium text-blue-900 dark:text-blue-100 truncate">
          {step.title || step.stepKey || "Untitled Step"}
        </div>
      </TableCell>

      <TableCell className="flex-1 min-w-[200px] px-3 py-3">
        <span className="block truncate text-blue-800 dark:text-blue-200">
          {step.descriptif || "No description"}
        </span>
      </TableCell>

      <TableCell className="w-[120px] px-2 py-3">
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-900/20 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-500/30">
            {(step.orderIndex || 0) + 1}
          </Badge>
        </div>
      </TableCell>

      <TableCell className="w-[90px] px-2 py-3">
        <div className="flex items-center justify-center">
          <TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  disabled={isCircuitActive && !isSimpleUser}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[140px]">
                {!isCircuitActive && !isSimpleUser && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onEdit(step)}
                      className="cursor-pointer"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(step)}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {(isCircuitActive || isSimpleUser) && (
                  <DropdownMenuItem disabled>
                    <FileText className="mr-2 h-4 w-4" />
                    View Only
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
}
