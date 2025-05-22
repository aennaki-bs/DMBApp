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
  const [circuitToDeactivate, setCircuitToDeactivate] =
    useState<Circuit | null>(null);

  const handleCircuitClick = (circuitId: number) => {
    navigate(`/circuits/${circuitId}/statuses`);
  };

  const handleToggleActive = async (circuit: Circuit, e: React.MouseEvent) => {
    e.stopPropagation();

    // Prevent multiple clicks
    if (loadingCircuits.includes(circuit.id)) return;

    // For activation, no confirmation needed
    if (!circuit.isActive) {
      performToggle(circuit);
      return;
    }

    // For deactivation, check if circuit has documents first
    setLoadingCircuits((prev) => [...prev, circuit.id]);

    try {
      // Check if circuit is used by any documents
      const usageInfo = await circuitService.checkCircuitUsage(circuit.id);

      if (usageInfo.isUsed) {
        // If circuit has documents, show error and don't allow deactivation
        toast.error(
          `Cannot deactivate circuit: It is currently assigned to ${
            usageInfo.documentCount > 1 ? "documents" : "a document"
          }.`
        );
        setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
        return;
      }

      // Show confirmation dialog
      setCircuitToDeactivate(circuit);
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    } catch (error: any) {
      const errorMessage =
        error?.message || "An error occurred while checking circuit usage";
      toast.error(errorMessage);
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
    }
  };

  const performToggle = async (circuit: Circuit) => {
    setLoadingCircuits((prev) => [...prev, circuit.id]);

    try {
      // Toggle activation
      await circuitService.toggleCircuitActivation(circuit);
      toast.success(
        `Circuit ${circuit.isActive ? "deactivated" : "activated"} successfully`
      );

      // Refresh the list
      if (refetch) {
        await refetch();
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "An error occurred while updating the circuit";
      toast.error(errorMessage);
    } finally {
      setLoadingCircuits((prev) => prev.filter((id) => id !== circuit.id));
      setCircuitToDeactivate(null);
    }
  };

  const renderSortableHeader = (
    label: string,
    key: string,
    icon: React.ReactNode
  ) => (
    <div
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => onSort(key)}
    >
      {icon}
      {label}
      <div className="ml-1 w-4 text-center">
        {sortConfig?.key === key ? (
          <ArrowUpDown
            className="h-3 w-3"
            style={{
              transform:
                sortConfig.direction === "asc"
                  ? "rotate(0deg)"
                  : "rotate(180deg)",
              opacity: 1,
            }}
          />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </div>
    </div>
  );

  return (
    <>
      <Table>
        <TableHeader className="bg-blue-900/20 sticky top-0 z-10">
          <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
            {!isSimpleUser && (
              <TableHead className="w-12 text-blue-300">
                <Checkbox
                  checked={
                    selectedCircuits.length === circuits.length &&
                    circuits.length > 0
                  }
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                  className="border-blue-500/50"
                />
              </TableHead>
            )}
            <TableHead className="text-blue-300">
              {renderSortableHeader(
                "Circuit Code",
                "circuitKey",
                <GitBranch className="h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="text-blue-300">
              {renderSortableHeader(
                "Title",
                "title",
                <FileText className="h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="text-blue-300">
              {renderSortableHeader(
                "Description",
                "descriptif",
                <Info className="h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="text-blue-300">
              {renderSortableHeader(
                "Status",
                "isActive",
                <ToggleLeft className="h-4 w-4" />
              )}
            </TableHead>
            <TableHead className="text-blue-300 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {circuits.map((circuit) => (
            <TableRow
              key={circuit.id}
              className={`border-blue-900/30 hover:bg-blue-900/20 transition-colors cursor-pointer ${
                selectedCircuits.includes(circuit.id)
                  ? "bg-blue-900/30 border-l-4 border-l-blue-500"
                  : ""
              }`}
            >
              {!isSimpleUser && (
                <TableCell
                  className="w-12"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedCircuits.includes(circuit.id)}
                    onCheckedChange={() => onSelectCircuit(circuit.id)}
                    className="border-blue-500/50"
                  />
                </TableCell>
              )}
              <TableCell
                className="font-medium text-blue-100"
                onClick={() => handleCircuitClick(circuit.id)}
              >
                {circuit.circuitKey}
              </TableCell>
              <TableCell
                className="text-blue-100"
                onClick={() => handleCircuitClick(circuit.id)}
              >
                {circuit.title}
              </TableCell>
              <TableCell
                className="max-w-xs truncate text-blue-200/70"
                onClick={() => handleCircuitClick(circuit.id)}
              >
                {circuit.descriptif || "No description"}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  {loadingCircuits.includes(circuit.id) ? (
                    <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                  ) : (
                    <Switch
                      checked={circuit.isActive}
                      onCheckedChange={() => {}}
                      onClick={(e) => handleToggleActive(circuit, e)}
                      className={
                        circuit.isActive
                          ? "data-[state=checked]:bg-green-500"
                          : ""
                      }
                      disabled={loadingCircuits.includes(circuit.id)}
                    />
                  )}
                  <span
                    className={`text-sm ${
                      circuit.isActive ? "text-green-500" : "text-gray-400"
                    }`}
                  >
                    {circuit.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </TableCell>
              <TableCell
                className="text-right space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <CircuitListActions
                  circuit={circuit}
                  isSimpleUser={isSimpleUser}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                  onCircuitUpdated={refetch}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Deactivation confirmation dialog */}
      <AlertDialog
        open={circuitToDeactivate !== null}
        onOpenChange={(open) => !open && setCircuitToDeactivate(null)}
      >
        <AlertDialogContent className="bg-[#0a1033] border-blue-900/50 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Circuit</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to deactivate this circuit? This will
              prevent new documents from being assigned to it.
              <div className="mt-2 p-2 bg-blue-900/20 border border-blue-900/30 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">
                  Verification complete: This circuit is not currently assigned
                  to any documents.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-blue-900/50 text-gray-300 hover:bg-blue-900/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (circuitToDeactivate) {
                  performToggle(circuitToDeactivate);
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loadingCircuits.includes(circuitToDeactivate?.id || 0)
                ? "Deactivating..."
                : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
