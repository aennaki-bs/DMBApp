import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import { Button } from "@/components/ui/button";
import { AlertCircle, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface TypeSelectionStepProps {
  documentTypes: DocumentType[];
  subTypes: SubType[];
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  documentAlias: string;
  onTypeChange: (value: string) => void;
  onSubTypeChange: (value: string) => void;
  onAliasChange: (value: string) => void;
  aliasError?: string;
  typeError?: string;
  subTypeError?: string;
}

export const TypeSelectionStep = ({
  documentTypes,
  subTypes,
  selectedTypeId,
  selectedSubTypeId,
  documentAlias,
  onTypeChange,
  onSubTypeChange,
  onAliasChange,
  aliasError,
  typeError,
  subTypeError,
}: TypeSelectionStepProps) => {
  const selectedType = selectedTypeId
    ? documentTypes.find((type) => type.id === selectedTypeId)
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="documentType"
          className="text-sm font-medium text-gray-200"
        >
          Document Type*
        </Label>
        <Select
          value={selectedTypeId?.toString() || ""}
          onValueChange={onTypeChange}
        >
          <SelectTrigger
            className={`h-12 text-base bg-gray-900 border-gray-800 text-white ${
              typeError ? "border-red-500" : ""
            }`}
          >
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            {documentTypes.map((type) => (
              <SelectItem
                key={type.id}
                value={type.id!.toString()}
                className="text-gray-200"
              >
                {type.typeName} ({type.typeKey})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {typeError && <p className="text-sm text-red-500">{typeError}</p>}
      </div>

      {selectedTypeId && subTypes.length === 0 && (
        <div className="rounded-md bg-blue-900/20 p-4 border border-blue-800/50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-300">
                No subtypes available
              </h3>
              <div className="mt-2 text-sm text-blue-200">
                <p>
                  The selected document type doesn't have any subtypes yet. You
                  need to add at least one subtype before you can create a
                  document.
                </p>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                  asChild
                >
                  <Link to={`/document-types/${selectedTypeId}/subtypes`}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Subtype
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTypeId && subTypes.length > 0 && (
        <div className="space-y-3">
          <Label
            htmlFor="subType"
            className="text-sm font-medium text-gray-200"
          >
            Subtype*
          </Label>
          <Select
            value={selectedSubTypeId?.toString() || ""}
            onValueChange={onSubTypeChange}
          >
            <SelectTrigger
              className={`h-12 text-base bg-gray-900 border-gray-800 text-white ${
                subTypeError ? "border-red-500" : ""
              }`}
            >
              <SelectValue placeholder="Select subtype" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              {subTypes.map((subType) => (
                <SelectItem
                  key={subType.id}
                  value={subType.id.toString()}
                  className="text-gray-200"
                >
                  {subType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {subTypeError && (
            <p className="text-sm text-red-500">{subTypeError}</p>
          )}
          {selectedSubTypeId && (
            <p className="text-sm text-blue-400">
              Valid from{" "}
              {new Date(
                subTypes.find((st) => st.id === selectedSubTypeId)?.startDate!
              ).toLocaleDateString()}
              to{" "}
              {new Date(
                subTypes.find((st) => st.id === selectedSubTypeId)?.endDate!
              ).toLocaleDateString()}
            </p>
          )}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
              asChild
            >
              <Link to={`/document-types/${selectedTypeId}/subtypes`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Manage Subtypes
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Label
          htmlFor="documentAlias"
          className="text-sm font-medium text-gray-200"
        >
          Document Alias
        </Label>
        <Input
          id="documentAlias"
          value={documentAlias}
          onChange={(e) => onAliasChange(e.target.value)}
          placeholder="Enter document alias (optional)"
          className={`h-12 text-base bg-gray-900 border-gray-800 text-white placeholder:text-gray-500 ${
            aliasError ? "border-red-500" : ""
          }`}
        />
        {aliasError && <p className="text-sm text-red-500">{aliasError}</p>}
        <p className="text-sm text-gray-400">
          An optional short name or reference for this document
        </p>
      </div>
    </div>
  );
};
