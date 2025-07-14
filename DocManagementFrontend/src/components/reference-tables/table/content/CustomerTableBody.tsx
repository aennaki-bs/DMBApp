import { TableBody } from "@/components/ui/table";
import { Customer } from "@/models/customer";
import { CustomerTableRow } from "../CustomerTableRow";

interface CustomerTableBodyProps {
  customers: Customer[] | undefined;
  selectedCustomers: string[];
  onSelectCustomer: (code: string) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (code: string) => void;
}

export function CustomerTableBody({
  customers,
  selectedCustomers,
  onSelectCustomer,
  onEdit,
  onDelete,
}: CustomerTableBodyProps) {
  return (
    <TableBody>
      {customers?.map((customer) => (
        <CustomerTableRow
          key={customer.code}
          customer={customer}
          isSelected={selectedCustomers.includes(customer.code)}
          onSelect={onSelectCustomer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </TableBody>
  );
} 