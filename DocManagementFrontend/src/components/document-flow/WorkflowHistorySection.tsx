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
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  User,
  MessageCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface WorkflowHistorySectionProps {
  history: DocumentCircuitHistory[];
  isLoading?: boolean;
}

export function WorkflowHistorySection({
  history = [],
  isLoading = false,
}: WorkflowHistorySectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return (
      <Card className="bg-black/30 border border-gray-800 animate-pulse">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg font-medium">
              <History className="h-5 w-5 mr-2" />
              Document Workflow History
            </CardTitle>
            <Button variant="outline" size="sm" disabled>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="bg-black/30 border border-gray-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg font-medium">
              <History className="h-5 w-5 mr-2" />
              Document Workflow History
            </CardTitle>
            <Button variant="outline" size="sm" disabled>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8 text-gray-400">
          No history available for this document
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="overflow-hidden bg-gradient-to-b from-[#1a2c6b]/50 to-[#0a1033]/50 border-b border-t border-l border-r border-blue-900/30 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-lg font-medium text-white">
                <History className="h-5 w-5 mr-2 text-blue-400" />
                Document Workflow History
              </CardTitle>
              <CardDescription className="text-blue-300/70">
                Timeline of status changes and actions ({history.length} events)
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-blue-900/50 bg-blue-900/30 hover:bg-blue-800/40 text-blue-300"
              >
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" /> Hide History
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" /> Show History
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="px-6 pb-6">
            <ScrollArea className="h-[400px] pr-4">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-blue-900/20"></div>

                <div className="space-y-6 relative">
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
                          "absolute left-0 w-10 h-10 rounded-full flex items-center justify-center",
                          historyItem.isApproved
                            ? "bg-gradient-to-br from-green-500/30 to-blue-500/20 border border-green-500/30"
                            : "bg-gradient-to-br from-amber-500/30 to-blue-500/20 border border-amber-500/30"
                        )}
                      >
                        {historyItem.isApproved ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-amber-500" />
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
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <span className="text-base font-medium text-white">
                                  {historyItem.statusTitle}
                                </span>
                                {historyItem.actionTitle &&
                                  historyItem.actionTitle !== "N/A" && (
                                    <Badge className="ml-2 bg-blue-900/50 text-blue-200">
                                      {historyItem.actionTitle}
                                    </Badge>
                                  )}
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "ml-2",
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

                            <div className="flex items-center gap-4 mb-2 text-sm">
                              <div className="flex items-center text-gray-400">
                                <User className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                                <span>
                                  {historyItem.processedBy || "System"}
                                </span>
                              </div>

                              <div className="flex items-center text-gray-400">
                                <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                                <span>
                                  {format(
                                    new Date(historyItem.processedAt),
                                    "PPp"
                                  )}
                                </span>
                              </div>
                            </div>

                            {historyItem.comments && (
                              <div className="mt-2 p-3 bg-blue-900/20 rounded-md border border-blue-900/30">
                                <div className="flex items-center text-blue-300 text-xs mb-1">
                                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Comments:
                                </div>
                                <div className="text-sm text-gray-300 whitespace-pre-wrap">
                                  {historyItem.comments}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
