import React from "react";
import { TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown } from "lucide-react";
import { LocationDto } from "@/models/location";

interface LocationsTableHeaderProps {
  sortField: keyof LocationDto;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof LocationDto) => void;
  selectedLocations: string[];
  locations: LocationDto[];
  onSelectAll: () => void;
}

export const LocationsTableHeader: React.FC<LocationsTableHeaderProps> = ({
  sortField,
  sortDirection,
  onSort,
  selectedLocations,
  locations,
  onSelectAll,
}) => {
  const renderSortIcon = (field: keyof LocationDto) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const headerClass = (field: keyof LocationDto) => `
    text-blue-800 dark:text-blue-200 font-medium cursor-pointer select-none
    hover:text-blue-900 dark:hover:text-blue-100 transition-colors duration-150
    ${sortField === field ? "text-blue-900 dark:text-blue-100" : ""}
  `;

  return (
    <TableHeader>
      <TableRow className="border-primary/20 hover:bg-transparent">
        <TableHead className="w-[50px] text-center">
          <Checkbox
            checked={locations.length > 0 && locations.every((location) => selectedLocations.includes(location.locationCode))}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
            className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </TableHead>
        <TableHead
          className={`${headerClass("locationCode")} cursor-pointer hover:bg-primary/5 transition-colors`}
          onClick={() => onSort("locationCode")}
        >
          <div className="flex items-center gap-2">
            Location Code {renderSortIcon("locationCode")}
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
  );
};

export default LocationsTableHeader; 