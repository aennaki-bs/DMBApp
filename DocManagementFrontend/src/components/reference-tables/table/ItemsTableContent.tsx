import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Item } from "@/models/lineElements";

interface ItemsTableContentProps {
  items: Item[];
  sortField: keyof Item;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof Item) => void;
  selectedItems: string[];
  onSelectItem: (itemCode: string) => void;
  onSelectAll: () => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onViewItem: (item: Item) => void;
}

export const ItemsTableContent: React.FC<ItemsTableContentProps> = ({
  items,
  sortField,
  sortDirection,
  onSort,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onEditItem,
  onDeleteItem,
  onViewItem,
}) => {
  const renderSortIcon = (field: keyof Item) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const headerClass = (field: keyof Item) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-background/60 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden shadow-xl">
      {/* Fixed Header */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20 hover:bg-transparent">
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={items.length > 0 && items.every((item) => selectedItems.includes(item.code))}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                  className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
              </TableHead>
              <TableHead
                className={`${headerClass("code")} cursor-pointer hover:bg-primary/5 transition-colors`}
                onClick={() => onSort("code")}
              >
                <div className="flex items-center gap-2">
                  Code {renderSortIcon("code")}
                </div>
              </TableHead>
              <TableHead
                className={`${headerClass("description")} cursor-pointer hover:bg-primary/5 transition-colors`}
                onClick={() => onSort("description")}
              >
                <div className="flex items-center gap-2">
                  Description {renderSortIcon("description")}
                </div>
              </TableHead>
              <TableHead
                className={`${headerClass("unite")} cursor-pointer hover:bg-primary/5 transition-colors`}
                onClick={() => onSort("unite")}
              >
                <div className="flex items-center gap-2">
                  Unit Code {renderSortIcon("unite")}
                </div>
              </TableHead>
              <TableHead
                className={`${headerClass("createdAt")} cursor-pointer hover:bg-primary/5 transition-colors`}
                onClick={() => onSort("createdAt")}
              >
                <div className="flex items-center gap-2">
                  Created At {renderSortIcon("createdAt")}
                </div>
              </TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Scrollable Body */}
      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
        <Table>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.code}
                className="border-b border-primary/10 hover:bg-primary/5 transition-all duration-200"
              >
                <TableCell className="w-[50px] text-center">
                  <Checkbox
                    checked={selectedItems.includes(item.code)}
                    onCheckedChange={() => onSelectItem(item.code)}
                    aria-label={`Select ${item.code}`}
                    className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </TableCell>
                <TableCell className="font-mono font-semibold text-foreground">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                    {item.code}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="truncate max-w-[300px]">{item.description}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {item.unite ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                      {item.unite}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground/60 text-sm">No unit</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(item.createdAt)}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewItem(item)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                      title="View item details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditItem(item)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                      title="Edit item"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteItem(item)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
                      title="Delete item"
                      disabled={item.elementTypesCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ItemsTableContent; 