import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import documentTypeService from "@/services/documentTypeService";
import subTypeService from "@/services/subTypeService";
import SubTypesList from "@/components/document-types/table/subtypes/SubTypesList";
import SubTypeManagementHeader from "@/components/sub-types/components/SubTypeManagementHeader";
import SubTypeManagementLoading from "@/components/sub-types/components/SubTypeManagementLoading";
import SubTypeManagementError from "@/components/sub-types/components/SubTypeManagementError";
import { toast } from "sonner";
import { DocumentType } from "@/models/document";

export default function SubTypeManagementPage() {
  const { id } = useParams<{ id: string }>();
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        console.log("Fetching document type data for ID:", id);

        const docTypeId = parseInt(id);
        try {
          const docTypeData = await documentTypeService.getDocumentType(
            docTypeId
          );
          console.log("Document type data received:", docTypeData);

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

  if (isLoading) {
    return <SubTypeManagementLoading />;
  }

  if (error || !documentType) {
    return <SubTypeManagementError />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* <SubTypeManagementHeader documentType={documentType} /> */}
      <SubTypesList documentType={documentType} />
    </div>
  );
}
