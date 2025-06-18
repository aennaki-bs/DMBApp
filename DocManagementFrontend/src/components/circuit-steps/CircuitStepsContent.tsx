import { Button } from "@/components/ui/button";
import { StepTable } from "@/components/steps/StepTable";
import { StepEmptyState } from "@/components/steps/StepEmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MoreVertical,
  Edit,
  Trash,
  ArrowUpDown,
  CheckSquare,
  Plus,
  Settings,
  Workflow,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CircuitStepsContentProps {
  steps: Step[];
  selectedSteps: number[];
  onSelectStep: (id: number, checked: boolean) => void;
  onSelectAll: () => void;
  onEdit: (step: Step) => void;
  onDelete: (step: Step) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onAddStep: () => void;
  isSimpleUser: boolean;
  circuitId: string;
  circuit?: Circuit;
}

export const CircuitStepsContent = ({
  steps,
  selectedSteps,
  onSelectStep,
  onSelectAll,
  onEdit,
  onDelete,
  viewMode,
  onViewModeChange,
  onAddStep,
  isSimpleUser,
  circuitId,
  circuit,
}: CircuitStepsContentProps) => {
  const isCircuitActive = circuit?.isActive || false;

  // Check if all steps are selected
  const areAllSelected =
    steps.length > 0 && steps.every((step) => selectedSteps.includes(step.id));
  const areSomeSelected = selectedSteps.length > 0;

  if (steps.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm shadow-xl">
        <StepEmptyState
          onAddStep={onAddStep}
          showAddButton={!isSimpleUser && !isCircuitActive}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-sm shadow-xl overflow-hidden">
      {/* Modern Table */}
      <div className="overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-800/50 border-b border-slate-700/50">
            <TableRow className="hover:bg-transparent border-slate-700/50">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={areAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all steps"
                  className="border-slate-400/50"
                />
              </TableHead>
              <TableHead className="min-w-[120px] text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  Step Code
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[200px] text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  Title
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[150px] text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  Current Status
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[150px] text-slate-200 font-medium">
                <div className="flex items-center gap-2">
                  Next Status
                  <ArrowUpDown className="h-3 w-3 text-slate-400" />
                </div>
              </TableHead>
              <TableHead className="min-w-[120px] text-slate-200 font-medium text-center">
                <div className="flex items-center justify-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Approval
                </div>
              </TableHead>
              <TableHead className="w-[100px] text-slate-200 font-medium text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {steps.map((step, index) => {
              const isSelected = selectedSteps.includes(step.id);

              return (
                <TableRow
                  key={step.id}
                  className={cn(
                    "border-slate-700/30 hover:bg-slate-800/30 transition-colors group",
                    isSelected && "bg-blue-500/10 border-blue-500/20",
                    index % 2 === 0 ? "bg-slate-900/20" : "bg-slate-800/20"
                  )}
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        onSelectStep(step.id, !!checked)
                      }
                      aria-label={`Select step ${step.title}`}
                      className="border-slate-400/50"
                    />
                  </TableCell>

                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400/60"></div>
                      <span className="text-slate-300">{step.stepKey}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 bg-blue-500/20 border border-blue-500/30">
                        <AvatarFallback className="text-xs font-medium text-blue-300 bg-transparent">
                          {step.orderIndex + 1}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-200 truncate">
                          {step.title}
                        </div>
                        {step.descriptif && (
                          <div className="text-xs text-slate-400 truncate">
                            {step.descriptif}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-800/50 text-slate-300 border-slate-600"
                    >
                      {/* This would come from step status data */}
                      Devis vente
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">→</span>
                      <Badge
                        variant="outline"
                        className="bg-slate-800/50 text-slate-300 border-slate-600"
                      >
                        {step.orderIndex === 0
                          ? "Commande vente"
                          : "Document annulée"}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="bg-purple-500/10 text-purple-300 border-purple-500/30 px-2 py-1"
                            >
                              <CheckSquare className="h-3 w-3 mr-1" />
                              {step.orderIndex === 0 ? "sequential" : "aennaki"}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Approval configuration</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 bg-slate-800/95 border-slate-700/50 shadow-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(step)}
                          disabled={isCircuitActive}
                          className="text-slate-200 hover:bg-slate-700/50 focus:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Step
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-200 hover:bg-slate-700/50 focus:bg-slate-700/50">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure Approval
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700/50" />
                        <DropdownMenuItem
                          onClick={() => onDelete(step)}
                          disabled={isCircuitActive}
                          className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete Step
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Show circuit active warning if needed */}
      {isCircuitActive && areSomeSelected && (
        <div className="border-t border-slate-700/50 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-300 text-sm">
            <Workflow className="h-4 w-4" />
            Cannot modify steps in an active circuit
          </div>
        </div>
      )}
    </div>
  );
};
