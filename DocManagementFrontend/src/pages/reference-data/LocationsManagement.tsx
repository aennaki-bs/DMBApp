import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationsManagement from "@/components/line-elements/LocationsManagement";

const LocationsManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      {/* Header Section - styled consistently with Element Types */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <MapPin className="mr-3 h-6 w-6 text-orange-400" /> Locations
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage warehouse and storage locations for items
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
            disabled
            title="Create functionality will be activated later"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Location
          </Button>
        </div>
      </div>

      <LocationsManagement searchTerm={searchTerm} />
    </div>
  );
};

export default LocationsManagementPage; 