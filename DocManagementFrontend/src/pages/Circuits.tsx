import CircuitsList from "@/components/circuits/CircuitsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  InfoIcon,
  Lock,
  AlertCircle,
  Plus,
  Search,
  GitBranch,
  Filter,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CreateCircuitDialog from "@/components/circuits/CreateCircuitDialog";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchAndFilterBar } from "@/components/shared/SearchAndFilterBar";
import { FilterContent } from "@/components/shared/FilterContent";
import { FilterBadges, FilterBadge } from "@/components/shared/FilterBadges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence } from "framer-motion";

export default function CircuitsPage() {
  const { user } = useAuth();
  const [apiError, setApiError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("any");
  const [searchField, setSearchField] = useState("all");
  const isSimpleUser = user?.role === "SimpleUser";

  // For dialog open/close state and refetch trigger
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshCircuits, setRefreshCircuits] = useState(0);

  // Clear any API errors when component mounts or when user changes
  useEffect(() => {
    setApiError("");
  }, [user]);

  // Function to handle API errors from child components
  const handleApiError = (errorMessage: string) => {
    setApiError(errorMessage);
  };

  // Refetch circuits list after creation
  const handleCircuitCreated = () => {
    setRefreshCircuits((c) => c + 1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter("any");
    setFilterOpen(false);
  };

  // Create filter badges
  const filterBadges: FilterBadge[] = [];

  if (statusFilter !== "any") {
    filterBadges.push({
      id: "status",
      label: "Status",
      value: statusFilter === "active" ? "Active" : "Inactive",
      onRemove: () => setStatusFilter("any"),
    });
  }

  // Search fields
  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "code", label: "Circuit Code" },
    { id: "title", label: "Title" },
    { id: "description", label: "Description" },
  ];

  return (
    <div className="space-y-6 p-6">
      <CreateCircuitDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={handleCircuitCreated}
      />

      <PageHeader
        title="Circuit Management"
        description={
          isSimpleUser
            ? "View document workflow circuits"
            : "Create and manage document workflow circuits"
        }
        icon={<GitBranch className="h-6 w-6 text-blue-400" />}
        actions={
          !isSimpleUser && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Circuit
            </Button>
          )
        }
      />

      {apiError && (
        <Alert
          variant="destructive"
          className="mb-4 border-red-800 bg-red-950/50 text-red-300"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 transition-all">
        <SearchAndFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchFields={searchFields}
          selectedSearchField={searchField}
          onSearchFieldChange={setSearchField}
          placeholder="Search circuits..."
          filterOpen={filterOpen}
          onFilterOpenChange={setFilterOpen}
          filterContent={
            <FilterContent
              title="Filter Circuits"
              onClearAll={clearAllFilters}
              onApply={() => setFilterOpen(false)}
            >
              {/* Status filter */}
              <div>
                <label className="block text-sm text-blue-300 mb-1">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    <SelectItem value="any" className="hover:bg-blue-800/40">
                      Any Status
                    </SelectItem>
                    <SelectItem value="active" className="hover:bg-blue-800/40">
                      Active
                    </SelectItem>
                    <SelectItem
                      value="inactive"
                      className="hover:bg-blue-800/40"
                    >
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FilterContent>
          }
        />

        <FilterBadges badges={filterBadges} />

        <CircuitsList
          onApiError={handleApiError}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          key={refreshCircuits}
        />
      </div>
    </div>
  );
}
