import { ArrowUpDown } from 'lucide-react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface DocumentTypeTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  areAllEligibleSelected: boolean;
  hasEligibleTypes: boolean;
  onSort: (field: string) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
}

export const DocumentTypeTableHeader = ({
  onSelectAll,
  areAllEligibleSelected,
  hasEligibleTypes,
  onSort,
  sortField,
  sortDirection
}: DocumentTypeTableHeaderProps) => {
  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === 'asc' 
        ? <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-400" /> 
        : <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-blue-400 rotate-180" />;
    }
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-30" />;
  };

  return (
    <TableHeader className="bg-[#0a1033]/80 sticky top-0 z-10">
      <TableRow className="hover:bg-transparent border-b border-blue-900/30 select-none">
        <TableHead className="w-[50px] text-blue-300 py-2 h-9">
          <Checkbox 
            checked={areAllEligibleSelected && hasEligibleTypes}
            onCheckedChange={onSelectAll}
            disabled={!hasEligibleTypes}
            aria-label="Select all types"
          />
        </TableHead>
        <TableHead 
          className="w-1/6 cursor-pointer text-blue-300 hover:text-blue-200 py-2 h-9"
          onClick={() => onSort('typeKey')}
        >
          <div className="flex items-center">
            Type Code
            {renderSortIcon('typeKey')}
          </div>
        </TableHead>
        <TableHead 
          className="w-1/3 cursor-pointer text-blue-300 hover:text-blue-200 py-2 h-9"
          onClick={() => onSort('typeName')}
        >
          <div className="flex items-center">
            Type Name
            {renderSortIcon('typeName')}
          </div>
        </TableHead>
        <TableHead 
          className="w-1/4 cursor-pointer text-blue-300 hover:text-blue-200 py-2 h-9"
          onClick={() => onSort('typeAttr')}
        >
          <div className="flex items-center">
            Description
            {renderSortIcon('typeAttr')}
          </div>
        </TableHead>
        <TableHead 
          className="w-[120px] cursor-pointer text-blue-300 hover:text-blue-200 py-2 h-9"
          onClick={() => onSort('documentCounter')}
        >
          <div className="flex items-center">
            Document Count
            {renderSortIcon('documentCounter')}
          </div>
        </TableHead>
        <TableHead className="w-[120px] text-blue-300 py-2 h-9 text-right pr-4">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
