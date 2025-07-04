import React, { useState, useEffect } from "react";
import { SearchResultItem } from "@/hooks/useNavSearch";
import * as Icons from "lucide-react";

type IconName = keyof typeof Icons;

interface SearchResultsProps {
  results: SearchResultItem[];
  isSearching: boolean;
  onSelect: (path: string) => void;
  searchQuery: string;
}

export function SearchResults({
  results,
  isSearching,
  onSelect,
  searchQuery,
  onClose,
}: SearchResultsProps & { onClose?: () => void }) {
  // All hooks must be called unconditionally at the top
  const hasResults = results.length > 0;

  // Group results by category
  const groupedResults = React.useMemo(() => {
    return results.reduce<Record<string, SearchResultItem[]>>((acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = [];
      }
      acc[result.category].push(result);
      return acc;
    }, {});
  }, [results]);

  // Render dynamic icon
  const renderIcon = (iconName: string | undefined) => {
    if (!iconName) return null;
    const IconComponent = Icons[iconName as IconName] as any;
    return IconComponent ? (
      <IconComponent className="h-4 w-4 mr-2 text-blue-400" />
    ) : null;
  };

  // Handle close on Escape or click outside
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // If no query, show empty state
  if (!searchQuery.trim()) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-[99999] mt-2">
      <div className="bg-white dark:bg-gray-800 border-2 border-blue-500 rounded-xl shadow-2xl p-4 max-h-[60vh] overflow-y-auto">
        {isSearching ? (
          <div className="p-4 text-center text-gray-600 dark:text-gray-300">
            <Icons.Loader className="h-5 w-5 mx-auto animate-spin text-blue-500 mb-2" />
            <p className="text-sm">Searching...</p>
          </div>
        ) : (
          <>
            {!hasResults && searchQuery.length > 0 ? (
              <div className="p-4 text-center">
                <Icons.SearchX className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  No results found for "{searchQuery}"
                </p>
              </div>
            ) : (
              <div className="py-2">
                {Object.entries(groupedResults).map(([category, items]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    <h3 className="text-xs font-medium text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded">
                      {category}
                    </h3>
                    {items.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-start py-2 px-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-900 dark:text-gray-100 rounded-lg transition-colors border-l-2 border-transparent hover:border-blue-500"
                        onClick={() => onSelect(result.path)}
                      >
                        <div className="flex items-center w-full">
                          {renderIcon(result.icon)}
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {result.title}
                            </div>
                            {result.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {result.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
