import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { LocationDto } from "@/models/location";

interface LocationsActionsDropdownProps {
  location: LocationDto;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}

export const LocationsActionsDropdown: React.FC<LocationsActionsDropdownProps> = ({
  location,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={onView}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
        title="View location details"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
        title="Edit location"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
        title="Delete location"
        disabled
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LocationsActionsDropdown; 