import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
} from "react";
import { DateRange } from "react-day-picker";
import { FilterState } from "@/components/table";

interface DocumentsFilterContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  activeFilters: FilterState;
  applyFilters: (filters: FilterState) => void;
  resetFilters: () => void;
}

const initialFilterState: FilterState = {
  searchQuery: "",
  searchField: "all",
  statusFilter: "any",
  typeFilter: "any",
  dateRange: undefined,
};

// Use local storage key to persist filters between sessions
const STORAGE_KEY = "docManagement_documentsFilters";

// Helper to safely parse stored filters
const getSavedFilters = (): FilterState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Convert date strings back to Date objects if they exist
      if (parsed.dateRange) {
        if (parsed.dateRange.from) {
          parsed.dateRange.from = new Date(parsed.dateRange.from);
        }
        if (parsed.dateRange.to) {
          parsed.dateRange.to = new Date(parsed.dateRange.to);
        }
      }

      return parsed;
    }
  } catch (error) {
    console.error("Error parsing saved filters:", error);
  }
  return null;
};

const DocumentsFilterContext = createContext<
  DocumentsFilterContextType | undefined
>(undefined);

export function DocumentsFilterProvider({ children }: { children: ReactNode }) {
  // Initialize with saved filters or defaults
  const savedFilters = getSavedFilters();

  const [searchQuery, setSearchQuery] = useState(
    savedFilters?.searchQuery || ""
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    savedFilters?.dateRange
  );
  const [activeFilters, setActiveFilters] = useState<FilterState>(
    savedFilters || initialFilterState
  );

  const applyFilters = useCallback(
    (filters: FilterState) => {
      // Update local state for UI components
      if (filters.searchQuery !== undefined) {
        setSearchQuery(filters.searchQuery);
      }
      if (filters.dateRange !== undefined) {
        setDateRange(filters.dateRange);
      }

      // Update the full filter state
      const updatedFilters = {
        ...activeFilters,
        ...filters,
      };

      setActiveFilters(updatedFilters);

      // Save to local storage for persistence
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
      } catch (error) {
        console.error("Error saving filters:", error);
      }
    },
    [activeFilters]
  );

  const resetFilters = useCallback(() => {
    setActiveFilters(initialFilterState);
    setDateRange(undefined);
    setSearchQuery("");

    // Clear saved filters
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing saved filters:", error);
    }
  }, []);

  return (
    <DocumentsFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        dateRange,
        setDateRange,
        activeFilters,
        applyFilters,
        resetFilters,
      }}
    >
      {children}
    </DocumentsFilterContext.Provider>
  );
}

export function useDocumentsFilter() {
  const context = useContext(DocumentsFilterContext);

  // If used outside provider, create a local state
  if (!context) {
    const savedFilters = getSavedFilters();

    const [searchQuery, setSearchQuery] = useState(
      savedFilters?.searchQuery || ""
    );
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
      savedFilters?.dateRange
    );
    const [activeFilters, setActiveFilters] = useState<FilterState>(
      savedFilters || initialFilterState
    );

    const applyFilters = useCallback(
      (filters: FilterState) => {
        // Update local state for UI components
        if (filters.searchQuery !== undefined) {
          setSearchQuery(filters.searchQuery);
        }
        if (filters.dateRange !== undefined) {
          setDateRange(filters.dateRange);
        }

        // Update the full filter state
        const updatedFilters = {
          ...activeFilters,
          ...filters,
        };

        setActiveFilters(updatedFilters);

        // Save to local storage for persistence
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
        } catch (error) {
          console.error("Error saving filters:", error);
        }
      },
      [activeFilters]
    );

    const resetFilters = useCallback(() => {
      setActiveFilters(initialFilterState);
      setDateRange(undefined);
      setSearchQuery("");

      // Clear saved filters
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing saved filters:", error);
      }
    }, []);

    return {
      searchQuery,
      setSearchQuery,
      dateRange,
      setDateRange,
      activeFilters,
      applyFilters,
      resetFilters,
    };
  }

  return context;
}
