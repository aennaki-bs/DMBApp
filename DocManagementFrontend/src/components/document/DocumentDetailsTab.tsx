import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Clock, GitBranch, Tag, Loader2, ChevronDown, ChevronUp, History } from 'lucide-react';
import { Document } from '@/models/document';
import { WorkflowStatus } from '@/services/workflowService';
import { ApprovalHistoryItem } from '@/services/approvalService';
import { Separator } from '@/components/ui/separator';
import { getStatusClass } from './DocumentStatusUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DocumentApprovalDetails from './DocumentApprovalDetails';
import api from '@/services/api';

interface DocumentDetailsTabProps {
  document: Document;
  workflowStatus?: WorkflowStatus;
  isLoadingWorkflow?: boolean;
  pendingApproval?: ApprovalHistoryItem;
  approvalHistory?: ApprovalHistoryItem[];
  isLoadingApproval?: boolean;
}

const DocumentDetailsTab = ({ 
  document, 
  workflowStatus, 
  isLoadingWorkflow,
  pendingApproval,
  approvalHistory,
  isLoadingApproval
}: DocumentDetailsTabProps) => {
  const [circuitKey, setCircuitKey] = useState<string>('');
  const [isLoadingCircuitKey, setIsLoadingCircuitKey] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Get formatted progress display
  const progressDisplay = workflowStatus?.progressPercentage 
    ? `${workflowStatus.progressPercentage}%` 
    : "25% complete";

  // Fetch circuit key when circuitId is available
  useEffect(() => {
    const fetchCircuitKey = async () => {
      const circuitIdToFetch = workflowStatus?.circuitId || document.circuitId;
      if (!circuitIdToFetch) return;

      try {
        setIsLoadingCircuitKey(true);
        const response = await api.get(`/Circuit/${circuitIdToFetch}`);
        setCircuitKey(response.data.circuitKey || '');
      } catch (error) {
        console.error('Error fetching circuit details:', error);
        setCircuitKey(''); // Reset on error
      } finally {
        setIsLoadingCircuitKey(false);
      }
    };

    fetchCircuitKey();
  }, [workflowStatus?.circuitId, document.circuitId]);

  // Fetch document circuit history
  useEffect(() => {
    const fetchDocumentHistory = async () => {
      if (!document.id) return;

      try {
        setIsLoadingHistory(true);
        const response = await api.get(`/Workflow/document/${document.id}/history`);
        setDocumentHistory(response.data || []);
      } catch (error) {
        console.error('Error fetching document history:', error);
        setDocumentHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchDocumentHistory();
  }, [document.id]);

  return (
    <div className={`overflow-hidden border-l-4 bg-gradient-to-br ${getStatusClass(document.status)} shadow-xl rounded-lg`}>
      <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/20 border-b border-white/5 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-300" />
            Document Details
          </h2>
          <p className="text-sm text-blue-300/80 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: {new Date(document.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="p-6 text-blue-100">
        {/* Approval Details Component */}
        <DocumentApprovalDetails 
          pendingApproval={pendingApproval} 
          approvalHistory={approvalHistory}
          isLoadingApproval={isLoadingApproval}
        />

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Document Type</h3>
            <p className="font-medium">{document.documentType.typeName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Document Date</h3>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-400" />
              {new Date(document.docDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Comptable Date</h3>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4 text-blue-400" />
              22/05/2025
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Stump</h3>
            <p className="font-medium flex items-center gap-1">
              <Tag className="h-4 w-4 text-blue-400" />
              abc
            </p>
            <p className="text-sm text-blue-300/70 mt-1">Key: AVAB26</p>
            <p className="text-sm text-blue-300/70">
              Valid: 19/05/2025 - 19/05/2026
            </p>
          </div>
          
          {/* Circuit section with workflow status data */}
          {(document.circuitId || workflowStatus) && (
            <div>
              <h3 className="text-sm font-medium text-blue-300 mb-1">Circuit</h3>
              {isLoadingWorkflow ? (
                <div className="flex items-center gap-2 text-blue-300/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading workflow information...
                </div>
              ) : workflowStatus ? (
                <>
                  <p className="font-medium flex items-center gap-1">
                    <GitBranch className="h-4 w-4 text-blue-400" />
                    {workflowStatus.circuitTitle}
                  </p>
                  <p className="text-sm text-blue-300/70 mt-1">
                    Code: {isLoadingCircuitKey ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      circuitKey || workflowStatus.circuitId
                    )}
                  </p>
                  <p className="text-sm text-blue-300/70">
                    Current Status: {workflowStatus.currentStatusTitle || "Processing"}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-blue-950/40 rounded-full h-2">
                      {/* <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: progressDisplay }}
                      ></div> */}
                    </div>
                    {/* <p className="text-xs text-blue-300/70 mt-1 text-right">
                      {progressDisplay}
                    </p> */}
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium flex items-center gap-1">
                    <GitBranch className="h-4 w-4 text-blue-400" />
                    {document.circuit?.title || "Unknown Circuit"}
                  </p>
                  <p className="text-sm text-blue-300/70 mt-1">
                    Code: {isLoadingCircuitKey ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      circuitKey || "N/A"
                    )}
                  </p>
                  <p className="text-sm text-blue-300/70">
                    Current Status: Processing
                  </p>
                </>
              )}
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Created By</h3>
            <p className="font-medium flex items-center gap-1">
              <User className="h-4 w-4 text-blue-400" />
              {document.createdBy.firstName} {document.createdBy.lastName}
            </p>
            <p className="text-sm text-blue-300/70">({document.createdBy.username})</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Created At</h3>
            <p className="font-medium flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-400" />
              {new Date(document.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        
        <Separator className="my-6 bg-blue-400/20" />
        
        <div>
          <h3 className="text-sm font-medium text-blue-300 mb-3">Content</h3>
          <div className="p-4 bg-blue-950/40 rounded-md min-h-[200px] whitespace-pre-wrap border border-blue-400/20">
            {document.content || "No content available."}
          </div>
        </div>

        <Separator className="my-6 bg-blue-400/20" />

        {/* Document Circuit History Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-blue-300 flex items-center gap-2">
              <History className="h-4 w-4" />
              Document Circuit History
              {documentHistory.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {documentHistory.length} entries
                </Badge>
              )}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="border-blue-500/30 text-blue-300 hover:bg-blue-900/20 h-8"
            >
              {showHistory ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Hide History
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show History
                </>
              )}
            </Button>
          </div>

          {showHistory && (
            <div className="p-4 bg-blue-950/40 rounded-md border border-blue-400/20">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-blue-500 animate-spin mr-2" />
                  <span className="text-blue-300">Loading circuit history...</span>
                </div>
              ) : documentHistory.length > 0 ? (
                <div className="space-y-4">
                  {documentHistory.map((entry, index) => (
                    <div 
                      key={entry.id || index} 
                      className="p-3 bg-blue-900/30 rounded-md border border-blue-800/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={entry.isApproved ? "default" : "destructive"}
                            className={entry.isApproved ? "bg-green-700" : "bg-red-700"}
                          >
                            {entry.isApproved ? "Approved" : "Rejected"}
                          </Badge>
                          <span className="text-sm font-medium text-blue-200">
                            {entry.stepTitle || "Unknown Step"}
                          </span>
                        </div>
                        <span className="text-xs text-blue-400">
                          {new Date(entry.processedAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="text-sm text-blue-300 mb-2">
                        <span className="font-medium">Status:</span> {entry.statusTitle || "N/A"}
                      </div>
                      
                      <div className="text-sm text-blue-300 mb-2">
                        <span className="font-medium">Processed by:</span> {entry.processedBy || "Unknown"}
                      </div>
                      
                      {entry.comments && (
                        <div className="text-sm text-blue-200 bg-blue-800/20 p-2 rounded border-l-2 border-blue-500/50">
                          <span className="font-medium text-blue-300">Comments:</span>
                          <p className="mt-1">{entry.comments}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-blue-400">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No circuit history available for this document.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailsTab;
