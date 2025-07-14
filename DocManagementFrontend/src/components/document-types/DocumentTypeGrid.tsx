import { DocumentType } from "@/models/document";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Edit2, Trash2, ChevronRight, Layers, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  onSearchChange,
}: DocumentTypeGridProps) => {
  const navigate = useNavigate();

  // Clean and format the type name to handle edge cases
  const getDisplayTypeName = (typeName?: string) => {
    if (!typeName || typeName.trim() === '') {
      return "Unnamed Type";
    }

    // Clean the type name by removing unwanted numeric suffixes
    let cleanName = typeName.trim();

    // Very aggressive cleaning to handle all possible patterns:

    // 1. Remove numbers directly attached to the end (like "Name0", "Name123")
    cleanName = cleanName.replace(/\d+$/, '');

    // 2. Remove trailing spaces and numbers (like " 0 0", " 1 2 3", etc.)
    cleanName = cleanName.replace(/(\s+\d+)+\s*$/, '');

    // 3. Remove any remaining standalone numbers at the end
    cleanName = cleanName.replace(/\s+\d+$/, '');

    // 4. Remove multiple spaces and clean up
    cleanName = cleanName.replace(/\s+/g, ' ');

    // 5. Remove any trailing zeros specifically (with or without spaces)
    cleanName = cleanName.replace(/\s*0+\s*$/, '');

    // 6. Final cleanup of any remaining numbers at the end
    cleanName = cleanName.replace(/[\s\d]*$/, '').trim();

    // If the name is empty after cleaning, it was probably all numbers
    if (!cleanName || cleanName.trim() === '') {
      return "Unnamed Type";
    }

    // Final trim
    cleanName = cleanName.trim();

    // Check for numeric-only values like "00", "0", etc.
    if (/^\d+$/.test(cleanName)) {
      return `Type ${cleanName}`;
    }

    // Check for very short or invalid names after cleaning
    if (cleanName.length < 2) {
      return "Unnamed Type";
    }

    return cleanName;
  };

  // Handle card click to navigate to subtypes page
  const handleCardClick = (type: DocumentType) => {
    // Allow navigation to series for all document types
    if (type.id) {
      navigate(`/document-types/${type.id}/subtypes`);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search bar has been moved to DocumentTypesHeader component */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {types.map((type) => {
          // Check if type has documents for display purposes only
          const hasDocuments = type.documentCounter && type.documentCounter > 0;

          return (
            <TooltipProvider key={type.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Card
                    className="bg-[#0f1642] border-blue-900/30 shadow-lg overflow-hidden transition-all group relative cursor-pointer hover:border-blue-500/70 hover:shadow-xl hover:shadow-blue-500/20 transform hover:scale-[1.02]"
                    onClick={() => handleCardClick(type)}
                  >
                    <div className="absolute inset-0 transition-colors bg-blue-500/0 group-hover:bg-blue-500/10"></div>
                    <CardHeader className="pb-2 relative z-10">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg text-white group-hover:text-blue-100 transition-colors flex items-center gap-2">
                          <Eye className="h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                          <span className="group-hover:underline underline-offset-4">
                            {getDisplayTypeName(type.typeName)}
                          </span>
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditType(type);
                                  }}
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
                                  className={`h-8 w-8 ${type.documentCounter && type.documentCounter > 0
                                    ? "text-gray-500 cursor-not-allowed"
                                    : "text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    type.documentCounter === 0 &&
                                      type.id &&
                                      onDeleteType(type.id);
                                  }}
                                  disabled={
                                    type.documentCounter !== undefined &&
                                    type.documentCounter > 0
                                  }
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
                      <p className="text-sm text-blue-300">
                        Key: <span className="text-white">{type.typeKey || "N/A"}</span>
                      </p>
                      {type.typeAttr && (
                        <p className="text-sm text-blue-300 mt-1">
                          Description:{" "}
                          <span className="text-white">{type.typeAttr}</span>
                        </p>
                      )}
                      <p className="text-sm text-blue-300 mt-2">
                        Documents:{" "}
                        <span className="text-white font-medium">
                          {type.documentCounter || 0}
                        </span>
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 pb-3 opacity-70 group-hover:opacity-100 transition-all duration-200 relative z-10">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center text-blue-300 group-hover:text-blue-200 text-sm font-medium transition-colors">
                          <Eye className="h-4 w-4 mr-2" />
                          <span>Click to View Series</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      </div>
                    </CardFooter>
                  </Card>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to manage series for this document type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentTypeGrid;
