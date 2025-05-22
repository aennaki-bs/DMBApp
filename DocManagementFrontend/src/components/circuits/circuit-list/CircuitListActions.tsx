import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, Network, MoreHorizontal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CircuitListActionsProps {
  circuit: Circuit;
  isSimpleUser: boolean;
  onEdit: (circuit: Circuit) => void;
  onDelete: (circuit: Circuit) => void;
  onViewDetails: (circuit: Circuit) => void;
  onCircuitUpdated?: () => void;
}

export function CircuitListActions({
  circuit,
  isSimpleUser,
  onEdit,
  onDelete,
  onViewDetails,
  onCircuitUpdated,
}: CircuitListActionsProps) {
  // For simple users or small screens, use dropdown menu
  return (
    <>
      <div className="flex justify-end space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                asChild
              >
                <Link to={`/circuits/${circuit.id}/steps`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
              <p>View Steps</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {!isSimpleUser && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                    asChild
                  >
                    <Link to={`/circuit/${circuit.id}/steps`}>
                      <Network className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                  <p>Status Steps</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 p-0 ${
                      circuit.isActive
                        ? "text-blue-400/50 cursor-not-allowed"
                        : "text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
                    }`}
                    onClick={() => !circuit.isActive && onEdit(circuit)}
                    disabled={circuit.isActive}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                  <p>
                    {circuit.isActive
                      ? "Cannot edit active circuit"
                      : "Edit Circuit"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 p-0 ${
                      circuit.isActive
                        ? "text-red-400/50 cursor-not-allowed"
                        : "text-red-400 hover:text-red-300 hover:bg-red-900/30"
                    }`}
                    onClick={() => !circuit.isActive && onDelete(circuit)}
                    disabled={circuit.isActive}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                  <p>
                    {circuit.isActive
                      ? "Cannot delete active circuit"
                      : "Delete Circuit"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </div>
    </>
  );
}
