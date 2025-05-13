import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

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
  icon?: ReactNode;
}

export function BulkActionsBar({
  selectedCount,
  entityName,
  actions,
  icon,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-3xl"
    >
      <div className="bg-gradient-to-r from-[#1a2c6b] to-[#0a1033] backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)] rounded-xl border border-blue-500/30 p-4 flex items-center justify-between">
        <div className="flex items-center text-blue-200 font-medium">
          <div className="bg-blue-500/20 p-1.5 rounded-lg mr-3">
            {icon || <Users className="w-5 h-5 text-blue-400" />}
          </div>
          <span className="text-sm sm:text-base">
            <span className="font-bold text-blue-100">{selectedCount}</span>{" "}
            {entityName}
            {selectedCount !== 1 ? "s" : ""} selected
          </span>
        </div>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              size="sm"
              className={
                action.className ||
                "bg-blue-900/30 border-blue-500/30 text-blue-200 hover:text-blue-100 hover:bg-blue-800/50 hover:border-blue-400/50 transition-all duration-200 shadow-md"
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
    </motion.div>
  );
}
