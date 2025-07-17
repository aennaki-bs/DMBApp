import { useState, useEffect, useMemo } from "react";
import { useArchivedDocumentsFilter } from "@/hooks/documents/useArchivedDocumentsFilter";
import { Button } from "@/components/ui/button";
import {
  Filter,
  Calendar,
  ChevronDown,
  SlidersHorizontal,
  CalendarRange,
  Check,
  Tag,
  FileText,
  Clock,
  RefreshCw,
  User,
} from "lucide-react";
import {
  DEFAULT_TYPE_FILTERS,
} from "@/components/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  format,
  isToday,
  isYesterday,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import documentTypeService from "@/services/documentTypeService";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "@/hooks/useTranslation";
import { DateRangePicker } from "@/components/ui/date-range-picker";

const DATE_PRESETS = [
  {
    label: "Today",
    value: "today",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Yesterday",
    value: "yesterday",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "This Week",
    value: "thisWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Last Week",
    value: "lastWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "This Month",
    value: "thisMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Last Month",
    value: "lastMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "Custom Range",
    value: "custom",
    icon: <Calendar className="h-3.5 w-3.5 mr-1.5" />,
  },
];

interface ArchivedDocumentsFilterBarProps {
  onClose?: () => void;
}

export default function ArchivedDocumentsFilterBar({ onClose }: ArchivedDocumentsFilterBarProps) {
  const { t } = useTranslation();
  const {
    dateRange,
    setDateRange,
    activeFilters,
    applyFilters,
    resetFilters,
    isFilterActive,
    activeFilterCount,
  } = useArchivedDocumentsFilter();

  const [activeTab, setActiveTab] = useState("filters");
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<string>("custom");

  // Advanced filters state
  const [typeFilter, setTypeFilter] = useState(
    activeFilters.typeFilter || "any"
  );
  const [typeFilterField, setTypeFilterField] = useState("typeName");
  const [advancedDateRange, setAdvancedDateRange] = useState<
    DateRange | undefined
  >(dateRange);

  // Date filter state
  const [dateFilterField, setDateFilterField] = useState(
    activeFilters.dateFilterField || "docDate"
  );

  // Date field options
  const dateFieldOptions = [
    { id: "docDate", label: "Document Date" },
    { id: "comptableDate", label: "Posting Date" },
    { id: "createdAt", label: "Created Date" },
    { id: "updatedAt", label: "Updated Date" }
  ];

  // Fetch document types for the filter
  const { data: documentTypes } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => documentTypeService.getAllDocumentTypes(),
  });

  // Generate document type filter options
  const typeFilterOptions = useMemo(() => {
    const baseOptions = [...DEFAULT_TYPE_FILTERS];

    if (documentTypes && documentTypes.length > 0) {
      documentTypes.forEach((type) => {
        // Add options based on the selected filter field
        if (typeFilterField === "typeName") {
        baseOptions.push({
          id: type.id || 0,
          label: type.typeName,
            value: type.typeName, // Use typeName as the filter value
          });
        } else if (typeFilterField === "id") {
          baseOptions.push({
            id: type.id || 0,
            label: `${type.typeName} (ID: ${type.id})`,
            value: String(type.id), // Use ID as the filter value
        });
        }
      });
    }

    return baseOptions;
  }, [documentTypes, typeFilterField]);

  // Update local state when activeFilters change
  useEffect(() => {
    setTypeFilter(activeFilters.typeFilter || "any");
    setTypeFilterField(activeFilters.typeFilterField || "typeName");
    setAdvancedDateRange(activeFilters.dateRange);
    setDateFilterField(activeFilters.dateFilterField || "docDate");

    // Determine if a date preset is active
    if (activeFilters.dateRange) {
      const preset = getDatePresetFromRange(activeFilters.dateRange);
      setSelectedDatePreset(preset || "custom");
    } else {
      setSelectedDatePreset("custom");
    }
  }, [activeFilters]);

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    applyFilters({
      ...activeFilters,
      typeFilter: value,
    });
  };

  const handleTypeFilterFieldChange = (value: string) => {
    setTypeFilterField(value);
    applyFilters({
      ...activeFilters,
      typeFilterField: value,
    });
  };

  const handleDateFieldChange = (value: string) => {
    setDateFilterField(value);
    applyFilters({
      ...activeFilters,
      dateFilterField: value,
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setAdvancedDateRange(range);
    applyFilters({
      ...activeFilters,
      dateRange: range,
    });
  };

  const applyAdvancedFilters = () => {
    applyFilters({
      ...activeFilters,
      typeFilter,
      typeFilterField,
      dateRange: advancedDateRange,
      dateFilterField,
    });
  };

  const clearAllFilters = () => {
    resetFilters();
    setTypeFilter("any");
    setTypeFilterField("typeName");
    setAdvancedDateRange(undefined);
    setDateFilterField("docDate");
    setSelectedDatePreset("custom");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "c") {
        e.preventDefault();
        clearAllFilters();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const applyDatePreset = (preset: string) => {
    setSelectedDatePreset(preset);
    let range: DateRange | undefined;

    const today = new Date();
    const yesterday = subDays(today, 1);
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    const startOfLastWeek = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    const endOfLastWeek = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);
    const startOfLastMonth = startOfMonth(subDays(today, 30));
    const endOfLastMonth = endOfMonth(subDays(today, 30));

    switch (preset) {
      case "today":
        range = { from: today, to: today };
        break;
      case "yesterday":
        range = { from: yesterday, to: yesterday };
        break;
      case "thisWeek":
        range = { from: startOfThisWeek, to: endOfThisWeek };
        break;
      case "lastWeek":
        range = { from: startOfLastWeek, to: endOfLastWeek };
        break;
      case "thisMonth":
        range = { from: startOfThisMonth, to: endOfThisMonth };
        break;
      case "lastMonth":
        range = { from: startOfLastMonth, to: endOfLastMonth };
        break;
      default:
        range = undefined;
    }

    setAdvancedDateRange(range);
    handleDateRangeChange(range);
  };

  const getDatePresetFromRange = (range: DateRange): string | null => {
    if (!range?.from || !range?.to) return null;

    const today = new Date();
    const yesterday = subDays(today, 1);

    // Check if it's today
    if (
      isToday(range.from) &&
      isToday(range.to) &&
      range.from.getTime() === range.to.getTime()
    ) {
      return "today";
    }

    // Check if it's yesterday
    if (
      isYesterday(range.from) &&
      isYesterday(range.to) &&
      range.from.getTime() === range.to.getTime()
    ) {
      return "yesterday";
    }

    // Check if it's this week
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });
    if (
      format(range.from, "yyyy-MM-dd") === format(startOfThisWeek, "yyyy-MM-dd") &&
      format(range.to, "yyyy-MM-dd") === format(endOfThisWeek, "yyyy-MM-dd")
    ) {
      return "thisWeek";
    }

    // Check if it's last week
    const startOfLastWeek = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    const endOfLastWeek = endOfWeek(subDays(today, 7), { weekStartsOn: 1 });
    if (
      format(range.from, "yyyy-MM-dd") === format(startOfLastWeek, "yyyy-MM-dd") &&
      format(range.to, "yyyy-MM-dd") === format(endOfLastWeek, "yyyy-MM-dd")
    ) {
      return "lastWeek";
    }

    // Check if it's this month
    const startOfThisMonth = startOfMonth(today);
    const endOfThisMonth = endOfMonth(today);
    if (
      format(range.from, "yyyy-MM-dd") === format(startOfThisMonth, "yyyy-MM-dd") &&
      format(range.to, "yyyy-MM-dd") === format(endOfThisMonth, "yyyy-MM-dd")
    ) {
      return "thisMonth";
    }

    // Check if it's last month
    const startOfLastMonth = startOfMonth(subDays(today, 30));
    const endOfLastMonth = endOfMonth(subDays(today, 30));
    if (
      format(range.from, "yyyy-MM-dd") === format(startOfLastMonth, "yyyy-MM-dd") &&
      format(range.to, "yyyy-MM-dd") === format(endOfLastMonth, "yyyy-MM-dd")
    ) {
      return "lastMonth";
    }

    return null;
  };

  const formatDateRangeDisplay = (range: DateRange | undefined): string => {
    if (!range?.from) return "Any date";
    if (!range.to) return format(range.from, "MMM dd, yyyy");
    if (range.from.getTime() === range.to.getTime()) {
      return format(range.from, "MMM dd, yyyy");
    }
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`;
  };

  return (
    <div className="w-[420px] bg-[#1a2c6b] border border-blue-900/50 shadow-2xl rounded-xl backdrop-blur-md">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-blue-900/30 bg-gradient-to-r from-[#1a2c6b]/50 to-[#0a1033]/50 rounded-t-xl"
      >
        <h3 className="text-lg font-medium text-blue-100 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-400" />
          Filter Archived Documents
        </h3>
        <p className="text-sm text-blue-300/80 mt-1">
          Refine your archived document list using the filters below
        </p>
      </motion.div>

      <Tabs
        defaultValue="filters"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full bg-blue-900/20 border-b border-blue-900/30 rounded-none">
          <TabsTrigger
            value="filters"
            className="flex-1 data-[state=active]:bg-blue-800/30"
          >
            <Tag className="h-4 w-4 mr-2" /> Type Filters
          </TabsTrigger>
          <TabsTrigger
            value="date"
            className="flex-1 data-[state=active]:bg-blue-800/30"
          >
            <CalendarRange className="h-4 w-4 mr-2" /> Date Range
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[300px] overflow-auto">
          <TabsContent value="filters" className="p-4 space-y-4 mt-0">
            {/* Document Type filter */}
            <div>
              <label className="text-sm font-medium text-blue-200 block mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-blue-400" />
                Document Type
              </label>
              {/* <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <Select
                    value={typeFilterField}
                    onValueChange={handleTypeFilterFieldChange}
                  >
                <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                  <SelectValue>
                        {typeFilterField === "typeName" ? "By Name" : "By ID"}
                  </SelectValue>
                </SelectTrigger>
                    <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                      <SelectItem value="typeName" className="hover:bg-blue-800/40">By Name</SelectItem>
                      <SelectItem value="id" className="hover:bg-blue-800/40">By ID</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div> */}
              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                  {typeFilterOptions.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.value}
                      className="hover:bg-blue-800/40"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="date" className="p-4 space-y-4 mt-0">
            {/* Date range presets */}
            <div>
              <label className="text-sm font-medium text-blue-200 block mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-400" />
                Quick Date Ranges
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "bg-[#22306e] text-blue-100 border border-blue-900/40 hover:bg-blue-800/40 h-9 justify-start",
                      selectedDatePreset === preset.value &&
                        "bg-blue-800 border-blue-500"
                    )}
                    onClick={() => applyDatePreset(preset.value)}
                  >
                    {preset.icon}
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-blue-200 block mb-2 flex items-center">
                <CalendarRange className="h-4 w-4 mr-2 text-blue-400" />
                Date Filter
                </label>
              
              {/* Date field selector */}
              <div className="mb-2">
                <Select
                  value={dateFilterField}
                  onValueChange={handleDateFieldChange}
                >
                  <SelectTrigger className="w-full bg-[#22306e] text-blue-100 border border-blue-900/40 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                    <SelectValue>
                      {dateFieldOptions.find(opt => opt.id === dateFilterField)?.label || "Document Date"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#22306e] text-blue-100 border border-blue-900/40">
                    {dateFieldOptions.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className="hover:bg-blue-800/40"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DateRangePicker
                date={advancedDateRange}
                onDateChange={handleDateRangeChange}
                className="w-full"
                  />
                </div>

            {/* <div className="mt-2">
              <div className="bg-blue-900/20 p-2 rounded-md border border-blue-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-300 font-medium">
                    Active Date Filter:
                  </span>
                  <span className="text-sm text-white">
                    {dateRange
                      ? formatDateRangeDisplay(dateRange)
                      : "Any date"}
                  </span>
                </div>
              </div>
            </div> */}
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <div className="p-3 border-t border-blue-900/30 bg-blue-900/20 flex justify-between items-center rounded-b-xl">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-blue-300 hover:text-blue-200 hover:bg-blue-800/40"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Reset All
          <kbd className="sr-only md:not-sr-only text-[10px] text-blue-400/70 bg-blue-900/40 px-1.5 py-0.5 rounded border border-blue-800/30 ml-1.5 hidden md:inline-block">
            Alt+C
          </kbd>
        </Button>
        <Button
          type="button"
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
} 