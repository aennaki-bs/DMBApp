import { useState } from "react";
import { Filter, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/models/document";

interface SmartSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (ids: number[]) => void;
  documentTypes: DocumentType[];
}

const SmartSelectDialog = ({
  open,
  onOpenChange,
  onSelect,
  documentTypes,
}: SmartSelectDialogProps) => {
  const [selectCriteria, setSelectCriteria] = useState<string>("all");
  const [nameFilter, setNameFilter] = useState<string>("");
  const [codeFilter, setCodeFilter] = useState<string>("");
  const [hasDocuments, setHasDocuments] = useState<boolean | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([]);

  const applySelection = () => {
    let filteredTypes = [...documentTypes];

    // Apply name filter
    if (nameFilter) {
      filteredTypes = filteredTypes.filter((type) =>
        type.typeName?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply code filter
    if (codeFilter) {
      filteredTypes = filteredTypes.filter((type) =>
        type.typeKey?.toLowerCase().includes(codeFilter.toLowerCase())
      );
    }

    // Apply document filter
    if (hasDocuments !== null) {
      filteredTypes = filteredTypes.filter((type) =>
        hasDocuments
          ? (type.documentCounter || 0) > 0
          : (type.documentCounter || 0) === 0
      );
    }

    setSelectedTypes(filteredTypes);
  };

  const handleSelect = () => {
    const ids = selectedTypes.map((type) => type.id!);
    onSelect(ids);
    onOpenChange(false);
  };

  const handleSelectAll = () => {
    setSelectedTypes([...documentTypes]);
  };

  const handleClearSelection = () => {
    setSelectedTypes([]);
  };

  const getSelectionSummary = () => {
    if (selectedTypes.length === 0) {
      return "No types selected";
    } else if (selectedTypes.length === documentTypes.length) {
      return "All types selected";
    } else {
      return `${selectedTypes.length} types selected`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a1033] border border-blue-900/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-400" />
            Smart Select
          </DialogTitle>
          <DialogDescription>
            Select multiple document types based on criteria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div>
            <Label className="text-sm text-blue-300 mb-1 block">Selection Method</Label>
            <Select value={selectCriteria} onValueChange={setSelectCriteria}>
              <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Document Types</SelectItem>
                <SelectItem value="filter">Filter by Criteria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectCriteria === "filter" && (
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs text-blue-300 mb-1 block">
                  Type Name Contains
                </Label>
                <Input
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Filter by name..."
                  className="bg-blue-900/20 border-blue-800/30 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-blue-300 mb-1 block">
                  Type Code Contains
                </Label>
                <Input
                  value={codeFilter}
                  onChange={(e) => setCodeFilter(e.target.value)}
                  placeholder="Filter by code..."
                  className="bg-blue-900/20 border-blue-800/30 text-white"
                />
              </div>

              <div>
                <Label className="text-xs text-blue-300 mb-1 block">
                  Document Status
                </Label>
                <Select
                  value={
                    hasDocuments === null
                      ? "any"
                      : hasDocuments
                      ? "has"
                      : "none"
                  }
                  onValueChange={(value) => {
                    if (value === "any") setHasDocuments(null);
                    else if (value === "has") setHasDocuments(true);
                    else setHasDocuments(false);
                  }}
                >
                  <SelectTrigger className="bg-blue-900/20 border-blue-800/30 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="has">Has Documents</SelectItem>
                    <SelectItem value="none">No Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={applySelection}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
              >
                Apply Criteria
              </Button>
            </div>
          )}

          <div className="bg-blue-900/20 p-3 rounded-md border border-blue-800/30">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm text-blue-300">Selection Preview</Label>
              <div className="text-xs text-blue-400">{getSelectionSummary()}</div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs border-blue-500/50 bg-blue-900/20 hover:bg-blue-800/30"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                className="text-xs border-blue-500/50 bg-blue-900/20 hover:bg-blue-800/30"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-blue-300 hover:text-blue-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelect}
            disabled={selectedTypes.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Select {selectedTypes.length} Types
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SmartSelectDialog; 