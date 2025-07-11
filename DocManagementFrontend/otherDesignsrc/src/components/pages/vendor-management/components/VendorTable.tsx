import React from "react";
import {
  ChevronUp,
  ChevronDown,
  Building,
  Globe,
  MapPin,
  MoreHorizontal,
  Edit,
  Copy,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Vendor } from "@/models/vendor";
import { toast } from "sonner";

interface VendorTableProps {
  vendors: Vendor[];
  hasVendors: boolean;
  selectedVendors: string[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  sortField: keyof Vendor;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof Vendor) => void;
  onSelectVendor: (vendorCode: string, checked: boolean) => void;
  onSelectAll: () => void;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendorCode: string) => void;
  searchQuery: string;
  countryFilter: string;
  clearAllFilters: () => void;
}

export function VendorTable({
  vendors,
  hasVendors,
  selectedVendors,
  isAllSelected,
  isIndeterminate,
  sortField,
  sortDirection,
  onSort,
  onSelectVendor,
  onSelectAll,
  onEdit,
  onDelete,
  searchQuery,
  countryFilter,
  clearAllFilters,
}: VendorTableProps) {
  const renderSortIcon = (field: keyof Vendor) => {
    if (sortField !== field)
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  const getSortButton = (
    field: keyof Vendor,
    label: string,
    icon?: React.ReactNode
  ) => (
    <button
      className="flex items-center gap-1 hover:text-primary transition-colors"
      onClick={() => onSort(field)}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
      {renderSortIcon(field)}
    </button>
  );

  const getCountryBadgeColor = (country: string) => {
    const colors: { [key: string]: string } = {
      US: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      CA: "bg-red-500/10 text-red-500 border-red-500/20",
      UK: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      FR: "bg-green-500/10 text-green-500 border-green-500/20",
      DE: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      MY: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      MA: "bg-pink-500/10 text-pink-500 border-pink-500/20",
    };
    return colors[country] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  if (!hasVendors) {
    return (
      <div className="relative h-full flex items-center justify-center z-10 py-20">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">No vendors found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {searchQuery || countryFilter !== "any"
                ? "No vendors match your current filters. Try adjusting your search criteria."
                : "Get started by adding your first vendor to the system."}
            </p>
          </div>
          {(searchQuery || countryFilter !== "any") && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="mt-4"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col z-10">
      {/* Fixed Header */}
      <div className="flex-shrink-0 overflow-x-auto table-glass-header border-b border-border/20 sticky top-0 z-20 bg-background/95 backdrop-blur-sm">
        <div className="min-w-[930px]">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el && el.querySelector) {
                        const input = el.querySelector(
                          'input[type="checkbox"]'
                        ) as HTMLInputElement;
                        if (input) input.indeterminate = isIndeterminate;
                      }
                    }}
                    onCheckedChange={onSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[140px]">
                  {getSortButton(
                    "vendorCode",
                    "Vendor",
                    <Building className="h-3.5 w-3.5" />
                  )}
                </TableHead>
                <TableHead className="w-[200px]">
                  {getSortButton("name", "Name")}
                </TableHead>
                <TableHead className="w-[120px]">
                  {getSortButton(
                    "country",
                    "Country",
                    <Globe className="h-3.5 w-3.5" />
                  )}
                </TableHead>
                <TableHead className="w-[150px]">
                  {getSortButton(
                    "city",
                    "Location",
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                </TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>

      {/* Scrollable Body */}
      <div
        className="flex-1 overflow-hidden"
        style={{ height: "calc(100% - 56px)" }}
      >
        <ScrollArea className="h-full w-full">
          <div className="min-w-[930px]">
            <Table className="table-fixed w-full">
              <TableBody>
                {vendors.map((vendor) => {
                  const isSelected = selectedVendors.includes(
                    vendor.vendorCode
                  );
                  return (
                    <TableRow
                      key={vendor.vendorCode}
                      className={`transition-all duration-200 cursor-pointer select-none border-l-4 ${
                        isSelected
                          ? "bg-primary/10 border-primary/30 shadow-sm border-l-primary"
                          : "hover:bg-muted/30 border-l-transparent"
                      }`}
                      onClick={() =>
                        onSelectVendor(vendor.vendorCode, !isSelected)
                      }
                    >
                      <TableCell className="w-12">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            onSelectVendor(vendor.vendorCode, !!checked)
                          }
                          className="pointer-events-none"
                        />
                      </TableCell>
                      <TableCell className="w-[140px]">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                              {vendor.vendorCode.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {vendor.vendorCode}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {vendor.vendorCode}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium truncate">
                            {vendor.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-[120px]">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-2 py-1 transition-colors duration-200 ${getCountryBadgeColor(
                            vendor.country || ""
                          )}`}
                        >
                          {vendor.country || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-[150px]">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {vendor.city || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-16">
                        <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-[160px]"
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(vendor);
                                }}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(
                                    vendor.vendorCode
                                  );
                                  toast.success(
                                    "Vendor code copied to clipboard"
                                  );
                                }}
                                className="cursor-pointer"
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Code
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(vendor.vendorCode);
                                }}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
