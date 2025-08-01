import {
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { DateRange } from "react-day-picker";
import { debounce } from "lodash";

interface ArchivedDocumentsFilterContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  activeFilters: ArchivedFilterState;
  applyFilters: (filters: ArchivedFilterState) => void;
  resetFilters: () => void;
  isFilterActive: boolean;
  activeFilterCount: number;
}

interface ArchivedFilterState {
  searchQuery: string;
  searchField: string;
  typeFilter: string;
  typeFilterField: string;
  dateRange: DateRange | undefined;
  dateFilterField: string;
  customFilters?: Record<string, any>;
}

const initialFilterState: ArchivedFilterState = {
  searchQuery: "",
  searchField: "all",
  typeFilter: "any",
  typeFilterField: "typeName",
  dateRange: undefined,
  dateFilterField: "docDate",
};

// Use local storage key to persist filters between sessions
const STORAGE_KEY = "docManagement_archivedDocumentsFilters";

// Helper to safely parse stored filters
const getSavedFilters = (): ArchivedFilterState | null => {
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
    console.error("Error parsing saved archived filters:", error);
  }
  return null;
};

const ArchivedDocumentsFilterContext = createContext<
  ArchivedDocumentsFilterContextType | undefined
>(undefined);

export function ArchivedDocumentsFilterProvider({ children }: { children: ReactNode }) {
  // Initialize with saved filters or defaults
  const savedFilters = getSavedFilters();

  const [searchQuery, setSearchQuery] = useState(
    savedFilters?.searchQuery || ""
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    savedFilters?.dateRange
  );
  const [activeFilters, setActiveFilters] = useState<ArchivedFilterState>(
    savedFilters || initialFilterState
  );

  // Debounced search to avoid too many filter updates
  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setActiveFilters((prev) => ({
        ...prev,
        searchQuery: query,
      }));

      // Save to local storage
      try {
        const updatedFilters = {
          ...activeFilters,
          searchQuery: query,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
      } catch (error) {
        console.error("Error saving archived filters:", error);
      }
    }, 300),
    [activeFilters]
  );

  // Calculate if any filters are active
  const isFilterActive = useMemo(() => {
    return (
      activeFilters.searchQuery !== "" ||
      activeFilters.typeFilter !== "any" ||
      activeFilters.dateRange !== undefined
    );
  }, [activeFilters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(
      (val) => val !== "any" && val !== undefined && val !== ""
    ).length;
  }, [activeFilters]);

  const applyFilters = useCallback(
    (filters: ArchivedFilterState) => {
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
        console.error("Error saving archived filters:", error);
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
      console.error("Error clearing saved archived filters:", error);
    }
  }, []);

  return (
    <ArchivedDocumentsFilterContext.Provider
      value={{
        searchQuery,
        setSearchQuery: debouncedSetSearchQuery,
        dateRange,
        setDateRange,
        activeFilters,
        applyFilters,
        resetFilters,
        isFilterActive,
        activeFilterCount,
      }}
    >
      {children}
    </ArchivedDocumentsFilterContext.Provider>
  );
}

export function useArchivedDocumentsFilter() {
  const context = useContext(ArchivedDocumentsFilterContext);

  // If used outside provider, create a local state
  if (!context) {
    const savedFilters = getSavedFilters();

    const [searchQuery, setSearchQuery] = useState(
      savedFilters?.searchQuery || ""
    );
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
      savedFilters?.dateRange
    );
    const [activeFilters, setActiveFilters] = useState<ArchivedFilterState>(
      savedFilters || initialFilterState
    );

    // Debounced search
    const debouncedSetSearchQuery = useCallback(
      debounce((query: string) => {
        setSearchQuery(query);
        setActiveFilters((prev) => ({
          ...prev,
          searchQuery: query,
        }));
      }, 300),
      []
    );

    const isFilterActive = useMemo(() => {
      return (
        activeFilters.searchQuery !== "" ||
        activeFilters.typeFilter !== "any" ||
        activeFilters.dateRange !== undefined
      );
    }, [activeFilters]);

    const activeFilterCount = useMemo(() => {
      return Object.values(activeFilters).filter(
        (val) => val !== "any" && val !== undefined && val !== ""
      ).length;
    }, [activeFilters]);

    const applyFilters = useCallback(
      (filters: ArchivedFilterState) => {
        const updatedFilters = {
          ...activeFilters,
          ...filters,
        };
        setActiveFilters(updatedFilters);

        if (filters.searchQuery !== undefined) {
          setSearchQuery(filters.searchQuery);
        }
        if (filters.dateRange !== undefined) {
          setDateRange(filters.dateRange);
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFilters));
        } catch (error) {
          console.error("Error saving archived filters:", error);
        }
      },
      [activeFilters]
    );

    const resetFilters = useCallback(() => {
      setActiveFilters(initialFilterState);
      setDateRange(undefined);
      setSearchQuery("");

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing saved archived filters:", error);
      }
    }, []);

    return {
      searchQuery,
      setSearchQuery: debouncedSetSearchQuery,
      dateRange,
      setDateRange,
      activeFilters,
      applyFilters,
      resetFilters,
      isFilterActive,
      activeFilterCount,
    };
  }

  return context;
} 