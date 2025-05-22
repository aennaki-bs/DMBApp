import { FileText, Calendar, User, Clock, GitBranch, Tag, Loader2 } from 'lucide-react';
import { Document } from '@/models/document';
import { WorkflowStatus } from '@/services/workflowService';
import { ApprovalHistoryItem } from '@/services/approvalService';
import { Separator } from '@/components/ui/separator';
import { getStatusClass } from './DocumentStatusUtils';
import { Badge } from '@/components/ui/badge';
import DocumentApprovalDetails from './DocumentApprovalDetails';

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
  // Get formatted progress display
  const progressDisplay = workflowStatus?.progressPercentage 
    ? `${workflowStatus.progressPercentage}%` 
    : "25% complete";

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
          {document.comptableDate && (
            <div>
              <h3 className="text-sm font-medium text-blue-300 mb-1">Comptable Date</h3>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-400" />
                {new Date(document.comptableDate).toLocaleDateString()}
              </p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-blue-300 mb-1">Stump</h3>
            <p className="font-medium flex items-center gap-1">
              <Tag className="h-4 w-4 text-blue-400" />
              {document.subType?.name || "No stump assigned"}
            </p>
            {document.subType && (
              <>
                <p className="text-sm text-blue-300/70 mt-1">Key: {document.subType.subTypeKey}</p>
                <p className="text-sm text-blue-300/70">
                  Valid: {new Date(document.subType.startDate).toLocaleDateString()} - {new Date(document.subType.endDate).toLocaleDateString()}
                </p>
              </>
            )}
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
                    Code: {workflowStatus.circuitId}
                  </p>
                  <p className="text-sm text-blue-300/70">
                    Current Status: {workflowStatus.currentStatusTitle || "Processing"}
                  </p>
                  <div className="mt-2">
                    <div className="w-full bg-blue-950/40 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: progressDisplay }}
                      ></div>
                    </div>
                    <p className="text-xs text-blue-300/70 mt-1 text-right">
                      {progressDisplay}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium flex items-center gap-1">
                    <GitBranch className="h-4 w-4 text-blue-400" />
                    {document.circuitName || "Unknown Circuit"}
                  </p>
                  <p className="text-sm text-blue-300/70 mt-1">
                    {document.circuitCode && `Code: ${document.circuitCode}`}
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
      </div>
    </div>
  );
};

export default DocumentDetailsTab;
