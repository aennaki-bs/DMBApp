
import { ArrowUpDown } from 'lucide-react';
import { Document } from '@/models/document';
import DocumentsTableRow from './DocumentsTableRow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface DocumentsTableProps {
  documents: Document[];
  selectedDocuments: number[];
  canManageDocuments: boolean;
  handleSelectDocument: (id: number) => void;
  handleSelectAll: () => void;
  openDeleteDialog: (id: number) => void;
  openAssignCircuitDialog: (document: Document) => void;
  page: number;
  pageSize: number;
  sortConfig: { key: string; direction: 'ascending' | 'descending' } | null;
  requestSort: (key: string) => void;
}

export default function DocumentsTable({
  documents,
  selectedDocuments,
  canManageDocuments,
  handleSelectDocument,
  handleSelectAll,
  openDeleteDialog,
  openAssignCircuitDialog,
  page,
  pageSize,
  sortConfig,
  requestSort
}: DocumentsTableProps) {
  const getSortIndicator = (columnKey: string) => {
    if (sortConfig && sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending' ? '↑' : '↓';
    }
    return null;
  };

  const renderSortableHeader = (label: string, key: string, icon: React.ReactNode) => (
    <div 
      className="flex items-center gap-1 cursor-pointer select-none" 
      onClick={() => requestSort(key)}
    >
      {icon}
      {label}
      <div className="ml-1 w-4 text-center">
        {getSortIndicator(key) || <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </div>
    </div>
  );

  return (
    <Table>
      <TableHeader className="bg-blue-900/20">
        <TableRow className="border-blue-900/50 hover:bg-blue-900/30">
          <TableHead className="w-12 text-blue-300">
            {canManageDocuments ? (
              <Checkbox 
                checked={selectedDocuments.length === documents.length && documents.length > 0} 
                onCheckedChange={handleSelectAll}
                className="border-blue-500/50"
              />
            ) : (
              <span>#</span>
            )}
          </TableHead>
          <TableHead className="text-blue-300 w-52">
            {renderSortableHeader('Document Code', 'documentKey', <TagIcon />)}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader('Title', 'title', <FileTextIcon />)}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader('Type', 'documentType', <FilterIcon />)}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader('Document Date', 'docDate', <CalendarDaysIcon />)}
          </TableHead>
          <TableHead className="text-blue-300">
            {renderSortableHeader('Created By', 'createdBy', <AvatarIcon />)}
          </TableHead>
          <TableHead className="w-24 text-right text-blue-300">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document, index) => (
          <DocumentsTableRow
            key={document.id}
            document={document}
            index={index + (page - 1) * pageSize}
            isSelected={selectedDocuments.includes(document.id)}
            canManageDocuments={canManageDocuments}
            onSelect={() => handleSelectDocument(document.id)}
            onDelete={() => openDeleteDialog(document.id)}
            onAssignCircuit={() => openAssignCircuitDialog(document)}
          />
        ))}
      </TableBody>
    </Table>
  );
}

function TagIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M4.5 6.5C5.32843 6.5 6 5.82843 6 5C6 4.17157 5.32843 3.5 4.5 3.5C3.67157 3.5 3 4.17157 3 5C3 5.82843 3.67157 6.5 4.5 6.5ZM4.5 5.5C4.77614 5.5 5 5.27614 5 5C5 4.72386 4.77614 4.5 4.5 4.5C4.22386 4.5 4 4.72386 4 5C4 5.27614 4.22386 5.5 4.5 5.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path><path d="M1.5 0C0.671573 0 0 0.671573 0 1.5V6.5C0 7.32843 0.671573 8 1.5 8H9.29306L13.8536 12.5604C14.0488 12.7557 14.3654 12.7557 14.5607 12.5604C14.7559 12.3652 14.7559 12.0486 14.5607 11.8534L10.4393 7.73205C10.3379 7.63057 10.1994 7.57359 10.0559 7.57359H9.99996V1.5C9.99996 0.671573 9.32839 0 8.49996 0H1.5ZM8.99996 7.00001V1.5C8.99996 1.22386 8.7761 1 8.49996 1H1.5C1.22386 1 1 1.22386 1 1.5V6.5C1 6.77614 1.22386 7 1.5 7H8.99996Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}

function FileTextIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M3 2.5C3 2.22386 3.22386 2 3.5 2H11.5C11.7761 2 12 2.22386 12 2.5V13.5C12 13.7761 11.7761 14 11.5 14H3.5C3.22386 14 3 13.7761 3 13.5V2.5ZM3.5 1C2.67157 1 2 1.67157 2 2.5V13.5C2 14.3284 2.67157 15 3.5 15H11.5C12.3284 15 13 14.3284 13 13.5V2.5C13 1.67157 12.3284 1 11.5 1H3.5ZM4.5 4C4.22386 4 4 4.22386 4 4.5C4 4.77614 4.22386 5 4.5 5H10.5C10.7761 5 11 4.77614 11 4.5C11 4.22386 10.7761 4 10.5 4H4.5ZM4.5 7C4.22386 7 4 7.22386 4 7.5C4 7.77614 4.22386 8 4.5 8H10.5C10.7761 8 11 7.77614 11 7.5C11 7.22386 10.7761 7 10.5 7H4.5ZM4.5 10C4.22386 10 4 10.2239 4 10.5C4 10.7761 4.22386 11 4.5 11H10.5C10.7761 11 11 10.7761 11 10.5C11 10.2239 10.7761 10 10.5 10H4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}

function FilterIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M5.5 3C4.67157 3 4 3.67157 4 4.5C4 5.32843 4.67157 6 5.5 6C6.32843 6 7 5.32843 7 4.5C7 3.67157 6.32843 3 5.5 3ZM3 5C3.01671 5 3.03323 4.99918 3.04952 4.99758C3.28022 6.1399 4.28967 7 5.5 7C6.71033 7 7.71978 6.1399 7.95048 4.99758C7.96677 4.99918 7.98329 5 8 5H13.5C13.7761 5 14 4.77614 14 4.5C14 4.22386 13.7761 4 13.5 4H8C7.98329 4 7.96677 4.00082 7.95048 4.00242C7.71978 2.86009 6.71033 2 5.5 2C4.28967 2 3.28022 2.86009 3.04952 4.00242C3.03323 4.00082 3.01671 4 3 4H1.5C1.22386 4 1 4.22386 1 4.5C1 4.77614 1.22386 5 1.5 5H3ZM11.9505 10.9976C11.7198 12.1399 10.7103 13 9.5 13C8.28967 13 7.28022 12.1399 7.04952 10.9976C7.03323 10.9992 7.01671 11 7 11H1.5C1.22386 11 1 10.7761 1 10.5C1 10.2239 1.22386 10 1.5 10H7C7.01671 10 7.03323 10.0008 7.04952 10.0024C7.28022 8.8601 8.28967 8 9.5 8C10.7103 8 11.7198 8.8601 11.9505 10.0024C11.9668 10.0008 11.9833 10 12 10H13.5C13.7761 10 14 10.2239 14 10.5C14 10.7761 13.7761 11 13.5 11H12C11.9833 11 11.9668 10.9992 11.9505 10.9976ZM8 10.5C8 9.67157 8.67157 9 9.5 9C10.3284 9 11 9.67157 11 10.5C11 11.3284 10.3284 12 9.5 12C8.67157 12 8 11.3284 8 10.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}

function CalendarDaysIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M4.5 1C4.77614 1 5 1.22386 5 1.5V2H10V1.5C10 1.22386 10.2239 1 10.5 1C10.7761 1 11 1.22386 11 1.5V2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5C1 2.67157 1.67157 2 2.5 2H4V1.5C4 1.22386 4.22386 1 4.5 1ZM10 3V3.5C10 3.77614 10.2239 4 10.5 4C10.7761 4 11 3.77614 11 3.5V3H12.5C12.7761 3 13 3.22386 13 3.5V5H2V3.5C2 3.22386 2.22386 3 2.5 3H4V3.5C4 3.77614 4.22386 4 4.5 4C4.77614 4 5 3.77614 5 3.5V3H10ZM2 6V12.5C2 12.7761 2.22386 13 2.5 13H12.5C12.7761 13 13 12.7761 13 12.5V6H2ZM7 7.5C7 7.22386 7.22386 7 7.5 7C7.77614 7 8 7.22386 8 7.5C8 7.77614 7.77614 8 7.5 8C7.22386 8 7 7.77614 7 7.5ZM9.5 7C9.22386 7 9 7.22386 9 7.5C9 7.77614 9.22386 8 9.5 8C9.77614 8 10 7.77614 10 7.5C10 7.22386 9.77614 7 9.5 7ZM11 7.5C11 7.22386 11.2239 7 11.5 7C11.7761 7 12 7.22386 12 7.5C12 7.77614 11.7761 8 11.5 8C11.2239 8 11 7.77614 11 7.5ZM11.5 9C11.2239 9 11 9.22386 11 9.5C11 9.77614 11.2239 10 11.5 10C11.7761 10 12 9.77614 12 9.5C12 9.22386 11.7761 9 11.5 9ZM9 9.5C9 9.22386 9.22386 9 9.5 9C9.77614 9 10 9.22386 10 9.5C10 9.77614 9.77614 10 9.5 10C9.22386 10 9 9.77614 9 9.5ZM7.5 9C7.22386 9 7 9.22386 7 9.5C7 9.77614 7.22386 10 7.5 10C7.77614 10 8 9.77614 8 9.5C8 9.22386 7.77614 9 7.5 9ZM5 9.5C5 9.22386 5.22386 9 5.5 9C5.77614 9 6 9.22386 6 9.5C6 9.77614 5.77614 10 5.5 10C5.22386 10 5 9.77614 5 9.5ZM3.5 9C3.22386 9 3 9.22386 3 9.5C3 9.77614 3.22386 10 3.5 10C3.77614 10 4 9.77614 4 9.5C4 9.22386 3.77614 9 3.5 9ZM3 11.5C3 11.2239 3.22386 11 3.5 11C3.77614 11 4 11.2239 4 11.5C4 11.7761 3.77614 12 3.5 12C3.22386 12 3 11.7761 3 11.5ZM5.5 11C5.22386 11 5 11.2239 5 11.5C5 11.7761 5.22386 12 5.5 12C5.77614 12 6 11.7761 6 11.5C6 11.2239 5.77614 11 5.5 11ZM7 11.5C7 11.2239 7.22386 11 7.5 11C7.77614 11 8 11.2239 8 11.5C8 11.7761 7.77614 12 7.5 12C7.22386 12 7 11.7761 7 11.5ZM9.5 11C9.22386 11 9 11.2239 9 11.5C9 11.7761 9.22386 12 9.5 12C9.77614 12 10 11.7761 10 11.5C10 11.2239 9.77614 11 9.5 11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}

function AvatarIcon() {
  return <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.0749 12.975 13.8623 12.975 13.5999C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
}
