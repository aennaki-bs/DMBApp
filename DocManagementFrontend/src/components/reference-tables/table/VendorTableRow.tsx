import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Vendor } from "@/models/vendor";
import { VendorActionsDropdown } from "./row/VendorActionsDropdown";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface VendorTableRowProps {
  vendor: Vendor;
  isSelected: boolean;
  onSelect: (vendorCode: string) => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendorCode: string) => void;
  index?: number;
}

export function VendorTableRow({
  vendor,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  index = 0,
}: VendorTableRowProps) {
  const handleEdit = () => {
    console.log("Handling edit for vendor:", vendor);
    onEdit(vendor);
  };

  const handleDelete = () => {
    console.log("Handling delete for vendor:", vendor.vendorCode);
    onDelete(vendor.vendorCode);
  };

  return (
    <TableRow
      className={`border-slate-200/50 dark:border-slate-700/50 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer group ${isSelected
        ? "bg-blue-50/80 dark:bg-blue-900/20 border-l-2 border-l-blue-500 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-800/50"
        : "hover:shadow-sm"
        }`}
      onClick={(e) => {
        // Don't trigger row selection if clicking on interactive elements
        const target = e.target as HTMLElement;
        if (
          target.closest('button') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('[role="button"]')
        ) {
          return;
        }
        onSelect(vendor.vendorCode);
      }}
    >
      <TableCell className="w-[48px]">
        <div className="flex items-center justify-center">
          <ProfessionalCheckbox
            checked={isSelected}
            onCheckedChange={() => onSelect(vendor.vendorCode)}
            size="md"
            variant="row"
          />
        </div>
      </TableCell>
      
      <TableCell className="w-[120px]">
        <div className="font-medium text-blue-900 dark:text-blue-100 font-mono">
          {vendor.vendorCode}
        </div>
      </TableCell>
      
      <TableCell className="w-[200px]">
        <div className="font-medium text-blue-900 dark:text-blue-100">
          {vendor.name}
        </div>
      </TableCell>
      
      <TableCell className="w-[250px] text-blue-800 dark:text-blue-200">
        <span className="block truncate">{vendor.address || "-"}</span>
      </TableCell>

      <TableCell className="w-[150px] text-blue-800 dark:text-blue-200">
        <span className="block truncate">{vendor.city || "-"}</span>
      </TableCell>

      <TableCell className="w-[150px] text-blue-800 dark:text-blue-200">
        <span className="block truncate">{vendor.country || "-"}</span>
      </TableCell>

      <TableCell className="w-[100px]">
        <VendorActionsDropdown
          vendor={vendor}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
} 