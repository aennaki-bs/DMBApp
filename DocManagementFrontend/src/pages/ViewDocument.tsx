import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import documentService from "@/services/documentService";

// Component imports
import DocumentTitle from "@/components/document/DocumentTitle";
import DocumentActions from "@/components/document/DocumentActions";
import DocumentTabsView from "@/components/document/DocumentTabsView";
import DocumentLoadingState from "@/components/document/DocumentLoadingState";
import DocumentNotFoundCard from "@/components/document/DocumentNotFoundCard";
import DeleteDocumentDialog from "@/components/document/DeleteDocumentDialog";

const ViewDocument = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Check if user has permissions to edit/delete documents
  const canManageDocuments =
    user?.role === "Admin" || user?.role === "FullUser";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  // Fetch document details
  const {
    data: document,
    isLoading: isLoadingDocument,
    error: documentError,
  } = useQuery({
    queryKey: ["document", Number(id)],
    queryFn: () => documentService.getDocumentById(Number(id)),
    enabled: !!id,
  });

  // Fetch lignes for this document
  const {
    data: lignes = [],
    isLoading: isLoadingLignes,
    error: lignesError,
  } = useQuery({
    queryKey: ["documentLignes", Number(id)],
    queryFn: () => documentService.getLignesByDocumentId(Number(id)),
    enabled: !!id,
  });

  // Handle errors from queries using useEffect
  useEffect(() => {
    if (documentError) {
      console.error(`Failed to fetch document with ID ${id}:`, documentError);
      toast.error("Failed to load document");
      navigate("/documents");
    }

    if (lignesError) {
      console.error(`Failed to fetch lignes for document ${id}:`, lignesError);
      toast.error("Failed to load document lignes");
    }
  }, [documentError, lignesError, id, navigate]);

  const handleDelete = async () => {
    if (!canManageDocuments) {
      toast.error("You do not have permission to delete documents");
      return;
    }

    try {
      if (document) {
        await documentService.deleteDocument(document.id);
        toast.success("Document deleted successfully");
        navigate("/documents");
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  // Add a method to handle navigation to document flow
  const handleDocumentFlow = () => {
    if (document) {
      navigate(`/documents/${document.id}/flow`);
    }
  };

  if (!id) {
    navigate("/documents");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900/20 to-blue-950/30">
      {/* Main Content */}
      <motion.main
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div
          variants={itemVariants}
          className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <DocumentTitle document={document} isLoading={isLoadingDocument} />

          {document && (
            <DocumentActions
              document={document}
              canManageDocuments={canManageDocuments}
              onDelete={() => setDeleteDialogOpen(true)}
              onDocumentFlow={handleDocumentFlow}
            />
          )}
        </motion.div>

        {isLoadingDocument ? (
          <motion.div variants={itemVariants}>
            <DocumentLoadingState />
          </motion.div>
        ) : document ? (
          <motion.div variants={itemVariants} className="mb-6">
            <DocumentTabsView
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              document={document}
              lignes={lignes}
              canManageDocuments={canManageDocuments}
              isCreateDialogOpen={isCreateDialogOpen}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
            />
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <DocumentNotFoundCard />
          </motion.div>
        )}
      </motion.main>

      {/* Delete Confirmation Dialog */}
      <DeleteDocumentDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ViewDocument;
