import { TableBody } from "@/components/ui/table";
import { Vendor } from "@/models/vendor";
import { VendorsTableRow } from "./VendorsTableRow";

interface VendorsTableBodyProps {
    vendors: Vendor[];
    selectedItems: string[]; // Array of vendor codes
    onSelectVendor: (vendorCode: string) => void;
    onEdit: (vendor: Vendor) => void;
    onView: (vendor: Vendor) => void;
    onDelete: (vendorCode: string) => void;
}

export function VendorsTableBody({
    vendors,
    selectedItems,
    onSelectVendor,
    onEdit,
    onView,
    onDelete,
}: VendorsTableBodyProps) {
    return (
        <TableBody>
            {vendors.map((vendor) => {
                const isSelected = selectedItems.includes(vendor.vendorCode); // Check if vendorCode is in selectedItems array

                return (
                    <VendorsTableRow
                        key={vendor.vendorCode}
                        vendor={vendor}
                        isSelected={isSelected}
                        onSelect={() => onSelectVendor(vendor.vendorCode)}
                        onEdit={() => onEdit(vendor)}
                        onView={() => onView(vendor)}
                        onDelete={() => onDelete(vendor.vendorCode)}
                    />
                );
            })}
        </TableBody>
    );
} 