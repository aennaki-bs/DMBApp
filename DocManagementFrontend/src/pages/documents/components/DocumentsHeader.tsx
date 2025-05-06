import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, AlertCircle, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CreateDocumentModal } from "@/components/create-document/CreateDocumentModal";
import AddToCircuitButton from "@/components/circuits/AddToCircuitButton";

interface DocumentsHeaderProps {
  useFakeData: boolean;
  fetchDocuments: () => void;
  canManageDocuments: boolean;
  selectedDocuments: number[];
  openDeleteDialog: () => void;
  openAssignCircuitDialog: (documentId: number) => void;
}

export default function DocumentsHeader({
  useFakeData,
  fetchDocuments,
  canManageDocuments,
  selectedDocuments,
  openDeleteDialog,
  openAssignCircuitDialog,
}: DocumentsHeaderProps) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
        <p className="text-blue-300/80">Manage your documents and files</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {useFakeData && (
          <Button
            variant="outline"
            onClick={fetchDocuments}
            className="border-amber-500/50 text-amber-500 hover:bg-amber-500/20"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Using Test Data
          </Button>
        )}
        {canManageDocuments ? (
          <>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> New Document
            </Button>

            {selectedDocuments.length === 1 && (
              <Button
                variant="outline"
                className="border-blue-500/50 text-blue-500 hover:bg-blue-500/20"
                onClick={() => openAssignCircuitDialog(selectedDocuments[0])}
              >
                <GitBranch className="mr-2 h-4 w-4" /> Assign to Circuit
              </Button>
            )}
          </>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" disabled>
                  <Plus className="mr-2 h-4 w-4" /> New Document
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#0a1033]/90 border-blue-900/50">
                <p>Only Admin or FullUser can create documents</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {canManageDocuments && selectedDocuments.length > 0 && (
          <Button variant="destructive" onClick={openDeleteDialog}>
            <Plus className="mr-2 h-4 w-4" /> Delete Selected (
            {selectedDocuments.length})
          </Button>
        )}
      </div>

      {/* Create Document Modal */}
      <CreateDocumentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onDocumentCreated={fetchDocuments}
      />
    </div>
  );
}
