import React from "react";
import { Button } from "@/components/ui/button";
import { LucideIcon, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export interface BulkAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  entityName?: string;
  icon?: LucideIcon;
  className?: string;
}

export function BulkActions({
  selectedCount,
  actions,
  entityName = "item",
  icon: Icon = Filter,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-6 right-16 transform -translate-x-1/2 z-[9999] w-[calc(100vw-4rem)] max-w-4xl mx-auto"
      >
        <div className="bulk-actions-container backdrop-blur-lg shadow-[0_8px_32px_var(--bulk-actions-shadow)] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 ring-2">
          {/* Selection Info */}
          <div className="flex items-center bulk-actions-text font-medium">
            <div className="bulk-actions-icon-bg p-1.5 rounded-xl mr-3 flex-shrink-0">
              <Icon className="w-5 h-5 bulk-actions-text" />
            </div>
            <span className="text-sm sm:text-base text-center sm:text-left">
              <span className="font-bold bulk-actions-text-accent">
                {selectedCount}
              </span>{" "}
              {entityName}
              {selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "outline"}
                size="sm"
                disabled={action.disabled}
                className={`transition-all duration-200 shadow-lg min-w-[80px] font-medium ${
                  action.variant === "destructive"
                    ? "bg-red-900/40 border-red-500/40 text-red-200 hover:text-red-100 hover:bg-red-900/60 hover:border-red-400/60"
                    : "bulk-actions-button"
                }`}
                onClick={action.onClick}
              >
                {action.icon && <action.icon className="w-4 h-4 mr-1.5" />}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default BulkActions;
