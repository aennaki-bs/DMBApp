import { useState, useEffect } from "react";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LineElementTypeManagement from "@/components/line-elements/LineElementTypeManagement";

const ElementTypesPage = () => {
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  return (
    <div className="space-y-6 p-6">
      {/* Header Section - styled consistently with other admin pages */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 shadow-md transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Database className="mr-3 h-6 w-6 text-blue-400" /> Element Types
            </h1>
            <p className="text-sm md:text-base text-gray-400">
              Manage element types for document line items
            </p>
          </div>
          <Button
            onClick={() => setIsCreateWizardOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Element Type
          </Button>
        </div>
      </div>
      
      <LineElementTypeManagement 
        isCreateWizardOpen={isCreateWizardOpen}
        setIsCreateWizardOpen={setIsCreateWizardOpen}
      />
    </div>
  );
};

export default ElementTypesPage; 