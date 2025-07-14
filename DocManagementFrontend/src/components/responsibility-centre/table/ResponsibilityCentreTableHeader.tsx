import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";
import { useTranslation } from "@/hooks/useTranslation";

interface ResponsibilityCentreTableHeaderProps {
  hasSelection: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export function ResponsibilityCentreTableHeader({
  hasSelection,
  allSelected,
  someSelected,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
}: ResponsibilityCentreTableHeaderProps) {
  const { t } = useTranslation();

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow className="border-slate-200/70 dark:border-slate-700/70 bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/70">
        <TableHead className="w-[48px]">
          <div className="flex items-center justify-center">
            <ProfessionalCheckbox
              checked={allSelected}
              indeterminate={someSelected}
              onCheckedChange={onSelectAll}
              size="md"
              variant="header"
            />
          </div>
        </TableHead>
        
        <TableHead className="w-[200px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('code')}
            className="h-8 px-2 font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
          >
            {t('responsibilityCentreManagement.code')}
            <div className="ml-1 text-slate-400 dark:text-slate-500">
              {getSortIcon('code')}
            </div>
          </Button>
        </TableHead>
        
        <TableHead className="flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSort('descr')}
            className="h-8 px-2 font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
          >
            {t('responsibilityCentreManagement.description')}
            <div className="ml-1 text-slate-400 dark:text-slate-500">
              {getSortIcon('descr')}
            </div>
          </Button>
        </TableHead>
        
        <TableHead className="w-[120px]">
          <div className="text-center font-semibold text-slate-700 dark:text-slate-300">
            {t('responsibilityCentreManagement.actions')}
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
} 