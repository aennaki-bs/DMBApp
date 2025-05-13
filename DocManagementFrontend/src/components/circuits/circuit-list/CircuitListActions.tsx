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
}

export function CircuitListActions({
  circuit,
  isSimpleUser,
  onEdit,
  onDelete,
  onViewDetails,
}: CircuitListActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-[#1e2a4a] border-blue-900/40 text-blue-100"
      >
        <DropdownMenuItem
          asChild
          className="hover:bg-blue-900/40 cursor-pointer"
        >
          <Link
            to={`/circuits/${circuit.id}/steps`}
            className="flex items-center"
          >
            <Eye className="mr-2 h-4 w-4 text-blue-400" />
            <span>View Steps</span>
          </Link>
        </DropdownMenuItem>

        {!isSimpleUser && (
          <>
            <DropdownMenuItem
              asChild
              className="hover:bg-blue-900/40 cursor-pointer"
            >
              <Link
                to={`/circuit/${circuit.id}/steps`}
                className="flex items-center"
              >
                <Network className="mr-2 h-4 w-4 text-blue-400" />
                <span>Status Steps</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-blue-900/40" />

            <DropdownMenuItem
              onClick={() => onEdit(circuit)}
              disabled={circuit.isActive}
              className={`flex items-center ${
                circuit.isActive
                  ? "text-blue-400/50 cursor-not-allowed"
                  : "hover:bg-blue-900/40 cursor-pointer"
              }`}
            >
              <Edit className="mr-2 h-4 w-4 text-blue-400" />
              <span>
                {circuit.isActive
                  ? "Cannot edit active circuit"
                  : "Edit Circuit"}
              </span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onDelete(circuit)}
              disabled={circuit.isActive}
              className={`flex items-center ${
                circuit.isActive
                  ? "text-red-400/50 cursor-not-allowed"
                  : "hover:bg-red-900/30 cursor-pointer text-red-400"
              }`}
            >
              <Trash2 className="mr-2 h-4 w-4 text-red-400" />
              <span>
                {circuit.isActive
                  ? "Cannot delete active circuit"
                  : "Delete Circuit"}
              </span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
