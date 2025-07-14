import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Vendor } from "@/models/vendor";

interface VendorActionsDropdownProps {
  vendor: Vendor;
  onEdit: () => void;
  onDelete: () => void;
}

export function VendorActionsDropdown({
  vendor,
  onEdit,
  onDelete,
}: VendorActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl"
      >
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
            setIsOpen(false);
          }}
          className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary cursor-pointer"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setIsOpen(false);
          }}
          className="hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 