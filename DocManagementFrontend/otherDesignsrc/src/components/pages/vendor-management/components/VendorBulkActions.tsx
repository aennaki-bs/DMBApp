import { BulkActionsBar } from "@/components/responsibility-centre/table/BulkActionsBar";

interface VendorBulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
}

export function VendorBulkActions({
  selectedCount,
  totalCount,
  onDelete,
  onClearSelection,
}: VendorBulkActionsProps) {
  return (
    <BulkActionsBar
      selectedCount={selectedCount}
      totalCount={totalCount}
      onDelete={onDelete}
      onClearSelection={onClearSelection}
    />
  );
}
