import { TableBody } from "@/components/ui/table";
import { LocationDto } from "@/models/location";
import { LocationsTableRow } from "./LocationsTableRow";

interface LocationsTableBodyProps {
  locations: LocationDto[];
  selectedItems: string[]; // Array of location codes
  onSelectLocation: (code: string) => void;
  onEdit: (location: LocationDto) => void;
  onView: (location: LocationDto) => void;
  onDelete: (code: string) => void;
}

export function LocationsTableBody({
  locations,
  selectedItems,
  onSelectLocation,
  onEdit,
  onView,
  onDelete,
}: LocationsTableBodyProps) {
  return (
    <TableBody>
      {locations.map((location) => {
        const isSelected = selectedItems.includes(location.locationCode); // Check if code is in selectedItems array

        return (
          <LocationsTableRow
            key={location.locationCode}
            location={location}
            isSelected={isSelected}
            onSelect={() => onSelectLocation(location.locationCode)}
            onEdit={() => onEdit(location)}
            onView={() => onView(location)}
            onDelete={() => onDelete(location.locationCode)}
          />
        );
      })}
    </TableBody>
  );
} 