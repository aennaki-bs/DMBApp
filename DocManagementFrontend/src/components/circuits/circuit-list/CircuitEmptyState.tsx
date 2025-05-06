
import { CircleDashed, Search } from "lucide-react";

interface CircuitEmptyStateProps {
  searchQuery: string;
  isSimpleUser: boolean;
}

export function CircuitEmptyState({ searchQuery, isSimpleUser }: CircuitEmptyStateProps) {
  const isSearching = searchQuery.trim() !== '';
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 bg-blue-900/30 p-4 rounded-full">
        {isSearching ? (
          <Search className="h-10 w-10 text-blue-400" />
        ) : (
          <CircleDashed className="h-10 w-10 text-blue-400" />
        )}
      </div>
      
      <h3 className="text-xl font-medium text-white mb-2">
        {isSearching 
          ? "No matches found" 
          : "No circuits available"}
      </h3>
      
      <p className="text-blue-300 max-w-md">
        {isSearching ? (
          <>
            No circuits match your search criteria: <span className="font-medium text-blue-200">"{searchQuery}"</span>. 
            Try different keywords or clear your search.
          </>
        ) : (
          isSimpleUser 
            ? "There are no circuits configured yet. Please contact an administrator."
            : "Get started by creating your first circuit."
        )}
      </p>
    </div>
  );
}
