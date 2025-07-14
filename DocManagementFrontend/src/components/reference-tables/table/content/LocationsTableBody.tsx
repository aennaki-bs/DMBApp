import React from "react";
import { TableBody } from "@/components/ui/table";
import { LocationsTableRow } from "../LocationsTableRow";
import { LocationDto } from "@/models/location";

interface LocationsTableBodyProps {
  locations: LocationDto[];
  selectedLocations: string[];
  onSelectLocation: (locationCode: string) => void;
  onEditLocation: (location: LocationDto) => void;
  onDeleteLocation: (location: LocationDto) => void;
  onViewLocation: (location: LocationDto) => void;
}

export const LocationsTableBody: React.FC<LocationsTableBodyProps> = ({
  locations,
  selectedLocations,
  onSelectLocation,
  onEditLocation,
  onDeleteLocation,
  onViewLocation,
}) => {
  return (
    <TableBody>
      {locations.map((location) => (
        <LocationsTableRow
          key={location.locationCode}
          location={location}
          isSelected={selectedLocations.includes(location.locationCode)}
          onSelect={() => onSelectLocation(location.locationCode)}
          onEdit={() => onEditLocation(location)}
          onDelete={() => onDeleteLocation(location)}
          onView={() => onViewLocation(location)}
        />
      ))}
    </TableBody>
  );
};

export default LocationsTableBody; 