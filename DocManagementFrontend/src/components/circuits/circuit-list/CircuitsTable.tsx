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
import { ArrowDown, ArrowUp } from "lucide-react";

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

  const renderSortIcon = (field: string) => {
    if (sortConfig?.key !== field) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-400" />
    );
  };

  const headerClass = (field: string) => `
    text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-100 transition-colors duration-150
    ${sortConfig?.key === field ? "text-blue-100" : ""}
  `;

  return (
    <Table>
      <TableHeader className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033] sticky top-0 z-10">
        <TableRow className="border-blue-900/30 hover:bg-transparent">
          {!isSimpleUser && (
            <TableHead className="w-12">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={
                    selectedCircuits.length === circuits.length &&
                    circuits.length > 0
                  }
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                  className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                />
              </div>
            </TableHead>
          )}
          <TableHead
            className={headerClass("circuitKey")}
            onClick={() => onSort("circuitKey")}
          >
            <div className="flex items-center">
              Circuit Code {renderSortIcon("circuitKey")}
            </div>
          </TableHead>
          <TableHead
            className={headerClass("title")}
            onClick={() => onSort("title")}
          >
            <div className="flex items-center">
              Title {renderSortIcon("title")}
            </div>
          </TableHead>
          <TableHead
            className={headerClass("descriptif")}
            onClick={() => onSort("descriptif")}
          >
            <div className="flex items-center">
              Description {renderSortIcon("descriptif")}
            </div>
          </TableHead>
          <TableHead
            className={headerClass("isActive")}
            onClick={() => onSort("isActive")}
          >
            <div className="flex items-center">
              Status {renderSortIcon("isActive")}
            </div>
          </TableHead>
          <TableHead className="text-right pr-4">
            <span className="text-blue-200 font-medium">Actions</span>
          </TableHead>
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
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={selectedCircuits.includes(circuit.id)}
                    onCheckedChange={() => onSelectCircuit(circuit.id)}
                    className="border-blue-500/50 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-500"
                  />
                </div>
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
                    ? "bg-green-900/50 text-green-300 hover:bg-green-900/70 border-green-700/50"
                    : "bg-gray-800/50 text-gray-400 hover:bg-gray-800/70 border-gray-700/50"
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
