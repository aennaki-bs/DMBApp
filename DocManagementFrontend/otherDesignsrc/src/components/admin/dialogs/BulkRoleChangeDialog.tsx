import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, ShieldAlert, ShieldCheck, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface BulkRoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  selectedCount: number;
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

const ROLES = [
  {
    key: "Admin",
    name: "Admin",
    icon: ShieldAlert,
    color: "red",
    description: "Full system access including user management",
    warning: "Only assign to trusted administrators",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
    hoverBg: "hover:bg-red-500/20",
    selectedBg: "bg-red-500/30",
    selectedBorder: "border-red-400",
  },
  {
    key: "FullUser",
    name: "Full User",
    icon: ShieldCheck,
    color: "emerald",
    description: "Document creation, editing and deletion",
    subDescription: "Access to all document types",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    textColor: "text-emerald-400",
    hoverBg: "hover:bg-emerald-500/20",
    selectedBg: "bg-emerald-500/30",
    selectedBorder: "border-emerald-400",
  },
  {
    key: "SimpleUser",
    name: "Simple User",
    icon: Shield,
    color: "blue",
    description: "Document viewing and basic operations",
    subDescription: "Limited access to document types",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    hoverBg: "hover:bg-blue-500/20",
    selectedBg: "bg-blue-500/30",
    selectedBorder: "border-blue-400",
  },
];

export function BulkRoleChangeDialog({
  open,
  onOpenChange,
  onConfirm,
  selectedCount,
  selectedRole,
  onRoleChange,
}: BulkRoleChangeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Role change failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRoleData = ROLES.find((role) => role.key === selectedRole);

  return (
    <Dialog open={open} onOpenChange={!isLoading ? onOpenChange : undefined}>
      <DialogContent
        className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-md border-slate-700/50 text-white shadow-2xl rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        aria-describedby="role-change-description"
      >
        <DialogHeader className="flex-shrink-0 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-slate-100">
              Change Role for Selected Users
            </DialogTitle>
          </motion.div>
          <DialogDescription
            id="role-change-description"
            className="text-slate-400"
          >
            Select the role to assign to{" "}
            <span className="font-medium text-blue-400">{selectedCount}</span>{" "}
            user
            {selectedCount !== 1 ? "s" : ""}:
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <ScrollArea className="flex-1 min-h-0 px-1">
          <div className="space-y-4 py-2">
            <motion.h4
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-sm font-medium text-slate-300 mb-4"
            >
              Available Roles:
            </motion.h4>

            <div className="space-y-3">
              {ROLES.map((role, index) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.key;

                return (
                  <motion.button
                    key={role.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    onClick={() => onRoleChange(role.key)}
                    disabled={isLoading}
                    className={`
                      w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${
                        isSelected
                          ? `${role.selectedBg} ${role.selectedBorder} ring-2 ring-${role.color}-400/20 shadow-lg`
                          : `${role.bgColor} ${role.borderColor} ${role.hoverBg} hover:border-${role.color}-400/50 hover:shadow-md`
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transform hover:scale-[1.01] active:scale-[0.99]
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <motion.div
                        animate={
                          isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }
                        }
                        transition={{ duration: 0.3 }}
                        className={`flex-shrink-0 p-2 rounded-lg ${role.bgColor}`}
                      >
                        <Icon className={`h-5 w-5 ${role.textColor}`} />
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h5
                            className={`font-semibold text-lg ${role.textColor}`}
                          >
                            {role.name}
                          </h5>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`p-1 rounded-full ${role.selectedBg}`}
                              >
                                <Check
                                  className={`h-4 w-4 ${role.textColor}`}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <p className="text-sm text-slate-300 mb-2">
                          {role.description}
                        </p>

                        {role.subDescription && (
                          <p className="text-xs text-slate-400 mb-2">
                            {role.subDescription}
                          </p>
                        )}

                        <AnimatePresence>
                          {role.warning && isSelected && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="text-xs text-red-400 mt-2 font-medium"
                            >
                              ⚠️ {role.warning}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {selectedRoleData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className={`p-4 rounded-lg ${selectedRoleData.bgColor} border ${selectedRoleData.borderColor} backdrop-blur-sm mt-6`}
                >
                  <h4 className="text-base font-medium text-slate-200 mb-3 flex items-center gap-2">
                    <selectedRoleData.icon
                      className={`h-5 w-5 ${selectedRoleData.textColor}`}
                    />
                    Selected Role Permissions:
                  </h4>
                  <div className="text-sm space-y-2">
                    <p className="text-slate-300">
                      • {selectedRoleData.description}
                    </p>
                    {selectedRoleData.subDescription && (
                      <p className="text-slate-300">
                        • {selectedRoleData.subDescription}
                      </p>
                    )}
                    {selectedRoleData.warning && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-red-400 font-medium mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        ⚠️ {selectedRoleData.warning}
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-shrink-0 gap-3 pt-4 border-t border-slate-700/50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 hover:border-slate-500 transition-all duration-200 disabled:opacity-50 px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedRole || isLoading}
            className={`
              text-white border transition-all duration-200 flex items-center gap-2 disabled:opacity-50 px-6
              ${
                selectedRoleData
                  ? `${selectedRoleData.selectedBg} border-${selectedRoleData.color}-400/70 hover:${selectedRoleData.selectedBg} hover:border-${selectedRoleData.color}-300`
                  : "bg-blue-600/80 hover:bg-blue-600 border-blue-500/50 hover:border-blue-400/70"
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : selectedRoleData ? (
              <selectedRoleData.icon className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {isLoading ? "Changing..." : "Change Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
