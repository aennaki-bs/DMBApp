import { useState, useEffect } from "react";
import { Database } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import LineElementTypeManagement from "@/components/line-elements/LineElementTypeManagement";

const ElementTypesPage = () => {
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Element Types"
        description="Manage element types for document line items"
        icon={<Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
      />
      <LineElementTypeManagement />
    </div>
  );
};

export default ElementTypesPage; 