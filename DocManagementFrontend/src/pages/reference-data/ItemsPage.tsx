import { useState, useEffect } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ItemsManagement from "@/components/line-elements/ItemsManagement";
import { toast } from "sonner";
import lineElementsService from "@/services/lineElementsService";
import { LignesElementType } from "@/models/lineElements";

const ItemsPage = () => {
  const [elementType, setElementType] = useState<
    LignesElementType | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchElementType = async () => {
      try {
        setIsLoading(true);
        const elementTypes = await lineElementsService.elementTypes.getAll();
        const itemElementType = elementTypes.find(
          (et) => et.tableName.toLowerCase() === "item"
        );
        setElementType(itemElementType);
      } catch (error) {
        console.error("Failed to fetch element type:", error);
        toast.error("Failed to load element type information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchElementType();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              Loading items...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header Section - styled consistently with Element Types */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Package className="mr-3 h-6 w-6 text-emerald-400" /> Items
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage items used in document lines
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
            disabled
            title="Create functionality will be activated later"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Item
          </Button>
        </div>
      </div>
      
      <ItemsManagement 
        searchTerm="" 
        elementType={elementType}
      />
    </div>
  );
};

export default ItemsPage;
