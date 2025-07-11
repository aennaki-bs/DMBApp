import { useParams } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import stepService from "@/services/stepService";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Plus,
  AlertCircle,
  Filter,
  X,
  RefreshCw,
  Workflow,
  CheckSquare,
  Search,
  SlidersHorizontal,
  Settings,
  Edit,
  Trash,
  MoreVertical,
  ArrowUpDown,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StepFormDialog } from "@/components/steps/dialogs/StepFormDialog";
import { DeleteStepDialog } from "@/components/steps/dialogs/DeleteStepDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { PageLayout } from "@/components/layout/PageLayout";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import SmartPagination from "@/components/shared/SmartPagination";
import { usePagination } from "@/hooks/usePagination";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Step } from "@/models/step";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// Search field options
const DEFAULT_STEP_SEARCH_FIELDS = [
  { id: "all", label: "All Fields" },
  { id: "stepKey", label: "Step Key" },
  { id: "title", label: "Title" },
  { id: "descriptif", label: "Description" },
];

// Step type options
const STEP_TYPE_OPTIONS = [
  { id: "any", label: "Any Type", value: "any" },
  { id: "normal", label: "Normal", value: "normal" },
  { id: "final", label: "Final Step", value: "final" },
];

export default function CircuitStepsPage() {
  const { circuitId } = useParams<{ circuitId: string }>();
  const { user } = useAuth();
  const isSimpleUser = user?.role === "SimpleUser";
  const queryClient = useQueryClient();

  // State management
  const [apiError, setApiError] = useState("");
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [selectedSteps, setSelectedSteps] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [stepTypeFilter, setStepTypeFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Fetch circuit details
  const {
    data: circuit,
    isLoading: isCircuitLoading,
    isError: isCircuitError,
    refetch: refetchCircuit,
  } = useQuery({
    queryKey: ["circuit", circuitId],
    queryFn: () => circuitService.getCircuitById(Number(circuitId)),
    enabled: !!circuitId,
  });

  // Fetch steps for the circuit
  const {
    data: steps = [],
    isLoading: isStepsLoading,
    isError: isStepsError,
    refetch: refetchSteps,
  } = useQuery({
    queryKey: ["circuit-steps", circuitId],
    queryFn: () => stepService.getStepsByCircuitId(Number(circuitId)),
    enabled: !!circuitId,
  });

  // Filter and search steps
  const filteredSteps = steps.filter((step: Step) => {
    // Apply search filter
    const matchesSearch =
      !searchQuery ||
      (() => {
        const query = searchQuery.toLowerCase();
        switch (searchField) {
          case "stepKey":
            return step.stepKey?.toLowerCase().includes(query);
          case "title":
            return step.title?.toLowerCase().includes(query);
          case "descriptif":
            return step.descriptif?.toLowerCase().includes(query);
          case "all":
          default:
            return (
              step.stepKey?.toLowerCase().includes(query) ||
              step.title?.toLowerCase().includes(query) ||
              step.descriptif?.toLowerCase().includes(query)
            );
        }
      })();

    // Apply step type filter
    let matchesType = true;
    if (stepTypeFilter !== "any") {
      switch (stepTypeFilter) {
        case "final":
          matchesType = step.isFinalStep === true;
          break;
        case "normal":
          matchesType = step.isFinalStep === false;
          break;
      }
    }

    return matchesSearch && matchesType;
  });

  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedSteps,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: filteredSteps || [],
    initialPageSize: 15,
  });

  // Handler to refresh all data after changes
  const handleRefreshData = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["circuit", circuitId] });
      await queryClient.invalidateQueries({
        queryKey: ["circuit-steps", circuitId],
      });
      await refetchCircuit();
      await refetchSteps();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
  };

  // Handler logic for add/edit/delete
  const handleAddStep = () => {
    if (circuit?.isActive) {
      toast.error("Cannot add steps to an active circuit");
      return;
    }
    setSelectedStep(null);
    setFormDialogOpen(true);
  };

  const handleEditStep = (step: Step) => {
    if (circuit?.isActive) {
      toast.error("Cannot edit steps in an active circuit");
      return;
    }
    setSelectedStep(step);
    setFormDialogOpen(true);
  };

  const handleDeleteStep = (step: Step) => {
    if (circuit?.isActive) {
      toast.error("Cannot delete steps from an active circuit");
      return;
    }
    setSelectedStep(step);
    setDeleteDialogOpen(true);
  };

  const handleOperationSuccess = () => {
    setFormDialogOpen(false);
    setDeleteDialogOpen(false);
    handleRefreshData();
  };

  const handleSelectStep = (stepId: number, isSelected: boolean) => {
    setSelectedSteps((prev) =>
      isSelected ? [...prev, stepId] : prev.filter((id) => id !== stepId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSteps(paginatedSteps.map((step) => step.id));
    } else {
      setSelectedSteps([]);
    }
  };

  const handleBulkDelete = async () => {
    if (circuit?.isActive) {
      toast.error("Cannot delete steps from an active circuit");
      return;
    }
    if (selectedSteps.length === 0) {
      toast.error("No steps selected");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    try {
      for (const stepId of selectedSteps) {
        await stepService.deleteStep(stepId);
      }
      setSelectedSteps([]);
      setBulkDeleteDialogOpen(false);
      handleRefreshData();
      toast.success(`${selectedSteps.length} step(s) deleted successfully`);
    } catch (error) {
      console.error("Error deleting steps:", error);
      toast.error("Failed to delete some steps");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setStepTypeFilter("any");
    setFilterOpen(false);
  };

  // Helper variables for table state will be defined later

  // Handle loading states
  if (isCircuitLoading || isStepsLoading) {
    return (
      <PageLayout title="Circuit Steps" subtitle="Loading..." icon={Workflow}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      </PageLayout>
    );
  }

  // Handle error states
  if (isCircuitError || isStepsError) {
    return (
      <PageLayout
        title="Circuit Steps"
        subtitle="Error loading data"
        icon={Workflow}
      >
        <Alert className="max-w-md mx-auto border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load circuit or steps data. Please try refreshing the
            page.
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  const isCircuitActive = circuit?.isActive || false;
  const areAllSelected =
    paginatedSteps.length > 0 &&
    paginatedSteps.every((step) => selectedSteps.includes(step.id));
  const areSomeSelected = selectedSteps.length > 0;

  return (
    <PageLayout
      title="Circuit Steps"
      subtitle={`${circuit?.title || "Circuit"} • ${
        circuit?.circuitKey || circuitId
      } ${circuit?.isActive ? "• Active Circuit" : ""}`}
      icon={Workflow}
      actions={[
        ...(!isSimpleUser && !circuit?.isActive
          ? [
              {
                label: "Add Step",
                onClick: handleAddStep,
                variant: "default" as const,
                icon: Plus,
              },
            ]
          : []),
        {
          label: "Refresh",
          onClick: handleRefreshData,
          variant: "outline" as const,
          icon: RefreshCw,
        },
      ]}
    >
      <div
        className="h-full flex flex-col gap-5 w-full px-1"
        style={{ minHeight: "100%" }}
      >
        {/* Compact Search + Filter Bar */}
        <div className="p-4 rounded-xl table-glass-container shadow-lg">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            {/* Search and field select */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="w-[130px] h-9 text-sm table-search-select hover:table-search-select focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all duration-200 shadow-sm rounded-md flex-shrink-0">
                    <SelectValue>
                      {DEFAULT_STEP_SEARCH_FIELDS.find(
                        (opt) => opt.id === searchField
                      )?.label || "All Fields"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="table-search-select rounded-lg shadow-xl">
                    {DEFAULT_STEP_SEARCH_FIELDS.map((opt) => (
                      <SelectItem
                        key={opt.id}
                        value={opt.id as string}
                        className="text-xs hover:table-search-select focus:table-search-select rounded-md"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 group min-w-[200px]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-blue-500/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm"></div>
                <Input
                  placeholder="Search steps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="relative h-9 text-sm table-search-input pl-10 pr-4 rounded-md focus:ring-1 transition-all duration-200 shadow-sm group-hover:shadow-md"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 table-search-icon group-hover:table-search-icon transition-colors duration-200">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter popover */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-sm table-search-select hover:table-search-select shadow-sm rounded-md flex items-center gap-2 transition-all duration-200 hover:shadow-md whitespace-nowrap"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filter
                    {(stepTypeFilter !== "any" || searchField !== "all") && (
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 table-search-select rounded-lg shadow-xl p-4">
                  <div className="mb-3 table-search-text font-semibold text-sm flex items-center gap-2">
                    <Filter className="h-4 w-4 table-search-icon" />
                    Advanced Filters
                  </div>
                  <div className="flex flex-col gap-3">
                    {/* Search Field Filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        Search Field
                      </span>
                      <Select
                        value={searchField}
                        onValueChange={setSearchField}
                      >
                        <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                          <SelectValue>
                            {
                              DEFAULT_STEP_SEARCH_FIELDS.find(
                                (opt) => opt.id === searchField
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="table-search-select">
                          {DEFAULT_STEP_SEARCH_FIELDS.map((opt) => (
                            <SelectItem
                              key={opt.id}
                              value={opt.id}
                              className="text-xs hover:table-search-select"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Step Type Filter */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs table-search-text font-medium">
                        Step Type
                      </span>
                      <Select
                        value={stepTypeFilter}
                        onValueChange={setStepTypeFilter}
                      >
                        <SelectTrigger className="w-full h-8 text-xs table-search-select focus:ring-1 transition-colors duration-200 shadow-sm rounded-md">
                          <SelectValue>
                            {
                              STEP_TYPE_OPTIONS.find(
                                (opt) => opt.value === stepTypeFilter
                              )?.label
                            }
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="table-search-select">
                          {STEP_TYPE_OPTIONS.map((opt) => (
                            <SelectItem
                              key={opt.id}
                              value={opt.value}
                              className="text-xs hover:table-search-select"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    {(stepTypeFilter !== "any" || searchField !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs table-search-text hover:table-search-text-hover hover:table-search-select rounded-md transition-all duration-200 flex items-center gap-1.5"
                        onClick={clearAllFilters}
                      >
                        <X className="h-3 w-3" />
                        Clear All
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Main Content Area with Scrolling */}
        <div className="flex-1 min-h-0">
          <div className="h-full flex flex-col">
            {/* Steps Table */}
            <div className="flex-1 min-h-0 table-glass-container rounded-xl shadow-lg overflow-hidden">
              <div className="h-full overflow-auto">
                {paginatedSteps.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                      <Workflow className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No steps found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {filteredSteps.length === 0 && steps.length > 0
                        ? "No steps match your current filters."
                        : "Get started by adding your first step to this circuit."}
                    </p>
                    {!isSimpleUser && !circuit?.isActive && (
                      <Button
                        onClick={handleAddStep}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Step
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                      <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedSteps.length > 0 &&
                              selectedSteps.length === filteredSteps.length
                            }
                            onCheckedChange={handleSelectAll}
                            className="border-border"
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
                      {paginatedSteps.map((step, index) => {
                        const isSelected = selectedSteps.includes(step.id);

                        return (
                          <TableRow
                            key={step.id}
                            className={cn(
                              "border-slate-700/30 hover:bg-slate-800/30 transition-colors group",
                              isSelected && "bg-blue-500/10 border-blue-500/20",
                              index % 2 === 0
                                ? "bg-slate-900/20"
                                : "bg-slate-800/20"
                            )}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  handleSelectStep(step.id, !!checked)
                                }
                                aria-label={`Select step ${step.title}`}
                                className="border-slate-400/50"
                              />
                            </TableCell>

                            <TableCell className="font-mono text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400/60"></div>
                                <span className="text-slate-300">
                                  {step.stepKey}
                                </span>
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
                                        {step.orderIndex === 0
                                          ? "sequential"
                                          : "aennaki"}
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
                                    onClick={() => handleEditStep(step)}
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
                                    onClick={() => handleDeleteStep(step)}
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
                )}
              </div>
            </div>

            {/* Pagination */}
            {filteredSteps.length > 0 && (
              <div className="mt-4">
                <SmartPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  className="justify-center"
                />
              </div>
            )}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedSteps.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-gradient-to-r from-primary/95 to-primary/80 backdrop-blur-lg rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 border border-primary/20">
              <div className="flex items-center gap-2 text-primary-foreground">
                <Workflow className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedSteps.length} steps selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedSteps([])}
                  className="h-8 px-3 text-xs bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/20"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="h-8 px-3 text-xs bg-destructive/90 hover:bg-destructive text-destructive-foreground"
                >
                  <Trash className="mr-1 h-3 w-3" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <StepFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editStep={selectedStep ?? undefined}
        circuitId={Number(circuitId)}
        onSuccess={handleOperationSuccess}
      />

      <DeleteStepDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        stepId={selectedStep?.id || 0}
        stepTitle={selectedStep?.title || ""}
        onSuccess={handleOperationSuccess}
      />

      <DeleteConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
        title="Delete Selected Steps"
        description={`Are you sure you want to delete ${selectedSteps.length} selected step(s)? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        confirmText="Delete"
        destructive={true}
      />
    </PageLayout>
  );
}
