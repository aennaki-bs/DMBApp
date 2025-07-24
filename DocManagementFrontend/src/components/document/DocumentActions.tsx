import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash, GitBranch, Activity, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document } from "@/models/document";
import AssignCircuitDialog from "@/components/circuits/AssignCircuitDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkflowDialogButton } from "@/components/document-flow/WorkflowDialogButton";
import { useDocumentEditingStatus } from "@/hooks/useDocumentEditingStatus";

interface DocumentActionsProps {
  document: Document;
  canManageDocuments: boolean;
  onDelete: () => void;
  onDocumentFlow: () => void;
  onWorkflowUpdate?: () => void;
  onShowHistory?: () => void;
  historyCount?: number;
}

const DocumentActions = ({
  document,
  canManageDocuments,
  onDelete,
  onDocumentFlow,
  onWorkflowUpdate,
  onShowHistory,
  historyCount = 0,
}: DocumentActionsProps) => {
  const [isAssignCircuitOpen, setIsAssignCircuitOpen] = useState(false);

  // Check if document editing should be disabled due to pending approval
  const { isEditingDisabled, disabledReason } = useDocumentEditingStatus(document.id);

  // Check if document is waiting for approval (from the new isWaitingForApproval field)
  const isWaitingForApproval = document.isWaitingForApproval || false;
  
  // Check if document is fully archived (read-only)
  const isFullyArchived = document.erpDocumentCode;
  
  // Combine both conditions for disabling edit/delete actions
  const shouldDisableActions = isEditingDisabled || isWaitingForApproval;
  const actionDisabledReason = isWaitingForApproval 
    ? "Document is waiting for approval and cannot be modified" 
    : disabledReason;

  // Refresh the page after circuit assignment
  const handleCircuitAssigned = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="flex space-x-3">
        {document.circuitId && (
          <WorkflowDialogButton
            documentId={document.id}
            hasCircuit={!!document.circuitId}
            buttonClassName="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
            title="Execute Step"
            onWorkflowUpdate={onWorkflowUpdate}
          />
        )}

        {/* Show History Button */}
        {onShowHistory && (
          <Button
            variant="outline"
            className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50 flex items-center gap-2"
            onClick={onShowHistory}
          >
            <History className="h-4 w-4" />
            Show History
            {historyCount > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </Button>
        )}

        {/* Show Assign to Circuit button when document has no circuit and user can manage documents */}
        {!document.circuitId && canManageDocuments && !isFullyArchived && (
          <Button
            variant="outline"
            className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50 flex items-center gap-2"
            onClick={() => setIsAssignCircuitOpen(true)}
          >
            <GitBranch className="h-4 w-4 mr-2" /> Assign to Circuit
          </Button>
        )}

        {canManageDocuments && !isFullyArchived && (
          <>
            {shouldDisableActions ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-blue-400/30 text-blue-300 opacity-60 cursor-not-allowed flex items-center gap-2"
                      disabled
                    >
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 border-blue-500/30 text-blue-300">
                    <p>{actionDisabledReason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="outline"
                className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50 flex items-center gap-2"
                asChild
              >
                <Link to={`/documents/${document.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Link>
              </Button>
            )}

            {shouldDisableActions ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      className="bg-red-600/40 opacity-60 cursor-not-allowed flex items-center gap-2"
                      disabled
                    >
                      <Trash className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 border-red-500/30 text-red-300">
                    <p>{actionDisabledReason}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="destructive"
                className="bg-red-600/80 hover:bg-red-700/80 flex items-center gap-2"
                onClick={onDelete}
              >
                <Trash className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
          </>
        )}

        {/* Show read-only message for archived documents */}
        {isFullyArchived && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="border-orange-400/30 text-orange-300 opacity-60 cursor-not-allowed flex items-center gap-2"
                    disabled
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-red-600/40 opacity-60 cursor-not-allowed flex items-center gap-2"
                    disabled
                  >
                    <Trash className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border-orange-500/30 text-orange-300">
                <p>Document is fully archived and cannot be modified</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {!canManageDocuments && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    className="border-blue-400/30 text-blue-300 opacity-60 cursor-not-allowed flex items-center gap-2"
                    disabled
                  >
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900 border-blue-500/30 text-blue-300">
                <p>Only Admin or FullUser can edit documents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

            {/* Assign Circuit Dialog - only show for non-archived documents */}
      {!isFullyArchived && (
        <AssignCircuitDialog
          documentId={document.id}
          documentKey={document.documentKey}
          documentTypeId={document.typeId}
          open={isAssignCircuitOpen}
          onOpenChange={setIsAssignCircuitOpen}
          onSuccess={handleCircuitAssigned}
        />
      )}
    </>
  );
};

export default DocumentActions;
