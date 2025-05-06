
import { Link } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, LayoutList, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";

interface DocumentTypesHeaderProps {
  viewMode: 'table' | 'grid';
  onViewModeChange: (value: 'table' | 'grid') => void;
  onNewTypeClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const DocumentTypesHeader = ({ 
  viewMode, 
  onViewModeChange, 
  onNewTypeClick,
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters 
}: DocumentTypesHeaderProps) => {
  const handleViewModeChange = (value: string) => {
    if (value === 'table' || value === 'grid') {
      onViewModeChange(value);
    }
  };

  return (
    <div className="bg-[#0f1642] p-4 md:p-6 border-b border-blue-900/30 flex-shrink-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Document Types</h1>
            <p className="text-sm text-blue-300 mt-1">
              Manage document classification system
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/70" />
            <Input 
              placeholder="Search types..." 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-blue-900/20 border-blue-800/30 text-white placeholder:text-blue-300/50 w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="icon"
              className={`${showFilters ? 'bg-blue-800/30 text-blue-300' : 'text-blue-300/70'}`}
              onClick={onToggleFilters}
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            <ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
              <ToggleGroupItem value="table" aria-label="Table view">
                <LayoutList className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            <Button className="h-9 bg-blue-600 hover:bg-blue-700" onClick={onNewTypeClick}>
              <Plus className="mr-2 h-4 w-4" /> New Type
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentTypesHeader;
