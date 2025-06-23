import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { CircuitActionsDropdown } from "./row/CircuitActionsDropdown";
import { GitBranch, FileText, Activity, Loader2 } from "lucide-react";

interface CircuitTableRowProps {
  circuit: Circuit;
  isSelected: boolean;
  onSelect: (circuitId: number) => void;
  onEdit: (circuit: Circuit) => void;
  onView: (circuit: Circuit) => void;
  onViewStatuses: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onToggleActive: (circuit: Circuit) => void;
  loadingCircuits: number[];
  isSimpleUser: boolean;
}

export function CircuitTableRow({
  circuit,
  isSelected,
  onSelect,
  onEdit,
  onView,
  onViewStatuses,
  onDelete,
  onToggleActive,
  loadingCircuits,
  isSimpleUser,
}: CircuitTableRowProps) {
  const handleRowClick = (event: React.MouseEvent) => {
    // Don't trigger row selection if clicking on action buttons or links
    const target = event.target as HTMLElement;
    const isActionElement = target.closest(
      'button, a, [role="button"], .dropdown-trigger, .switch'
    );

    if (!isActionElement) {
      onSelect(circuit.id);
    }
  };

  const handleSelectChange = (checked: boolean) => {
    onSelect(circuit.id);
  };

  const getTypeColor = (descriptif: string) => {
    const type = descriptif?.toLowerCase() || "";
    if (type.includes("sales") || type.includes("vente"))
      return isSelected
        ? "bg-blue-500/30 text-blue-400 border-blue-500/40"
        : "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (type.includes("facture") || type.includes("invoice"))
      return isSelected
        ? "bg-green-500/30 text-green-400 border-green-500/40"
        : "bg-green-500/20 text-green-400 border-green-500/30";
    if (type.includes("document"))
      return isSelected
        ? "bg-purple-500/30 text-purple-400 border-purple-500/40"
        : "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return isSelected
      ? "bg-gray-500/30 text-gray-400 border-gray-500/40"
      : "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <TableRow
      className={`circuit-table-layout transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? "bg-primary/10 border-primary/30 shadow-sm"
          : "hover:bg-muted/30"
      }`}
      onClick={handleRowClick}
    >
      {/* Selection Column */}
      <TableCell className="py-3 table-cell-center">
        <Checkbox
          enhanced={true}
          size="sm"
          checked={isSelected}
          onCheckedChange={handleSelectChange}
          className="border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary pointer-events-none"
        />
      </TableCell>

      {/* Circuit Column */}
      <TableCell className="py-3 table-cell-start">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex-shrink-0">
            <div
              className={`h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? "from-primary/30 to-primary/20 border-primary/40 shadow-sm"
                  : ""
              }`}
            >
              <GitBranch className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`text-sm font-medium truncate transition-colors duration-200 ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {circuit.circuitKey}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              ID: {circuit.id}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Title Column */}
      <TableCell className="py-3 table-cell-start max-md:hidden">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {circuit.title ? (
            <span className="text-sm truncate max-w-[180px]">
              {circuit.title}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No title
            </span>
          )}
        </div>
      </TableCell>

      {/* Type Column */}
      <TableCell className="py-3 table-cell-center">
        <Badge
          variant="secondary"
          className={`text-xs px-2 py-1 transition-colors duration-200 ${getTypeColor(
            circuit.descriptif || ""
          )}`}
        >
          <FileText className="h-3 w-3 mr-1" />
          {circuit.descriptif || "Type"}
        </Badge>
      </TableCell>

      {/* Block Column */}
      <TableCell className="py-3 table-cell-center max-md:hidden">
        <div className="flex items-center justify-center">
          {loadingCircuits.includes(circuit.id) ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <div className="flex items-center gap-2">
              <Switch
                checked={!circuit.isActive}
                onCheckedChange={() => onToggleActive(circuit)}
                disabled={isSimpleUser}
                className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500 transition-all duration-200 switch"
              />
              <Badge
                variant="secondary"
                className={`text-xs px-2 py-1 transition-colors duration-200 ${
                  circuit.isActive
                    ? isSelected
                      ? "bg-green-500/30 text-green-400 border-green-500/40"
                      : "bg-green-500/20 text-green-400 border-green-500/30"
                    : isSelected
                    ? "bg-red-500/30 text-red-400 border-red-500/40"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                <Activity className="h-3 w-3 mr-1" />
                {circuit.isActive ? "Active" : "Blocked"}
              </Badge>
            </div>
          )}
        </div>
      </TableCell>

      {/* Actions Column */}
      <TableCell className="py-3 table-cell-center">
        <CircuitActionsDropdown
          circuit={circuit}
          onEdit={() => onEdit(circuit)}
          onView={() => onView(circuit)}
          onViewStatuses={() => onViewStatuses(circuit)}
          onDelete={() => onDelete(circuit)}
          isSimpleUser={isSimpleUser}
        />
      </TableCell>
    </TableRow>
  );
}
