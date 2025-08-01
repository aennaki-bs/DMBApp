import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Document, Ligne } from "@/models/document";
import { WorkflowStatus } from "@/services/workflowService";
import { ApprovalHistoryItem, ApprovalInfo } from "@/services/approvalService";
import DocumentDetailsTab from "./DocumentDetailsTab";
import DocumentLinesTab from "./DocumentLinesTab";
import { useTranslation } from "@/hooks/useTranslation";

interface DocumentTabsViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  document: Document;
  lignes: Ligne[];
  canManageDocuments: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  workflowStatus?: WorkflowStatus;
  isLoadingWorkflow?: boolean;
  pendingApproval?: ApprovalHistoryItem;
  approvalHistory?: ApprovalHistoryItem[];
  isLoadingApproval?: boolean;
}

const DocumentTabsView = ({
  activeTab,
  setActiveTab,
  document,
  lignes,
  canManageDocuments,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  workflowStatus,
  isLoadingWorkflow,
  pendingApproval,
  approvalHistory,
  isLoadingApproval
}: DocumentTabsViewProps) => {
  const { t } = useTranslation();
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
      <TabsList className="bg-gradient-to-r from-background/50 via-background/30 to-background/50 backdrop-blur-xl border border-border/50 w-full grid grid-cols-2 p-1 h-auto shadow-lg sticky top-0 z-10 flex-shrink-0">
        <TabsTrigger
          value="details"
          className="py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary/60 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg"
        >
          <FileText className="h-4 w-4 mr-2" />
          {t('documents.documentDetails')}
        </TabsTrigger>
        <TabsTrigger
          value="lignes"
          className="py-3 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/80 data-[state=active]:to-primary/60 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-300 rounded-lg"
        >
          <Layers className="h-4 w-4 mr-2" />
          {t('documents.lines')}
          <Badge 
            variant="secondary" 
            className="ml-2 bg-primary/20 text-primary border-primary/30 text-xs font-medium"
          >
            {lignes?.length || 0}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-2 flex-1 min-h-0">
        <DocumentDetailsTab
          document={document}
          workflowStatus={workflowStatus}
          isLoadingWorkflow={isLoadingWorkflow}
          pendingApproval={pendingApproval}
          approvalHistory={approvalHistory}
          isLoadingApproval={isLoadingApproval}
        />
      </TabsContent>

      <TabsContent value="lignes" className="mt-2 flex-1 min-h-0">
        <DocumentLinesTab
          document={document}
          lignes={lignes}
          canManageDocuments={canManageDocuments}
          isCreateDialogOpen={isCreateDialogOpen}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
        />
      </TabsContent>
    </Tabs>
  );
};

export default DocumentTabsView;
