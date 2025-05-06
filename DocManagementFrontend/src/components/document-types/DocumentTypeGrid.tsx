import { DocumentType } from '@/models/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DocumentTypeGridProps {
  types: DocumentType[];
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const DocumentTypeGrid = ({
  types,
  onDeleteType,
  onEditType,
  searchQuery,
  onSearchChange
}: DocumentTypeGridProps) => {
  return (
    <div className="w-full space-y-4">
      {/* Search bar has been moved to DocumentTypesHeader component */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {types.map((type) => (
          <Card key={type.id} className="bg-[#0f1642] border-blue-900/30 shadow-lg overflow-hidden hover:border-blue-700/50 transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-white">{type.typeName || 'Unnamed Type'}</CardTitle>
                <div className="flex items-center space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                          onClick={() => onEditType(type)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit document type</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 ${
                            type.documentCounter && type.documentCounter > 0
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                          }`}
                          onClick={() => type.documentCounter === 0 && type.id && onDeleteType(type.id)}
                          disabled={type.documentCounter !== undefined && type.documentCounter > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {type.documentCounter && type.documentCounter > 0
                          ? "Cannot delete types with documents"
                          : "Delete document type"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-300">Key: <span className="text-white">{type.typeKey || 'N/A'}</span></p>
              {type.typeAttr && (
                <p className="text-sm text-blue-300 mt-1">
                  Description: <span className="text-white">{type.typeAttr}</span>
                </p>
              )}
              <p className="text-sm text-blue-300 mt-2">
                Documents: <span className="text-white font-medium">{type.documentCounter || 0}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentTypeGrid;
