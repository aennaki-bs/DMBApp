
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface UserTableHeaderProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
}

export function UserTableHeader({
  selectedCount,
  totalCount,
  onSelectAll,
}: UserTableHeaderProps) {
  return (
    <TableHeader className="bg-[#0d1424]">
      <TableRow className="border-gray-700 hover:bg-transparent">
        <TableHead className="w-12 text-gray-300">
          <Checkbox 
            checked={selectedCount > 0 && selectedCount === totalCount}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
          />
        </TableHead>
        <TableHead className="w-12"></TableHead>
        <TableHead className="text-gray-300">User</TableHead>
        <TableHead className="text-gray-300">Email</TableHead>
        <TableHead className="text-gray-300">Role</TableHead>
        <TableHead className="text-gray-300">Status</TableHead>
        <TableHead className="text-gray-300">Block</TableHead>
        <TableHead className="w-16 text-gray-300">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
