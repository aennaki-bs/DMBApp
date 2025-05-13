import { useState } from "react";
import { DocumentCircuitHistory } from "@/models/documentCircuit";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  User,
  MessageCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WorkflowHistorySectionProps {
  history: DocumentCircuitHistory[];
  isLoading?: boolean;
}

export function WorkflowHistorySection({
  history = [],
  isLoading = false,
}: WorkflowHistorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Count of approved/completed items
  const completedCount = history.filter((item) => item.isApproved).length;

  return (
    <>
      {/* Floating History Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg hover:shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-600 p-0 flex items-center justify-center relative"
        >
          <History className="h-6 w-6" />
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {completedCount}
            </span>
          )}
        </Button>
      </div>

      {/* History Modal/Dialog */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 right-0 top-0 z-50 mx-auto max-w-3xl"
            >
              <Card className="border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 shadow-2xl shadow-blue-500/10 m-4 overflow-hidden">
                <CardHeader className="pb-2 border-b border-blue-900/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-lg font-medium text-white">
                        <History className="h-5 w-5 mr-2 text-blue-400" />
                        Document Workflow History
                      </CardTitle>
                      <CardDescription className="text-blue-300/70">
                        Timeline of status changes and actions ({history.length}{" "}
                        events)
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="rounded-full h-8 w-8 hover:bg-blue-900/40"
                    >
                      <X className="h-4 w-4 text-blue-300" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No history available for this document
                    </div>
                  ) : (
                    <ScrollArea className="h-[70vh] max-h-[600px] pr-4">
                      <div className="space-y-3 relative">
                        {/* Timeline line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-blue-900/20"></div>

                        {history.map((historyItem, index) => (
                          <motion.div
                            key={historyItem.id}
                            className="relative pl-12"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            {/* Timeline dot */}
                            <div
                              className={cn(
                                "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center",
                                historyItem.isApproved
                                  ? "bg-gradient-to-br from-green-500/30 to-blue-500/20 border border-green-500/30"
                                  : "bg-gradient-to-br from-amber-500/30 to-blue-500/20 border border-amber-500/30"
                              )}
                            >
                              {historyItem.isApproved ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>

                            {/* Content card */}
                            <Card
                              className={cn(
                                "overflow-hidden border transition-all duration-200",
                                historyItem.isApproved
                                  ? "border-green-500/20 bg-gradient-to-r from-green-900/10 to-blue-900/5"
                                  : "border-amber-500/20 bg-gradient-to-r from-amber-900/10 to-blue-900/5"
                              )}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">
                                      {historyItem.statusTitle}
                                    </span>
                                    {historyItem.actionTitle &&
                                      historyItem.actionTitle !== "N/A" && (
                                        <Badge className="bg-blue-900/50 text-blue-200 text-xs">
                                          {historyItem.actionTitle}
                                        </Badge>
                                      )}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      historyItem.isApproved
                                        ? "border-green-500/30 text-green-400 bg-green-900/20"
                                        : "border-amber-500/30 text-amber-400 bg-amber-900/20"
                                    )}
                                  >
                                    {historyItem.isApproved
                                      ? "Approved"
                                      : "Pending"}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-4 text-xs mb-2">
                                  <div className="flex items-center text-gray-400">
                                    <User className="h-3 w-3 mr-1 text-blue-400" />
                                    <span>
                                      {historyItem.processedBy || "System"}
                                    </span>
                                  </div>

                                  <div className="flex items-center text-gray-400">
                                    <Clock className="h-3 w-3 mr-1 text-blue-400" />
                                    <span>
                                      {format(
                                        new Date(historyItem.processedAt),
                                        "MMM d, HH:mm"
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {historyItem.comments && (
                                  <div className="mt-1 p-2 bg-blue-900/20 rounded-md border border-blue-900/30">
                                    <div className="flex items-center text-blue-300 text-xs mb-1">
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      Comments:
                                    </div>
                                    <div className="text-xs text-gray-300">
                                      {historyItem.comments}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
