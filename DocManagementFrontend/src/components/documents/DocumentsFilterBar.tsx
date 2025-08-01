import { useState, useEffect, useMemo } from "react";
import { useDocumentsFilter } from "@/hooks/documents/useDocumentsFilter";
import { Button } from "@/components/ui/button";
import {
  Filter,
  X,
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
  DEFAULT_STATUS_FILTERS,
  DEFAULT_TYPE_FILTERS,
  DEFAULT_DOCUMENT_SEARCH_FIELDS,
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
    label: "common.today",
    value: "today",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "common.yesterday",
    value: "yesterday",
    icon: <Clock className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "common.thisWeek",
    value: "thisWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "common.lastWeek",
    value: "lastWeek",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "common.thisMonth",
    value: "thisMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "common.lastMonth",
    value: "lastMonth",
    icon: <CalendarRange className="h-3.5 w-3.5 mr-1.5" />,
  },
  {
    label: "common.customRange",
    value: "custom",
    icon: <Calendar className="h-3.5 w-3.5 mr-1.5" />,
  },
];

interface DocumentsFilterBarProps {
  onClose?: () => void;
}

export default function DocumentsFilterBar({ onClose }: DocumentsFilterBarProps) {
  const { t } = useTranslation();
  const {
    dateRange,
    setDateRange,
    activeFilters,
    applyFilters,
    resetFilters,
    isFilterActive,
    activeFilterCount,
  } = useDocumentsFilter();

  const [activeTab, setActiveTab] = useState("filters");
  const [selectedDatePreset, setSelectedDatePreset] =
    useState<string>("custom");

  // Advanced filters state
  const [statusFilter, setStatusFilter] = useState(
    activeFilters.statusFilter || "any"
  );
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
    { id: "docDate", label: t("documents.documentDate") },
    { id: "comptableDate", label: t("documents.postingDate") },
    { id: "createdAt", label: t("documents.createdDate") },
    { id: "updatedAt", label: t("documents.updatedDate") }
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
    setStatusFilter(activeFilters.statusFilter || "any");
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

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    applyFilters({
      ...activeFilters,
      statusFilter: value,
    });
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    applyFilters({
      ...activeFilters,
      typeFilter: value,
    });
  };

  const handleTypeFilterFieldChange = (value: string) => {
    setTypeFilterField(value);
    setTypeFilter("any"); // Reset type filter when changing field
    applyFilters({
      ...activeFilters,
      typeFilterField: value,
      typeFilter: "any",
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
    setDateRange(range);
    applyFilters({
      ...activeFilters,
      dateRange: range,
    });
  };

  const applyAdvancedFilters = () => {
    applyFilters({
      ...activeFilters,
      statusFilter,
      typeFilter,
      typeFilterField,
      dateRange: advancedDateRange,
    });
  };

  const clearAllFilters = () => {
    resetFilters();
    setStatusFilter("any");
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

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const applyDatePreset = (preset: string) => {
    setSelectedDatePreset(preset);
    let range: DateRange | undefined;

    const today = new Date();
    switch (preset) {
      case "today":
        range = { from: today, to: today };
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        range = { from: yesterday, to: yesterday };
        break;
      case "thisWeek":
        range = {
          from: startOfWeek(today, { weekStartsOn: 1 }),
          to: endOfWeek(today, { weekStartsOn: 1 }),
        };
        break;
      case "lastWeek":
        const lastWeek = subDays(today, 7);
        range = {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
        };
        break;
      case "thisMonth":
        range = {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
        break;
      case "lastMonth":
        const lastMonth = subDays(startOfMonth(today), 1);
        range = {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
        break;
      case "custom":
        range = undefined;
        break;
    }

    if (range) {
      setAdvancedDateRange(range);
      handleDateRangeChange(range);
    }
  };

  const getDatePresetFromRange = (range: DateRange): string | null => {
    if (!range.from || !range.to) return null;

    const today = new Date();
    const from = range.from;
    const to = range.to;

    // Check if it's today
    if (isToday(from) && isToday(to)) {
      return "today";
    }

    // Check if it's yesterday
    if (isYesterday(from) && isYesterday(to)) {
      return "yesterday";
    }

    // Check if it's this week
    const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(today, { weekStartsOn: 1 });
    if (
      from.getTime() === thisWeekStart.getTime() &&
      to.getTime() === thisWeekEnd.getTime()
    ) {
      return "thisWeek";
    }

    // Check if it's last week
    const lastWeek = subDays(today, 7);
    const lastWeekStart = startOfWeek(lastWeek, { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(lastWeek, { weekStartsOn: 1 });
    if (
      from.getTime() === lastWeekStart.getTime() &&
      to.getTime() === lastWeekEnd.getTime()
    ) {
      return "lastWeek";
    }

    // Check if it's this month
    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    if (
      from.getTime() === thisMonthStart.getTime() &&
      to.getTime() === thisMonthEnd.getTime()
    ) {
      return "thisMonth";
    }

    // Check if it's last month
    const lastMonth = subDays(startOfMonth(today), 1);
    const lastMonthStart = startOfMonth(lastMonth);
    const lastMonthEnd = endOfMonth(lastMonth);
    if (
      from.getTime() === lastMonthStart.getTime() &&
      to.getTime() === lastMonthEnd.getTime()
    ) {
      return "lastMonth";
    }

    return null;
  };

  const formatDateRangeDisplay = (range: DateRange | undefined): string => {
    if (!range || !range.from) return "Any date";

    const from = range.from;
    const to = range.to || range.from;

    // If same day
    if (from.getTime() === to.getTime()) {
      if (isToday(from)) return "Today";
      if (isYesterday(from)) return "Yesterday";
      return format(from, "MMM d, yyyy");
    }

    return `${format(from, "MMM d")} - ${format(to, "MMM d, yyyy")}`;
  };

  // Return just the filter content
  return (
    <div className="w-full sm:w-full bg-background/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="p-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-xl"
      >
        <h3 className="text-lg font-medium text-foreground flex items-center">
          <Filter className="h-5 w-5 mr-2 text-primary" />
          {t("documents.filterDocuments")}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("documents.filterDescription")}
        </p>
      </motion.div>

      <Tabs
        defaultValue="filters"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full bg-primary/5 backdrop-blur-sm border-b border-primary/20 rounded-none">
          <TabsTrigger
            value="filters"
            className="flex-1 data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Tag className="h-4 w-4 mr-2" /> {t("common.filters")}
          </TabsTrigger>
          <TabsTrigger
            value="date"
            className="flex-1 data-[state=active]:bg-primary/15 data-[state=active]:text-primary text-muted-foreground hover:text-foreground transition-colors"
          >
            <CalendarRange className="h-4 w-4 mr-2" /> {t("common.dateRange")}
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-full overflow-auto">
          <TabsContent value="filters" className="p-4 space-y-4 mt-0">

            {/* Document Type filter */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2 flex items-center">
                <Tag className="h-4 w-4 mr-2 text-primary" />
                {t("documents.documentType")}
              </label>

              <Select value={typeFilter} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-full bg-background/60 backdrop-blur-sm text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:bg-background/80 shadow-sm">
                  <SelectValue placeholder={t("documents.selectDocumentType")} />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20">
                  {typeFilterOptions.map((option) => (
                    <SelectItem
                      key={option.id}
                      value={option.value}
                      className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
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
              <label className="text-sm font-medium text-foreground block mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                {t("documents.quickDateRanges")}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {DATE_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "bg-background/60 backdrop-blur-sm text-foreground border border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/40 h-9 justify-start transition-all duration-200",
                      selectedDatePreset === preset.value &&
                      "bg-primary/15 border-primary/40 text-primary"
                    )}
                    onClick={() => applyDatePreset(preset.value)}
                  >
                    {preset.icon}
                    {t(preset.label as any)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2 flex items-center">
                <CalendarRange className="h-4 w-4 mr-2 text-primary" />
                {t("documents.dateFilter")}
              </label>

              {/* Date field selector */}
              <div className="mb-2">
                <Select
                  value={dateFilterField}
                  onValueChange={handleDateFieldChange}
                >
                  <SelectTrigger className="w-full bg-background/60 backdrop-blur-sm text-foreground border border-primary/20 hover:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 hover:bg-background/80 shadow-sm">
                    <SelectValue>
                      {dateFieldOptions.find(opt => opt.id === dateFilterField)?.label || "Document Date"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl text-foreground border border-primary/20">
                    {dateFieldOptions.map((option) => (
                      <SelectItem
                        key={option.id}
                        value={option.id}
                        className="hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
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

      <div className="p-3 border-t border-primary/20 bg-primary/5 backdrop-blur-sm flex justify-between items-center rounded-b-xl">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          {t("common.resetAll")}
          <kbd className="sr-only md:not-sr-only text-[10px] text-muted-foreground/70 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 ml-1.5 hidden md:inline-block">
            Alt+C
          </kbd>
        </Button>
        <Button
          type="button"
          onClick={onClose}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          {t("common.applyFilters")}
        </Button>
      </div>
    </div>
  );
}
