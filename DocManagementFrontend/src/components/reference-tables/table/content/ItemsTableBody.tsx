import { TableBody } from "@/components/ui/table";
import { Item } from "@/models/lineElements";
import { ItemsTableRow } from "./ItemsTableRow";

interface ItemsTableBodyProps {
    items: Item[];
    selectedItems: string[]; // Array of item codes
    onSelectItem: (code: string) => void;
    onEdit: (item: Item) => void;
    onView: (item: Item) => void;
    onDelete: (code: string) => void;
}

export function ItemsTableBody({
    items,
    selectedItems,
    onSelectItem,
    onEdit,
    onView,
    onDelete,
}: ItemsTableBodyProps) {
    return (
        <TableBody>
            {items.map((item) => {
                const isSelected = selectedItems.includes(item.code); // Check if code is in selectedItems array

                return (
                    <ItemsTableRow
                        key={item.code}
                        item={item}
                        isSelected={isSelected}
                        onSelect={() => onSelectItem(item.code)}
                        onEdit={() => onEdit(item)}
                        onView={() => onView(item)}
                        onDelete={() => onDelete(item.code)}
                    />
                );
            })}
        </TableBody>
    );
} 