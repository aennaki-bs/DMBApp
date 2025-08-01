import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, GitBranch } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Document } from "@/models/document";

interface DocumentEditHeaderProps {
  document: Document | null;
  documentId: string | number;
  onBack: () => void;
  onDocumentFlow: () => void;
}

const DocumentEditHeader: React.FC<DocumentEditHeaderProps> = ({
  document,
  documentId,
  onBack,
  onDocumentFlow,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/documents"
                    className="text-blue-400/80 hover:text-blue-300"
                  >
                    {t('nav.documents')}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to={`/documents/${documentId}`}
                    className="text-blue-400/80 hover:text-blue-300"
                  >
                    {document?.documentKey || documentId}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <span className="text-blue-100">{t('common.edit')}</span>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-3xl font-bold text-white mt-2">{t('documents.editDocument')}</h1>
        </div>

        <div className="flex space-x-3">
                      <Button
              variant="outline"
              size="lg"
              onClick={onBack}
              className="border-blue-900/30 text-white hover:bg-blue-900/20"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> {t('documents.backToDocument')}
            </Button>
        </div>
      </div>

      {document && (
        <div className="flex items-center">
          <p className="text-sm text-gray-400">
            {t('documents.lastUpdatedAt')}: {new Date(document.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentEditHeader;
