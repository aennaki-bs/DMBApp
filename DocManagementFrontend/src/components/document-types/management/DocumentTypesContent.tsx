
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DocumentType } from '@/models/document';
import DocumentTypeTable from '@/components/document-types/DocumentTypeTable';
import DocumentTypeGrid from '@/components/document-types/DocumentTypeGrid';
import EmptyState from '@/components/document-types/EmptyState';
import LoadingState from '@/components/document-types/LoadingState';
import DocumentTypesPagination from '@/components/document-types/DocumentTypesPagination';

interface DocumentTypesContentProps {
  isLoading: boolean;
  types: DocumentType[];
  viewMode: 'table' | 'grid';
  selectedTypes: number[];
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  onSelectType: (id: number, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  filteredAndSortedTypes: DocumentType[];
}

const DocumentTypesContent = ({
  isLoading,
  types,
  viewMode,
  selectedTypes,
  onDeleteType,
  onEditType,
  onSelectType,
  onSelectAll,
  searchQuery,
  setSearchQuery,
  sortField,
  sortDirection,
  handleSort,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredAndSortedTypes
}: DocumentTypesContentProps) => {
  if (isLoading) {
    return <LoadingState />;
  }

  if (types.length === 0) {
    return <EmptyState onAddType={() => {}} />;
  }

  return (
    <div className="flex-1 overflow-hidden px-3 md:px-6 py-3">
      <Card className="bg-[#0f1642] border-blue-900/30 shadow-xl h-full flex flex-col">
        <CardHeader className="py-3 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-lg text-white">Document Types</CardTitle>
              <CardDescription className="text-sm text-blue-300">
                {filteredAndSortedTypes.length} {filteredAndSortedTypes.length === 1 ? 'type' : 'types'} {searchQuery ? 'found' : 'available'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="h-[calc(100vh-230px)] w-full flex-1 overflow-auto">
            <div className="min-w-full">
              {viewMode === 'table' ? (
                <DocumentTypeTable 
                  types={types}
                  selectedTypes={selectedTypes}
                  onSelectType={onSelectType}
                  onSelectAll={onSelectAll}
                  onDeleteType={onDeleteType}
                  onEditType={onEditType}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              ) : (
                <DocumentTypeGrid
                  types={types}
                  onDeleteType={onDeleteType}
                  onEditType={onEditType}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}
            </div>
          </ScrollArea>
          
          <div className="mt-auto border-t border-blue-900/30">
            <DocumentTypesPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentTypesContent;
