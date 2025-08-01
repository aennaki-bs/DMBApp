import { useQuery } from "@tanstack/react-query";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { useState, useMemo } from "react";
import adminService from "@/services/adminService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  FileText,
  User,
  Search,
  Filter,
  X,
  Calendar,
  ArrowUpDown,
  ChevronDown,
  Activity
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useTranslation } from "@/hooks/useTranslation";

interface ViewUserLogsDialogProps {
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewUserLogsDialog({
  userId,
  open,
  onOpenChange,
}: ViewUserLogsDialogProps) {
  const { t, tWithParams } = useTranslation();
  
  // State for filtering and searching
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined);
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Fetch logs data
  const {
    data: logs,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-logs", userId],
    queryFn: () => adminService.getUserLogs(userId),
    enabled: open,
  });

  // Action type mapping
  const actionTypes = {
    0: t("userManagement.logout"),
    1: t("userManagement.login"),
    2: t("userManagement.profileCreate"),
    3: t("userManagement.profileUpdate"),
    4: t("userManagement.documentCreate"),
    5: t("userManagement.documentUpdate"),
    6: t("userManagement.documentDelete"),
    7: t("userManagement.profileCreate"),
    8: t("userManagement.profileUpdate"),
    9: t("userManagement.profileDelete"),
    10: t("userManagement.lineCreate"),
    11: t("userManagement.lineUpdate"),
    12: t("userManagement.lineDelete"),
    13: t("userManagement.subLineCreate"),
    14: t("userManagement.subLineUpdate"),
    15: t("userManagement.subLineDelete"),
  };

  const getActionTypeLabel = (actionType: number): string => {
    return (
      actionTypes[actionType as keyof typeof actionTypes] ||
      `${t("userManagement.logAction")} ${actionType}`
    );
  };

  const getActionColor = (actionType: number): string => {
    switch (actionType) {
      case 0: // Logout
        return "bg-amber-900/20 text-amber-300 border-amber-500/30";
      case 1: // Login
        return "bg-purple-900/20 text-purple-300 border-purple-500/30";
      case 2: // Profile Create
      case 7: // Profile Create (duplicate)
        return "bg-emerald-900/20 text-emerald-300 border-emerald-500/30";
      case 3: // Profile Update
      case 8: // Profile Update (duplicate)
        return "bg-blue-900/20 text-blue-300 border-blue-500/30";
      case 4: // Document Create
        return "bg-emerald-900/20 text-emerald-300 border-emerald-500/30";
      case 5: // Document Update
        return "bg-blue-900/20 text-blue-300 border-blue-500/30";
      case 6: // Document Delete
      case 9: // Profile Delete
        return "bg-red-900/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-900/20 text-gray-300 border-gray-500/30";
    }
  };

  const getActionIcon = (actionType: number) => {
    switch (actionType) {
      case 0: // Logout
      case 1: // Login
        return <User className="w-3.5 h-3.5" />;
      case 2: // Profile Create
      case 3: // Profile Update
      case 7: // Profile Create (duplicate)
      case 8: // Profile Update (duplicate)
      case 9: // Profile Delete
        return <User className="w-3.5 h-3.5" />;
      case 4: // Document Create
      case 5: // Document Update
      case 6: // Document Delete
        return <FileText className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSpecificDate(date);
      setDateFilter("specific");
      setCalendarOpen(false);
    } else {
      setSpecificDate(undefined);
      setDateFilter("all");
    }
  };

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    if (!logs) return [];

    return logs
      .filter(log => {
        // Filter by action type
        if (actionTypeFilter !== "all" && log.actionType !== parseInt(actionTypeFilter)) {
          return false;
        }

        // Filter by date
        if (dateFilter !== "all") {
          const logDate = new Date(log.timestamp);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (dateFilter === "today" &&
            !(logDate.getDate() === today.getDate() &&
              logDate.getMonth() === today.getMonth() &&
              logDate.getFullYear() === today.getFullYear())) {
            return false;
          }

          if (dateFilter === "yesterday" &&
            !(logDate.getDate() === yesterday.getDate() &&
              logDate.getMonth() === yesterday.getMonth() &&
              logDate.getFullYear() === yesterday.getFullYear())) {
            return false;
          }

          if (dateFilter === "thisWeek") {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            if (logDate < startOfWeek) {
              return false;
            }
          }

          if (dateFilter === "thisMonth") {
            if (logDate.getMonth() !== today.getMonth() ||
              logDate.getFullYear() !== today.getFullYear()) {
              return false;
            }
          }

          if (dateFilter === "specific" && specificDate) {
            // Check if log date is within the specific date (full day)
            const logDateTime = parseISO(log.timestamp);
            const dayStart = startOfDay(specificDate);
            const dayEnd = endOfDay(specificDate);

            if (!isWithinInterval(logDateTime, { start: dayStart, end: dayEnd })) {
              return false;
            }
          }
        }

        // Search query filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          return (
            (log.description && log.description.toLowerCase().includes(query)) ||
            (log.user.username && log.user.username.toLowerCase().includes(query)) ||
            (log.user.role && log.user.role.toLowerCase().includes(query)) ||
            getActionTypeLabel(log.actionType).toLowerCase().includes(query)
          );
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by selected field
        if (sortField === "timestamp") {
          return sortDirection === "asc"
            ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }

        if (sortField === "actionType") {
          const actionA = getActionTypeLabel(a.actionType);
          const actionB = getActionTypeLabel(b.actionType);
          return sortDirection === "asc"
            ? actionA.localeCompare(actionB)
            : actionB.localeCompare(actionA);
        }

        if (sortField === "user") {
          return sortDirection === "asc"
            ? a.user.username.localeCompare(b.user.username)
            : b.user.username.localeCompare(a.user.username);
        }

        if (sortField === "description") {
          const descA = a.description || "";
          const descB = b.description || "";
          return sortDirection === "asc"
            ? descA.localeCompare(descB)
            : descB.localeCompare(descA);
        }

        return 0;
      });
  }, [logs, searchQuery, actionTypeFilter, dateFilter, specificDate, sortField, sortDirection]);

  // Handle sort toggle
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setActionTypeFilter("all");
    setDateFilter("all");
    setSpecificDate(undefined);
    setFilterOpen(false);
  };

  // Get unique action types from logs for filter dropdown
  const uniqueActionTypes = useMemo(() => {
    if (!logs) return [];
    const types = new Set(logs.map(log => log.actionType));
    return Array.from(types);
  }, [logs]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-slate-700/50 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
        <DialogHeader className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-blue-950/50 to-slate-900/50 backdrop-blur-sm">
          <DialogTitle className="text-xl text-blue-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            {t("userManagement.userActivityLogs")}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {t("userManagement.comprehensiveHistory")}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder={t("userManagement.searchInLogs")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/90 border-slate-600/70 text-slate-200 placeholder:text-slate-500 focus-visible:ring-blue-600"
              />
            </div>

            {/* Filters popover */}
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "border-slate-600/70 bg-slate-800/90 text-slate-200 hover:bg-slate-700/90",
                    (actionTypeFilter !== "all" || dateFilter !== "all") && "border-blue-500/50 bg-blue-950/30 text-blue-200"
                  )}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t("userManagement.filters")}
                  {(actionTypeFilter !== "all" || dateFilter !== "all") && (
                    <Badge className="ml-2 bg-blue-600 text-white">
                      {(actionTypeFilter !== "all" && dateFilter !== "all") ? 2 : 1}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-slate-900 border border-slate-700/50 shadow-xl">
                <div className="space-y-4">
                  <h3 className="font-medium text-slate-200">{t("userManagement.filterLogs")}</h3>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">{t("userManagement.actionType")}</label>
                    <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder={t("userManagement.actionType")} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">{t("userManagement.allActions")}</SelectItem>
                        {uniqueActionTypes.map((type) => (
                          <SelectItem key={type} value={type.toString()}>
                            {getActionTypeLabel(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">{t("userManagement.dateRange")}</label>
                    <Select
                      value={dateFilter}
                      onValueChange={(value) => {
                        setDateFilter(value);
                        if (value !== "specific") {
                          setSpecificDate(undefined);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                        <SelectValue placeholder={t("userManagement.dateRange")} />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="all">{t("userManagement.allTime")}</SelectItem>
                        <SelectItem value="today">{t("userManagement.today")}</SelectItem>
                        <SelectItem value="yesterday">{t("userManagement.yesterday")}</SelectItem>
                        <SelectItem value="thisWeek">{t("userManagement.thisWeek")}</SelectItem>
                        <SelectItem value="thisMonth">{t("userManagement.thisMonth")}</SelectItem>
                        <SelectItem value="specific">{t("userManagement.specificDate")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                                     {/* Date picker for specific date */}
                   {dateFilter === "specific" && (
                     <div className="space-y-2">
                       <label className="text-sm text-slate-400">{t("userManagement.selectDate")}</label>
                       <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                         <PopoverTrigger asChild>
                           <Button
                             variant="outline"
                             className={cn(
                               "w-full justify-start text-left font-normal bg-slate-800 border-slate-700 text-slate-200",
                               !specificDate && "text-slate-400"
                             )}
                           >
                             <Calendar className="mr-2 h-4 w-4" />
                             {specificDate ? format(specificDate, "PPP") : t("userManagement.pickDate")}
                           </Button>
                         </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                          <CalendarComponent
                            mode="single"
                            selected={specificDate}
                            onSelect={handleDateSelect}
                            initialFocus
                            className="bg-slate-900 text-slate-200"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t("userManagement.clearFilters")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setFilterOpen(false)}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      {t("userManagement.applyFilters")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active filters display */}
          {(actionTypeFilter !== "all" || dateFilter !== "all" || searchQuery) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actionTypeFilter !== "all" && (
                <Badge className="bg-blue-900/40 text-blue-200 border border-blue-500/30 px-2 py-1 flex items-center gap-1">
                  {t("userManagement.logAction")}: {getActionTypeLabel(parseInt(actionTypeFilter))}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setActionTypeFilter("all")}
                  />
                </Badge>
              )}
                             {dateFilter !== "all" && (
                 <Badge className="bg-blue-900/40 text-blue-200 border border-blue-500/30 px-2 py-1 flex items-center gap-1">
                   {t("common.date")}: {dateFilter === "today" ? t("userManagement.today") :
                     dateFilter === "yesterday" ? t("userManagement.yesterday") :
                       dateFilter === "thisWeek" ? t("userManagement.thisWeek") :
                         dateFilter === "thisMonth" ? t("userManagement.thisMonth") :
                           dateFilter === "specific" && specificDate ? format(specificDate, "MMM d, yyyy") :
                             t("userManagement.allTime")}
                   <X
                     className="h-3 w-3 ml-1 cursor-pointer"
                     onClick={() => {
                       setDateFilter("all");
                       setSpecificDate(undefined);
                     }}
                   />
                 </Badge>
               )}
              {searchQuery && (
                <Badge className="bg-blue-900/40 text-blue-200 border border-blue-500/30 px-2 py-1 flex items-center gap-1">
                  {t("common.search")}: "{searchQuery}"
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {(actionTypeFilter !== "all" || dateFilter !== "all" || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-slate-400 hover:text-slate-200 h-6 px-2 py-0"
                >
                  {t("userManagement.clearAll")}
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          {isLoading ? (
            <div className="flex justify-center py-10 text-blue-300">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mr-2"></div>
              <span className="animate-pulse">Loading activity logs...</span>
            </div>
          ) : isError ? (
            <div className="text-red-400 py-10 flex items-center justify-center bg-red-900/10 rounded-lg border border-red-900/30 m-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              {t("userManagement.errorLoadingLogs")}
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="relative">
              {/* Table with fixed header */}
              <div className="overflow-hidden rounded-lg border border-slate-700/50 m-4">
                <div className="overflow-hidden">
                  {/* Fixed Header */}
                  <Table>
                    <TableHeader className="bg-slate-800/90 backdrop-blur-sm sticky top-0 z-10">
                      <TableRow className="border-slate-700/50 hover:bg-transparent">
                        <TableHead
                          className="text-slate-300 font-medium cursor-pointer"
                          onClick={() => toggleSort("actionType")}
                        >
                          <div className="flex items-center">
                            {t("userManagement.logAction")}
                            {sortField === "actionType" && (
                              <ChevronDown
                                className={cn(
                                  "ml-1 h-4 w-4 transition-transform",
                                  sortDirection === "desc" ? "transform rotate-180" : ""
                                )}
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-slate-300 font-medium cursor-pointer"
                          onClick={() => toggleSort("timestamp")}
                        >
                          <div className="flex items-center">
                            {t("userManagement.logTimestamp")}
                            {sortField === "timestamp" && (
                              <ChevronDown
                                className={cn(
                                  "ml-1 h-4 w-4 transition-transform",
                                  sortDirection === "desc" ? "transform rotate-180" : ""
                                )}
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-slate-300 font-medium cursor-pointer"
                          onClick={() => toggleSort("description")}
                        >
                          <div className="flex items-center">
                            {t("userManagement.logDescription")}
                            {sortField === "description" && (
                              <ChevronDown
                                className={cn(
                                  "ml-1 h-4 w-4 transition-transform",
                                  sortDirection === "desc" ? "transform rotate-180" : ""
                                )}
                              />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-slate-300 font-medium cursor-pointer"
                          onClick={() => toggleSort("user")}
                        >
                          <div className="flex items-center">
                            {t("userManagement.user")}
                            {sortField === "user" && (
                              <ChevronDown
                                className={cn(
                                  "ml-1 h-4 w-4 transition-transform",
                                  sortDirection === "desc" ? "transform rotate-180" : ""
                                )}
                              />
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>

                {/* Scrollable Content */}
                <ScrollArea className="h-[50vh]">
                  <Table>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow
                          key={log.id}
                          className="border-slate-700/50 hover:bg-slate-800/50 transition-colors duration-150"
                        >
                          <TableCell>
                            <Badge
                              className={`${getActionColor(
                                log.actionType
                              )} px-2 py-1 flex items-center gap-1 border`}
                            >
                              {getActionIcon(log.actionType)}
                              {getActionTypeLabel(log.actionType)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{format(new Date(log.timestamp), "PPpp")}</span>
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {log.description || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full bg-slate-800/90 flex items-center justify-center text-blue-300 text-xs font-medium border border-blue-500/30">
                                {log.user.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-slate-200">
                                  {log.user.username}
                                </div>
                                {log.user.role && (
                                  <div className="text-xs text-blue-400">
                                    {log.user.role}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Results count */}
              <div className="px-4 pb-4 text-sm text-slate-400">
                {tWithParams("userManagement.showingEntries", { count: filteredLogs.length })}
                {(actionTypeFilter !== "all" || dateFilter !== "all" || searchQuery) && " (filtered)"}
              </div>
            </div>
          ) : (
                         <div className="text-center py-10 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-700/50 m-4">
               {t("userManagement.noLogsFound")} {(actionTypeFilter !== "all" || dateFilter !== "all" || searchQuery) && ` ${t("userManagement.matchingFilters")}`}
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
