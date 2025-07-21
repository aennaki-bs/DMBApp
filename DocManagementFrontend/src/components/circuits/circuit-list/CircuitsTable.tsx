import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CircuitListActions } from "./CircuitListActions";
import {
  ArrowUpDown,
  GitBranch,
  FileText,
  ToggleLeft,
  Info,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CircuitActivationDialog from "../CircuitActivationDialog";
import CircuitDeactivationDialog from "../CircuitDeactivationDialog";
import { usePagination } from "@/hooks/usePagination";
import SmartPagination from "@/components/shared/SmartPagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";

interface CircuitsTableProps {
  circuits: Circuit[];
  isSimpleUser: boolean;
  selectedCircuits: number[];
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
  onSelectCircuit: (id: number) => void;
  onSelectAll: () => void;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
  onBulkDelete: () => void;
  refetch?: () => void;
}

// Circuit Table Header Component
const CircuitTableHeader = ({
  isSimpleUser,
  selectedCount,
  totalCount,
  onSelectAll,
  sortConfig,
  onSort,
}: {
  isSimpleUser: boolean;
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  sortConfig: { key: string; direction: "asc" | "desc" } | null;
  onSort: (key: string) => void;
}) => {
  const renderSortableHeader = (
    label: string,
    key: string,
    icon: React.ReactNode
  ) => (
    <div
      className="flex items-center gap-1 cursor-pointer select-none hover:text-blue-100 transition-colors duration-150"
      onClick={() => onSort(key)}
    >
      {icon}
      {label}
      <div className="ml-1 w-4 text-center">
        {sortConfig?.key === key ? (
          <ArrowUpDown
            className="h-3.5 w-3.5 text-blue-400"
            style={{
              transform:
                sortConfig.direction === "asc"
                  ? "rotate(0deg)"
                  : "rotate(180deg)",
              opacity: 1,
            }}
          />
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
        )}
      </div>
    </div>
  );

  return (
    <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033]">
      <TableRow className="border-blue-900/30 hover:bg-transparent">
        {!isSimpleUser && (
          <TableHead className="w-[50px] text-blue-300 font-medium">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedCount === totalCount && totalCount > 0}
                onCheckedChange={onSelectAll}
                aria-label="Select all"
                className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
              />
            </div>
          </TableHead>
        )}
        <TableHead className="w-[120px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Circuit Code",
            "circuitKey",
            <GitBranch className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[200px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Title",
            "title",
            <FileText className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[250px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Description",
            "descriptif",
            <Info className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[200px] text-blue-300 font-medium">
          {renderSortableHeader(
            "Type",
            "documentType.typeName",
            <FileText className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[130px] text-blue-300 font-medium text-center">
          {renderSortableHeader(
            "Status",
            "isActive",
            <ToggleLeft className="h-4 w-4 text-blue-400" />
          )}
        </TableHead>
        <TableHead className="w-[150px] text-blue-300 font-medium text-center">
          Actions
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

// Circuit Table Row Component
const CircuitTableRow = ({
  circuit,
  isSimpleUser,
  isSelected,
  onSelectCircuit,
  onCircuitClick,
  loadingCircuits,
  onToggleActive,
  onEdit,
  onDelete,
  onViewDetails,
  refetch,
}: {
  circuit: Circuit;
  isSimpleUser: boolean;
  isSelected: boolean;
  onSelectCircuit: (id: number) => void;
  onCircuitClick: (id: number) => void;
  loadingCircuits: number[];
  onToggleActive: (circuit: Circuit, e: React.MouseEvent) => void;
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
  refetch?: () => void;
}) => {
  return (
    <TableRow
      className={`border-blue-900/30 hover:bg-blue-900/20 transition-colors cursor-pointer ${isSelected ? "bg-blue-900/30 border-l-4 border-l-blue-500" : ""
        }`}
    >
      {!isSimpleUser && (
        <TableCell className="w-[50px] align-middle" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelectCircuit(circuit.id)}
              className="border-blue-500/50"
            />
          </div>
        </TableCell>
      )}
      <TableCell
        className="w-[120px] font-medium text-blue-100 align-middle"
        onClick={() => onCircuitClick(circuit.id)}
      >
        <div className="flex items-center">
          <span className="truncate">{circuit.circuitKey}</span>
        </div>
      </TableCell>
      <TableCell
        className="w-[200px] text-blue-100 align-middle"
        onClick={() => onCircuitClick(circuit.id)}
      >
        <div className="flex items-center">
          <span className="truncate">{circuit.title}</span>
        </div>
      </TableCell>
      <TableCell
        className="w-[250px] text-blue-200/70 align-middle"
        onClick={() => onCircuitClick(circuit.id)}
      >
        <div className="flex items-center">
          <span className="truncate">{circuit.descriptif || "No description"}</span>
        </div>
      </TableCell>
      <TableCell
        className="w-[200px] text-blue-200/70 align-middle"
        onClick={() => onCircuitClick(circuit.id)}
      >
        {circuit.documentType ? (
          <div className="flex items-center justify-start gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-800/40 text-blue-200 text-xs flex-shrink-0"
            >
              {circuit.documentType.typeKey || "N/A"}
            </Badge>
            <span className="text-sm truncate">{circuit.documentType.typeName}</span>
          </div>
        ) : (
          <span className="text-gray-400 italic">No document type</span>
        )}
      </TableCell>
      <TableCell className="w-[130px] text-center align-middle" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center gap-2">
          {loadingCircuits.includes(circuit.id) ? (
            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
          ) : (
            <Switch
              checked={circuit.isActive}
              onCheckedChange={(checked) => {
                // Create a synthetic event to match the existing function signature
                const syntheticEvent = {
                  stopPropagation: () => { },
                } as React.MouseEvent;
                onToggleActive(circuit, syntheticEvent);
              }}
              className={
                circuit.isActive ? "data-[state=checked]:bg-green-500" : ""
              }
              disabled={loadingCircuits.includes(circuit.id)}
            />
          )}
          <span
            className={`text-sm font-medium ${circuit.isActive ? "text-green-500" : "text-gray-400"
              }`}
          >
            {circuit.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </TableCell>
      <TableCell
        className="w-[150px] text-center align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center">
          <CircuitListActions
            circuit={circuit}
            isSimpleUser={isSimpleUser}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
            onCircuitUpdated={refetch}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export function CircuitsTable({
  circuits,
  isSimpleUser,
  selectedCircuits,
  onEdit,
  onDelete,
  onViewDetails,
  onSelectCircuit,
  onSelectAll,
  sortConfig,
  onSort,
  onBulkDelete,
  refetch,
}: CircuitsTableProps) {
  const navigate = useNavigate();
  const [loadingCircuits, setLoadingCircuits] = useState<number[]>([]);
  const queryClient = useQueryClient();

  // Navigate to the circuit statuses page when clicking on a circuit
  const handleCircuitClick = (circuitId: number) => {
    navigate(`/circuits/${circuitId}/statuses`);
  };

  const [circuitToActivate, setCircuitToActivate] = useState<Circuit | null>(
    null
  );
  const [circuitToDeactivate, setCircuitToDeactivate] = useState<Circuit | null>(
    null
  );

  // Use pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedData: paginatedCircuits,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    data: circuits,
    initialPageSize: 25,
  });

  // Update handleSelectAll to work with current page data only
  const handleSelectAll = () => {
    const currentPageCircuitIds = paginatedCircuits.map(
      (circuit) => circuit.id
    );
    const allCurrentPageSelected = currentPageCircuitIds.every((id) =>
      selectedCircuits.includes(id)
    );

    if (allCurrentPageSelected) {
      // Deselect all on current page
      const newSelected = selectedCircuits.filter(
        (id) => !currentPageCircuitIds.includes(id)
      );
      paginatedCircuits.forEach((circuit) => onSelectCircuit(circuit.id));
    } else {
      // Select all on current page
      currentPageCircuitIds.forEach((id) => {
        if (!selectedCircuits.includes(id)) {
          onSelectCircuit(id);
        }
      });
    }
    onSelectAll();
  };

  const handleToggleActive = async (circuit: Circuit, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent multiple clicks
    if (loadingCircuits.includes(circuit.id)) return;

    // For activation, show the activation dialog
    if (!circuit.isActive) {
      setCircuitToActivate(circuit);
      return;
    }

    // For deactivation, show the deactivation dialog
    setCircuitToDeactivate(circuit);
  };

  const performToggle = async (circuit: Circuit) => {
    setLoadingCircuits((prev) => [...prev, circuit.id]);

    try {
      // Toggle activation
      await circuitService.toggleCircuitActivation(circuit);

      // Use React Query cache invalidation for consistent behavior
      await queryClient.invalidateQueries({
        queryKey: ['circuits'],
        exact: false
      });

      // Also refetch for immediate UI update
      await queryClient.refetchQueries({
        queryKey: ['circuits'],
        exact: false
      });

      toast.success("Circuit activated successfully", {
        description: "The circuit list has been updated automatically.",
        duration: 3000,
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to activate circuit";
      toast.error(errorMessage, {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    }
  };

  const performDeactivation = async (circuit: Circuit) => {
    setLoadingCircuits((prev) => [...prev, circuit.id]);

    try {
      // Toggle deactivation
      await circuitService.toggleCircuitActivation(circuit);

      // Use React Query cache invalidation for consistent behavior
      await queryClient.invalidateQueries({
        queryKey: ['circuits'],
        exact: false
      });

      // Also refetch for immediate UI update
      await queryClient.refetchQueries({
        queryKey: ['circuits'],
        exact: false
      });

      toast.success("Circuit deactivated successfully", {
        description: "The circuit list has been updated automatically.",
        duration: 3000,
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to deactivate circuit";
      toast.error(errorMessage, {
        description: "Please try again or contact support if the problem persists.",
      });
    } finally {
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    }
  };

  // Calculate selectedCount for current page
  const selectedCount = paginatedCircuits.filter((circuit) =>
    selectedCircuits.includes(circuit.id)
  ).length;

  return (
    <div className="space-y-4">
      {/* Circuit Activation Dialog */}
      {circuitToActivate && (
        <CircuitActivationDialog
          isOpen={true}
          onClose={() => setCircuitToActivate(null)}
          circuit={circuitToActivate}
          onActivate={() => {
            performToggle(circuitToActivate);
            setCircuitToActivate(null);
          }}
        />
      )}

      {/* Circuit Deactivation Dialog */}
      {circuitToDeactivate && (
        <CircuitDeactivationDialog
          isOpen={true}
          onClose={() => setCircuitToDeactivate(null)}
          circuit={circuitToDeactivate}
          onDeactivate={() => {
            performDeactivation(circuitToDeactivate);
            setCircuitToDeactivate(null);
          }}
        />
      )}

      {/* Table Container */}
      <>
        {/* Fixed Header - Never Scrolls */}
        <div className="min-w-[1200px] border-b border-blue-900/30">
          <Table className="table-fixed w-full table-compact">
            <CircuitTableHeader
              isSimpleUser={isSimpleUser}
              selectedCount={selectedCount}
              totalCount={paginatedCircuits.length}
              onSelectAll={handleSelectAll}
              sortConfig={sortConfig}
              onSort={onSort}
            />
          </Table>
        </div>

        {/* Scrollable Body - Only Content Scrolls */}
        <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
          <div className="min-w-[1200px]">
            <Table className="table-fixed w-full table-compact">
              <TableBody>
                {paginatedCircuits.map((circuit) => (
                  <CircuitTableRow
                    key={circuit.id}
                    circuit={circuit}
                    isSimpleUser={isSimpleUser}
                    isSelected={selectedCircuits.includes(circuit.id)}
                    onSelectCircuit={onSelectCircuit}
                    onCircuitClick={handleCircuitClick}
                    loadingCircuits={loadingCircuits}
                    onToggleActive={handleToggleActive}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                    refetch={refetch}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </>

      {/* Smart Pagination */}
      <SmartPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />


    </div>
  );
}
