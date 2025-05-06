import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { DocumentType } from '@/models/document';
import { useNavigate } from 'react-router-dom';

interface DocumentTypeTableRowProps {
  type: DocumentType;
  isSelected: boolean;
  onSelectType: (id: number, checked: boolean) => void;
  onDeleteType: (id: number) => void;
  onEditType: (type: DocumentType) => void;
}

export function DocumentTypeTableRow({
  type,
  isSelected,
  onSelectType,
  onDeleteType,
  onEditType,
}: DocumentTypeTableRowProps) {
  const navigate = useNavigate();
  
  const handleRowClick = () => {
    navigate(`/document-types/${type.id}/subtypes`);
  };

  const documentCount = type.documentCounter || 0;

  return (
    <TableRow 
      className={`transition-all hover:bg-blue-900/20 cursor-pointer`}
      onClick={handleRowClick}
    >
      <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectType(type.id!, checked as boolean)}
          disabled={documentCount > 0}
        />
      </TableCell>
      <TableCell className="text-blue-100">{type.typeKey}</TableCell>
      <TableCell>{type.typeName}</TableCell>
      <TableCell>{type.typeAttr}</TableCell>
      <TableCell>
        <div className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors font-mono ${
          documentCount === 0 
            ? 'border-transparent bg-primary text-primary-foreground shadow' 
            : 'border-transparent bg-[#1a2765] text-white shadow'
        }`}>
          {documentCount}
        </div>
      </TableCell>
      <TableCell className="text-right w-[120px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 p-0 ${
              documentCount > 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/40'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (documentCount === 0) onEditType(type);
            }}
            disabled={documentCount > 0}
            title={documentCount > 0 ? 
              "Cannot edit type with associated documents" : 
              "Edit document type"}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 p-0 ${
              documentCount > 0
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-red-400 hover:text-red-300 hover:bg-red-900/30'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (documentCount === 0 && type.id) onDeleteType(type.id);
            }}
            disabled={documentCount > 0}
            title={documentCount > 0 ? 
              "Cannot delete type with associated documents" : 
              "Delete document type"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/40"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/document-types/${type.id}/subtypes`);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
