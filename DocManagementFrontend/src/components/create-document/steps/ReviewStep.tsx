import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  Tag,
  Layers,
  FileSignature,
  Edit,
  Check,
  Copy,
  Calculator,
  Share2,
} from "lucide-react";
import { format } from "date-fns";

interface ReviewStepProps {
  selectedType: DocumentType | undefined;
  selectedSubType: SubType | undefined;
  documentAlias: string;
  title: string;
  docDate: string;
  comptableDate: string | null;
  content: string;
  circuitName: string;
  onEditTypeClick: () => void;
  onEditDetailsClick: () => void;
  onEditDateClick: () => void;
  onEditContentClick: () => void;
  onEditCircuitClick: () => void;
}

export const ReviewStep = ({
  selectedType,
  selectedSubType,
  documentAlias,
  title,
  docDate,
  comptableDate,
  content,
  circuitName,
  onEditTypeClick,
  onEditDetailsClick,
  onEditDateClick,
  onEditContentClick,
  onEditCircuitClick,
}: ReviewStepProps) => {
  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="text-center mb-3">
        <div className="inline-flex items-center justify-center p-2 bg-green-900/20 rounded-full mb-2">
          <Check className="h-5 w-5 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-white">Review Your Document</h3>
        <p className="text-sm text-gray-400">
          Please review your document details before creating
        </p>
      </div>

      {/* Document Type & Subtype */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-400" />
              Document Type
            </CardTitle>
            <CardDescription className="text-gray-400">
              Type and stump information
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditTypeClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Type</p>
              <p className="text-sm text-white">
                {selectedType?.typeName || "N/A"}{" "}
                <span className="text-gray-400">
                  ({selectedType?.typeKey || "N/A"})
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Stump</p>
              <p className="text-sm text-white">
                {selectedSubType?.name || "N/A"}
              </p>
            </div>
          </div>
          {selectedSubType && (
            <div className="pt-1">
              <p className="text-xs text-gray-400">Valid Period</p>
              <p className="text-sm text-white">
                {format(new Date(selectedSubType.startDate), "PP")} -{" "}
                {format(new Date(selectedSubType.endDate), "PP")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Details */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <FileSignature className="h-4 w-4 text-blue-400" />
              Document Details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Title and alias information
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditDetailsClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-gray-400">Title</p>
            <p className="text-sm text-white">{title || "N/A"}</p>
          </div>
          {documentAlias && (
            <div>
              <p className="text-xs text-gray-400">Alias</p>
              <p className="text-sm text-white">{documentAlias}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Date */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              Document Dates
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditDateClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-400 mr-2" />
                <p className="text-xs text-gray-400">Document Date</p>
              </div>
              <p className="text-sm text-white">
                {docDate ? format(new Date(docDate), "PPP") : "N/A"}
              </p>
            </div>

            <div>
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-green-400 mr-2" />
                <p className="text-xs text-gray-400">Accounting Date</p>
              </div>
              <p className="text-sm text-white">
                {comptableDate
                  ? format(new Date(comptableDate), "PPP")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Circuit Information */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <Share2 className="h-4 w-4 text-blue-400" />
              Circuit Assignment
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditCircuitClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-white">
            {circuitName || "No circuit assigned"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This document will be processed according to the {circuitName}{" "}
            workflow
          </p>
        </CardContent>
      </Card>

      {/* Document Content */}
      <Card className="bg-[#0a1033]/80 border-gray-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-md text-white flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              Document Content
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:bg-blue-900/20"
            onClick={onEditContentClick}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-md p-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {content || "No content provided"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
