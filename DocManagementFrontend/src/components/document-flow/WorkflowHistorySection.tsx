import { useState } from 'react';
import { DocumentCircuitHistory } from '@/models/documentCircuit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Clock, CheckCircle, AlertCircle, History } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';

interface WorkflowHistorySectionProps {
  history: DocumentCircuitHistory[];
  isLoading?: boolean;
}

export function WorkflowHistorySection({ 
  history = [], 
  isLoading = false 
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
      <Card className="overflow-hidden bg-gradient-to-b from-black/70 to-black/40 border-b border-t border-l border-r border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-lg font-medium">
                <History className="h-5 w-5 mr-2" />
                Document Workflow History
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Timeline of status changes and actions
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
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
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {history.map((historyItem) => (
                  <div key={historyItem.id} className="flex items-start gap-3 border-b border-white/10 pb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      {historyItem.isApproved ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-white">
                          {historyItem.statusTitle}
                          {historyItem.actionTitle && historyItem.actionTitle !== 'N/A' && ` - ${historyItem.actionTitle}`}
                        </div>
                        <div className="flex items-center text-xs text-gray-400 space-x-2">
                          <span>{historyItem.processedBy || 'System'}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(historyItem.processedAt), 'PPp')}
                          </span>
                        </div>
                        {historyItem.comments && (
                          <div className="mt-1 text-sm text-gray-300 whitespace-pre-wrap">
                            {historyItem.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
} 