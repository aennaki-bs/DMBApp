import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { createPortal } from "react-dom";

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

export interface BulkActionsBarProps {
  selectedCount: number;
  entityName: string;
  actions: BulkAction[];
  icon?: ReactNode;
}

export function BulkActionsBar({
  selectedCount,
  entityName,
  actions,
  icon,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return createPortal(
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
    >
      <div className="bulk-actions-container backdrop-blur-lg shadow-[0_8px_32px_var(--bulk-actions-shadow)] rounded-2xl border p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2">
        <div className="flex items-center bulk-actions-text font-medium">
          <div className="bulk-actions-icon-bg p-1.5 rounded-xl mr-3 flex-shrink-0">
            {icon || <Users className="w-5 h-5 bulk-actions-text" />}
          </div>
          <span className="text-sm sm:text-base text-center sm:text-left">
            <span className="font-bold bulk-actions-text-accent">
              {selectedCount}
            </span>{" "}
            {entityName}
            {selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              size="sm"
              className={
                action.className ||
                (action.variant === "destructive"
                  ? "bg-destructive/40 border-destructive/40 text-destructive-foreground hover:text-destructive-foreground hover:bg-destructive/60 hover:border-destructive/60 transition-all duration-200 shadow-lg min-w-[80px] font-medium"
                  : "bulk-actions-button transition-all duration-200 shadow-lg min-w-[80px] font-medium")
              }
              onClick={action.onClick}
            >
              {action.icon && <span className="mr-1.5">{action.icon}</span>}
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </motion.div>,
    document.body
  );
}
