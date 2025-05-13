import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

export interface BulkAction {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}

interface BulkActionsBarProps {
  selectedCount: number;
  entityName: string;
  actions: BulkAction[];
}

export function BulkActionsBar({
  selectedCount,
  entityName,
  actions,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 p-2 bg-blue-900/30 border border-blue-800/50 rounded-md flex justify-between items-center">
      <div className="text-blue-200 text-sm pl-2">
        <span className="font-medium">{selectedCount}</span> {entityName}
        {selectedCount !== 1 ? "s" : ""} selected
      </div>
      <div className="flex gap-2">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant || "outline"}
            size="sm"
            className={
              action.className ||
              "border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
            }
            onClick={action.onClick}
          >
            {action.icon && <span className="mr-1">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
