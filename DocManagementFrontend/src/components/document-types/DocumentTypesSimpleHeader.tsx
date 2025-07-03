import {
  LayoutGrid,
  LayoutList,
  Plus,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeader } from "@/components/shared/PageHeader";

interface DocumentTypesSimpleHeaderProps {
  viewMode: "table" | "grid";
  onViewModeChange: (value: "table" | "grid") => void;
  onNewTypeClick: () => void;
}

const DocumentTypesSimpleHeader = ({
  viewMode,
  onViewModeChange,
  onNewTypeClick,
}: DocumentTypesSimpleHeaderProps) => {
  const handleViewModeChange = (value: string) => {
    if (value === "table" || value === "grid") {
      onViewModeChange(value);
    }
  };

  return (
    <>
      <PageHeader
        title="Document Types"
        description="Manage document classification system"
        icon={<Layers className="h-6 w-6 text-blue-400" />}
        actions={
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={handleViewModeChange}
              className="border border-blue-900/40 rounded-md bg-[#22306e]"
            >
              <ToggleGroupItem
                value="table"
                aria-label="Table view"
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white text-blue-300 hover:text-blue-100 hover:bg-blue-900/50"
              >
                <LayoutList className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="data-[state=on]:bg-blue-600 data-[state=on]:text-white text-blue-300 hover:text-blue-100 hover:bg-blue-900/50"
              >
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={onNewTypeClick}
            >
              <Plus className="h-4 w-4" />
              New Type
            </Button>
          </div>
        }
      />
    </>
  );
};

export default DocumentTypesSimpleHeader; 