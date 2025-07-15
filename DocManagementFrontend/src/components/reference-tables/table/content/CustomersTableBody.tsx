import { TableBody } from "@/components/ui/table";
import { Customer } from "@/models/customer";
import { CustomersTableRow } from "./CustomersTableRow";

interface CustomersTableBodyProps {
    customers: Customer[];
    selectedItems: string[]; // Array of customer codes
    onSelectCustomer: (code: string) => void;
    onEdit: (customer: Customer) => void;
    onView: (customer: Customer) => void;
    onDelete: (code: string) => void;
}

export function CustomersTableBody({
    customers,
    selectedItems,
    onSelectCustomer,
    onEdit,
    onView,
    onDelete,
}: CustomersTableBodyProps) {
    return (
        <TableBody>
            {customers.map((customer) => {
                const isSelected = selectedItems.includes(customer.code); // Check if code is in selectedItems array

                return (
                    <CustomersTableRow
                        key={customer.code}
                        customer={customer}
                        isSelected={isSelected}
                        onSelect={() => onSelectCustomer(customer.code)}
                        onEdit={() => onEdit(customer)}
                        onView={() => onView(customer)}
                        onDelete={() => onDelete(customer.code)}
                    />
                );
            })}
        </TableBody>
    );
} 