import { CircleDashed, Search, Filter } from "lucide-react";

interface CircuitEmptyStateProps {
  searchQuery: string;
  statusFilter?: string;
  isSimpleUser: boolean;
}

export function CircuitEmptyState({
  searchQuery,
  statusFilter = "any",
  isSimpleUser,
}: CircuitEmptyStateProps) {
  const isSearching = searchQuery.trim() !== "";
  const isFiltering = statusFilter !== "any";
  const hasFilters = isSearching || isFiltering;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 bg-blue-900/20 p-4 rounded-full">
        {hasFilters ? (
          isSearching ? (
            <Search className="h-10 w-10 text-blue-400" />
          ) : (
            <Filter className="h-10 w-10 text-blue-400" />
          )
        ) : (
          <CircleDashed className="h-10 w-10 text-blue-400" />
        )}
      </div>

      <h3 className="text-xl font-medium text-white mb-2">
        {hasFilters ? "No matches found" : "No circuits available"}
      </h3>

      <p className="text-blue-300 max-w-md">
        {hasFilters ? (
          <>
            No circuits match your{" "}
            {isSearching && isFiltering
              ? "search and filter criteria"
              : isSearching
              ? "search criteria"
              : "filter criteria"}
            .
            {isSearching && (
              <span className="block mt-1 font-medium text-blue-200">
                Search: "{searchQuery}"
              </span>
            )}
            {isFiltering && (
              <span className="block mt-1 font-medium text-blue-200">
                Status: {statusFilter === "active" ? "Active" : "Inactive"}
              </span>
            )}
            Try different criteria or clear your filters.
          </>
        ) : isSimpleUser ? (
          "There are no circuits configured yet. Please contact an administrator."
        ) : (
          "Get started by creating your first circuit."
        )}
      </p>
    </div>
  );
}
