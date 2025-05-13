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
} from "lucide-react";

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
}: CircuitsTableProps) {
  const navigate = useNavigate();

  const handleCircuitClick = (circuitId: number) => {
    navigate(`/circuits/${circuitId}/statuses`);
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
              <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
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
            <TableCell onClick={() => handleCircuitClick(circuit.id)}>
              <Badge
                variant={circuit.isActive ? "default" : "secondary"}
                className={
                  circuit.isActive
                    ? "bg-green-600/20 text-green-500 hover:bg-green-600/30 border-green-500/30"
                    : "bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 border-gray-500/30"
                }
              >
                {circuit.isActive ? "Active" : "Inactive"}
              </Badge>
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
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
