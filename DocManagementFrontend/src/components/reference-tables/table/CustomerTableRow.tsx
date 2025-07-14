import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Customer } from "@/models/customer";
import { CustomerActionsDropdown } from "./row/CustomerActionsDropdown";
import { ProfessionalCheckbox } from "@/components/shared/ProfessionalCheckbox";

interface CustomerTableRowProps {
  customer: Customer;
  isSelected: boolean;
  onSelect: (code: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (code: string) => void;
  index?: number;
}

export function CustomerTableRow({
  customer,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  index = 0,
}: CustomerTableRowProps) {
  const handleEdit = () => {
    console.log("Handling edit for customer:", customer);
    onEdit(customer);
  };

  const handleDelete = () => {
    console.log("Handling delete for customer:", customer.code);
    onDelete(customer.code);
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
        onSelect(customer.code);
      }}
    >
      <TableCell className="w-[48px]">
        <div className="flex items-center justify-center">
          <ProfessionalCheckbox
            checked={isSelected}
            onCheckedChange={() => onSelect(customer.code)}
            size="md"
            variant="row"
          />
        </div>
      </TableCell>
      
      <TableCell className="w-[120px]">
        <div className="font-medium text-blue-900 dark:text-blue-100 font-mono">
          {customer.code}
        </div>
      </TableCell>
      
      <TableCell className="w-[200px]">
        <div className="font-medium text-blue-900 dark:text-blue-100">
          {customer.name}
        </div>
      </TableCell>
      
      <TableCell className="w-[250px] text-blue-800 dark:text-blue-200">
        <span className="block truncate">{customer.address || "-"}</span>
      </TableCell>

      <TableCell className="w-[150px] text-blue-800 dark:text-blue-200">
        <span className="block truncate">{customer.city || "-"}</span>
      </TableCell>

      <TableCell className="w-[150px] text-blue-800 dark:text-blue-200">
        <span className="block truncate">{customer.country || "-"}</span>
      </TableCell>

      <TableCell className="w-[100px]">
        <CustomerActionsDropdown
          customer={customer}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </TableCell>
    </TableRow>
  );
} 