import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  MoreVertical,
  Eye,
  Edit,
  Trash,
  CircuitBoard,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface CircuitTableBodyProps {
  circuits: Circuit[];
  selectedCircuits: number[];
  onSelectCircuit: (circuitId: number, checked: boolean) => void;
  onEdit: (circuit: Circuit) => void;
  onView: (circuit: Circuit) => void;
  onViewStatuses: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onToggleActive: (circuit: Circuit) => void;
  loadingCircuits: number[];
  isSimpleUser: boolean;
}

export function CircuitTableBody({
  circuits,
  selectedCircuits,
  onSelectCircuit,
  onEdit,
  onView,
  onViewStatuses,
  onDelete,
  onToggleActive,
  loadingCircuits,
  isSimpleUser,
}: CircuitTableBodyProps) {
  const getCircuitInitials = (circuit: Circuit) => {
    return circuit.circuitKey?.substring(0, 2).toUpperCase() || "CR";
  };

  const getTypeColor = (descriptif: string) => {
    const type = descriptif?.toLowerCase() || "";
    if (type.includes("avoire") || type.includes("vente"))
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (type.includes("facture"))
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (type.includes("document"))
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  return (
    <TableBody>
      {circuits.map((circuit) => (
        <TableRow
          key={circuit.id}
          className="border-border hover:bg-muted/30 transition-colors"
        >
          <TableCell className="w-[40px]">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedCircuits.includes(circuit.id)}
                onCheckedChange={(checked) =>
                  onSelectCircuit(circuit.id, checked as boolean)
                }
                className="border-border"
              />
            </div>
          </TableCell>

          <TableCell className="min-w-[280px]">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {getCircuitInitials(circuit)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="font-medium text-foreground truncate">
                  {circuit.circuitKey}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  @{circuit.circuitKey}
                </div>
              </div>
            </div>
          </TableCell>

          <TableCell className="min-w-[300px]">
            <div className="font-medium text-foreground truncate">
              {circuit.title || "No title"}
            </div>
          </TableCell>

          <TableCell className="min-w-[140px]">
            <Badge variant="outline" className="text-xs border-border">
              {circuit.descriptif || "Type"}
            </Badge>
          </TableCell>

          <TableCell className="w-24 text-center">
            <div className="flex items-center justify-center">
              {loadingCircuits.includes(circuit.id) ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Switch
                  checked={!circuit.isActive}
                  onCheckedChange={() => onToggleActive(circuit)}
                  disabled={isSimpleUser}
                  className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500"
                />
              )}
            </div>
          </TableCell>

          <TableCell className="w-20 text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-accent/50"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background border-border"
              >
                <DropdownMenuItem
                  onClick={() => onView(circuit)}
                  className="hover:bg-accent/50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Steps
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onViewStatuses(circuit)}
                  className="hover:bg-accent/50"
                >
                  <CircuitBoard className="h-4 w-4 mr-2" />
                  View Statuses
                </DropdownMenuItem>
                {!isSimpleUser && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={() => onEdit(circuit)}
                      className="hover:bg-accent/50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      onClick={() => onDelete(circuit)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  );
}
