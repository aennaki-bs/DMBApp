import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import documentTypeService from "@/services/documentTypeService";
import subTypeService from "@/services/subTypeService";
import SubTypesList from "@/components/document-types/table/subtypes/SubTypesList";
import SubTypeManagementHeader from "@/components/sub-types/components/SubTypeManagementHeader";
import SubTypeManagementLoading from "@/components/sub-types/components/SubTypeManagementLoading";
import SubTypeManagementError from "@/components/sub-types/components/SubTypeManagementError";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers, Plus, ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/layout/PageLayout";

export default function SubTypeManagementPage() {
  const { id } = useParams<{ id: string }>();
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) {
          setError("No document type ID provided");
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);

        const docTypeId = parseInt(id);
        try {
          const docTypeData = await documentTypeService.getDocumentType(
            docTypeId
          );

          if (!docTypeData) {
            throw new Error("Document type not found");
          }

          setDocumentType(docTypeData);
        } catch (error) {
          console.error("Failed to fetch document type details:", error);
          setError("Failed to load document type data");
          toast.error("Could not fetch document type details");
        }
      } catch (error) {
        console.error("Failed to initialize subtype management page:", error);
        setError("Failed to load document type data");
        toast.error("Failed to initialize subtype management page");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle create series action from the header
  const handleCreateSeries = useCallback(() => {
    setOpenCreateDialog(true);
  }, []);

  if (isLoading) {
    return <SubTypeManagementLoading />;
  }

  if (error || !documentType) {
    return <SubTypeManagementError />;
  }

  // Only Add Series action in the header for clean design
  const pageActions = [
    {
      label: "Add Series",
      variant: "default" as const,
      icon: Plus,
      onClick: handleCreateSeries,
    },
  ];

  return (
    <div className="h-full flex flex-col gap-6 w-full" style={{ minHeight: "100%" }}>
      {/* Modern Breadcrumb Navigation */}
      <div className="flex items-center gap-2 px-6 pt-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/document-types-management")}
          className="text-muted-foreground hover:text-foreground transition-colors p-0 h-auto font-normal"
        >
          Document Types
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground font-medium">
          {documentType.typeName}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-primary font-medium">Series</span>
      </div>

      {/* Page Layout with Clean Header */}
      <div className="flex-1 min-h-0">
        <PageLayout
          title={`Manage Series: ${documentType.typeName}`}
          subtitle="Manage document series and their date ranges"
          icon={Layers}
          actions={pageActions}
        >
          <SubTypesList
            documentType={documentType}
            openCreateDialog={openCreateDialog}
            setOpenCreateDialog={setOpenCreateDialog}
          />
        </PageLayout>
      </div>
    </div>
  );
}
