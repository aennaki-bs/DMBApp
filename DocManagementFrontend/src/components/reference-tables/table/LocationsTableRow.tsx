import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LocationsActionsDropdown } from "./row/LocationsActionsDropdown";
import { LocationDto } from "@/models/location";

interface LocationsTableRowProps {
  location: LocationDto;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const LocationsTableRow: React.FC<LocationsTableRowProps> = ({
  location,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onView,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TableRow className="border-b border-primary/10 hover:bg-primary/5 transition-all duration-200">
      <TableCell className="w-[50px] text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select ${location.locationCode}`}
          className="border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
      </TableCell>
      <TableCell className="font-mono font-semibold text-foreground">
        <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20 transition-colors">
          {location.locationCode}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        <div className="truncate max-w-[300px]">{location.description}</div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(location.createdAt)}
      </TableCell>
      <TableCell className="text-right pr-6">
        <LocationsActionsDropdown
          location={location}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
        />
      </TableCell>
    </TableRow>
  );
};

export default LocationsTableRow; 