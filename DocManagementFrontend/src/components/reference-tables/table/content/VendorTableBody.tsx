import { TableBody } from "@/components/ui/table";
import { Vendor } from "@/models/vendor";
import { VendorTableRow } from "../VendorTableRow";

interface VendorTableBodyProps {
  vendors: Vendor[] | undefined;
  selectedVendors: string[];
  onSelectVendor: (vendorCode: string) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendorCode: string) => void;
}

export function VendorTableBody({
  vendors,
  selectedVendors,
  onSelectVendor,
  onEdit,
  onDelete,
}: VendorTableBodyProps) {
  return (
    <TableBody>
      {vendors?.map((vendor) => (
        <VendorTableRow
          key={vendor.vendorCode}
          vendor={vendor}
          isSelected={selectedVendors.includes(vendor.vendorCode)}
          onSelect={onSelectVendor}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </TableBody>
  );
} 