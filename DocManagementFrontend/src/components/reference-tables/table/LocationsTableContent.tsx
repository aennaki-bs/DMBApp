import React from "react";
import { Table } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LocationsTableHeader } from "./content/LocationsTableHeader";
import { LocationsTableBody } from "./content/LocationsTableBody";
import { LocationDto } from "@/models/location";

interface LocationsTableContentProps {
  locations: LocationDto[];
  sortField: keyof LocationDto;
  sortDirection: "asc" | "desc";
  onSort: (field: keyof LocationDto) => void;
  selectedLocations: string[];
  onSelectLocation: (locationCode: string) => void;
  onSelectAll: () => void;
  onEditLocation: (location: LocationDto) => void;
  onDeleteLocation: (location: LocationDto) => void;
  onViewLocation: (location: LocationDto) => void;
}

export const LocationsTableContent: React.FC<LocationsTableContentProps> = ({
  locations,
  sortField,
  sortDirection,
  onSort,
  selectedLocations,
  onSelectLocation,
  onSelectAll,
  onEditLocation,
  onDeleteLocation,
  onViewLocation,
}) => {
  return (
    <div className="bg-background/60 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden shadow-xl">
      {/* Fixed Header */}
      <div className="border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <Table>
          <LocationsTableHeader
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
            selectedLocations={selectedLocations}
            locations={locations}
            onSelectAll={onSelectAll}
          />
        </Table>
      </div>

      {/* Scrollable Body */}
      <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px]">
        <Table>
          <LocationsTableBody
            locations={locations}
            selectedLocations={selectedLocations}
            onSelectLocation={onSelectLocation}
            onEditLocation={onEditLocation}
            onDeleteLocation={onDeleteLocation}
            onViewLocation={onViewLocation}
          />
        </Table>
      </ScrollArea>
    </div>
  );
};

export default LocationsTableContent; 