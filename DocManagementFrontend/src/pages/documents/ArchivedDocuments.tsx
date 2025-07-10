import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import { Document } from "@/models/document";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Archive, FileText, Calendar, User, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const ArchivedDocuments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Fetch archived documents
  const {
    data: archivedDocuments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["archivedDocuments"],
    queryFn: () => documentService.getArchivedDocuments(),
    staleTime: 30000, // 30 seconds
  });

  // Filter documents based on search query
  const filteredDocuments = archivedDocuments.filter((doc) =>
    doc.documentKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.documentType?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.createdBy?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.erpDocumentCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate filtered documents
  const getPageDocuments = () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredDocuments.slice(start, end);
  };

  useEffect(() => {
    setTotalPages(Math.ceil(filteredDocuments.length / pageSize));
    setPage(1); // Reset to first page when search changes
  }, [filteredDocuments, pageSize]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Archived Documents"
          description="View documents that have been archived to ERP"
          icon={<Archive className="h-6 w-6" />}
        />
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader
          title="Archived Documents"
          description="View documents that have been archived to ERP"
          icon={<Archive className="h-6 w-6" />}
        />
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              Error loading archived documents. Please try again.
            </div>
            <div className="text-center mt-4">
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="Archived Documents"
        description="View documents that have been completed and archived to ERP"
        icon={<Archive className="h-6 w-6" />}
      />

      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Search Archived Documents</h3>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {archivedDocuments.length} archived documents
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search by document key, title, type, creator, or ERP code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  {searchQuery ? "No archived documents found" : "No archived documents"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Documents will appear here once they complete their circuit and are archived to ERP"
                  }
                </p>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {getPageDocuments().map((document) => (
                    <motion.div
                      key={document.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium text-lg">{document.documentKey}</span>
                            </div>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              <Archive className="h-3 w-3 mr-1" />
                              Archived to ERP
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-xl">{document.title}</h3>

                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>{document.documentType?.title}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{document.createdBy?.username}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(document.docDate)}</span>
                            </div>
                            {document.responsibilityCentre && (
                              <div className="flex items-center gap-1">
                                <Building className="h-4 w-4" />
                                <span>{document.responsibilityCentre.title}</span>
                              </div>
                            )}
                          </div>

                          {document.erpDocumentCode && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">ERP Code:</span>
                              <Badge variant="secondary" className="font-mono">
                                {document.erpDocumentCode}
                              </Badge>
                            </div>
                          )}

                          <div className="text-xs text-muted-foreground">
                            Archived: {formatDateTime(document.updatedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/documents/${document.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => handlePageChange(pageNumber)}
                          isActive={pageNumber === page}
                          className="cursor-pointer"
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArchivedDocuments; 