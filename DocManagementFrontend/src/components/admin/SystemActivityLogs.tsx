import { useQuery } from "@tanstack/react-query";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { useState, useMemo } from "react";
import adminService from "@/services/adminService";
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
    Activity,
    Download
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

const SystemActivityLogs = () => {
    // State for filtering and searching
    const [searchQuery, setSearchQuery] = useState("");
    const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined);
    const [userFilter, setUserFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<string>("timestamp");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [filterOpen, setFilterOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Fetch logs data
    const {
        data: logs,
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: ["system-logs"],
        queryFn: () => adminService.getAllSystemLogs(),
    });

    // Action type mapping
    const actionTypes = {
        0: "Logout",
        1: "Login",
        2: "Profile Create",
        3: "Profile Update",
        4: "Document Create",
        5: "Document Update",
        6: "Document Delete",
        7: "Profile Create",
        8: "Profile Update",
        9: "Profile Delete",
        10: "Line Create",
        11: "Line Update",
        12: "Line Delete",
        13: "SubLine Create",
        14: "SubLine Update",
        15: "SubLine Delete",
    };

    const getActionTypeLabel = (actionType: number): string => {
        return (
            actionTypes[actionType as keyof typeof actionTypes] ||
            `Action ${actionType}`
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

    // Get unique users from logs for filter dropdown
    const uniqueUsers = useMemo(() => {
        if (!logs) return [];
        const users = new Set(logs.map(log => log.user.username));
        return Array.from(users);
    }, [logs]);

    // Get unique action types from logs for filter dropdown
    const uniqueActionTypes = useMemo(() => {
        if (!logs) return [];
        const types = new Set(logs.map(log => log.actionType));
        return Array.from(types);
    }, [logs]);

    // Filter and sort logs
    const filteredLogs = useMemo(() => {
        if (!logs) return [];

        return logs
            .filter(log => {
                // Filter by action type
                if (actionTypeFilter !== "all" && log.actionType !== parseInt(actionTypeFilter)) {
                    return false;
                }

                // Filter by user
                if (userFilter !== "all" && log.user.username !== userFilter) {
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
    }, [logs, searchQuery, actionTypeFilter, userFilter, dateFilter, specificDate, sortField, sortDirection]);

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
        setUserFilter("all");
        setDateFilter("all");
        setSpecificDate(undefined);
        setFilterOpen(false);
    };

    // Export logs as CSV
    const exportLogsAsCSV = () => {
        if (!filteredLogs.length) return;

        // Create CSV content
        const headers = ["Action", "Timestamp", "Description", "User", "Role"];
        const csvContent = [
            headers.join(","),
            ...filteredLogs.map(log => [
                `"${getActionTypeLabel(log.actionType)}"`,
                `"${format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}"`,
                `"${log.description?.replace(/"/g, '""') || ""}"`,
                `"${log.user.username}"`,
                `"${log.user.role || ""}"`
            ].join(","))
        ].join("\n");

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `system_logs_${format(new Date(), "yyyy-MM-dd")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                <h2 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" />
                    System Activity Logs
                </h2>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    className="border-slate-600/70 bg-slate-800/90 text-slate-200 hover:bg-slate-700/90"
                >
                    Refresh Logs
                </Button>
            </div>

            <div className="p-4 border border-slate-700/50 rounded-lg bg-slate-900/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search in logs..."
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
                                    (actionTypeFilter !== "all" || dateFilter !== "all" || userFilter !== "all") &&
                                    "border-blue-500/50 bg-blue-950/30 text-blue-200"
                                )}
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filters
                                {(actionTypeFilter !== "all" || dateFilter !== "all" || userFilter !== "all") && (
                                    <Badge className="ml-2 bg-blue-600 text-white">
                                        {[
                                            actionTypeFilter !== "all",
                                            dateFilter !== "all",
                                            userFilter !== "all"
                                        ].filter(Boolean).length}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-4 bg-slate-900 border border-slate-700/50 shadow-xl">
                            <div className="space-y-4">
                                <h3 className="font-medium text-slate-200">Filter Logs</h3>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Action Type</label>
                                    <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                                            <SelectValue placeholder="Select action type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Actions</SelectItem>
                                            {uniqueActionTypes.map((type) => (
                                                <SelectItem key={type} value={type.toString()}>
                                                    {getActionTypeLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">User</label>
                                    <Select value={userFilter} onValueChange={setUserFilter}>
                                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-200">
                                            <SelectValue placeholder="Select user" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Users</SelectItem>
                                            {uniqueUsers.map((username) => (
                                                <SelectItem key={username} value={username}>
                                                    {username}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-slate-400">Date Range</label>
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
                                            <SelectValue placeholder="Select date range" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Time</SelectItem>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="yesterday">Yesterday</SelectItem>
                                            <SelectItem value="thisWeek">This Week</SelectItem>
                                            <SelectItem value="thisMonth">This Month</SelectItem>
                                            <SelectItem value="specific">Specific Date</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Date picker for specific date */}
                                {dateFilter === "specific" && (
                                    <div className="space-y-2">
                                        <label className="text-sm text-slate-400">Select Date</label>
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
                                                    {specificDate ? format(specificDate, "PPP") : "Pick a date"}
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
                                        Clear Filters
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setFilterOpen(false)}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Apply Filters
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Export button */}
                    <Button
                        variant="outline"
                        onClick={exportLogsAsCSV}
                        disabled={!filteredLogs.length}
                        className="border-slate-600/70 bg-slate-800/90 text-slate-200 hover:bg-slate-700/90"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>

                {/* Active filters display */}
                {(actionTypeFilter !== "all" || dateFilter !== "all" || userFilter !== "all" || searchQuery) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {actionTypeFilter !== "all" && (
                            <Badge className="bg-blue-900/40 text-blue-200 border border-blue-500/30 px-2 py-1 flex items-center gap-1">
                                Action: {getActionTypeLabel(parseInt(actionTypeFilter))}
                                <X
                                    className="h-3 w-3 ml-1 cursor-pointer"
                                    onClick={() => setActionTypeFilter("all")}
                                />
                            </Badge>
                        )}
                        {userFilter !== "all" && (
                            <Badge className="bg-blue-900/40 text-blue-200 border border-blue-500/30 px-2 py-1 flex items-center gap-1">
                                User: {userFilter}
                                <X
                                    className="h-3 w-3 ml-1 cursor-pointer"
                                    onClick={() => setUserFilter("all")}
                                />
                            </Badge>
                        )}
                        {dateFilter !== "all" && (
                            <Badge className="bg-blue-900/40 text-blue-200 border border-blue-500/30 px-2 py-1 flex items-center gap-1">
                                Date: {dateFilter === "today" ? "Today" :
                                    dateFilter === "yesterday" ? "Yesterday" :
                                        dateFilter === "thisWeek" ? "This Week" :
                                            dateFilter === "thisMonth" ? "This Month" :
                                                dateFilter === "specific" && specificDate ? format(specificDate, "MMM d, yyyy") :
                                                    "All Time"}
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
                                Search: "{searchQuery}"
                                <X
                                    className="h-3 w-3 ml-1 cursor-pointer"
                                    onClick={() => setSearchQuery("")}
                                />
                            </Badge>
                        )}
                        {(actionTypeFilter !== "all" || dateFilter !== "all" || userFilter !== "all" || searchQuery) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-slate-400 hover:text-slate-200 h-6 px-2 py-0"
                            >
                                Clear All
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
                    <div className="text-red-400 py-10 flex items-center justify-center bg-red-900/10 rounded-lg border border-red-900/30">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Error loading activity logs. Please try again.
                    </div>
                ) : filteredLogs.length > 0 ? (
                    <div className="relative">
                        {/* Table with fixed header */}
                        <div className="overflow-hidden rounded-lg border border-slate-700/50">
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
                                                    Action
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
                                                    Timestamp
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
                                                    Description
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
                                                    User
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
                            <ScrollArea className="h-[60vh]">
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
                        <div className="py-2 text-sm text-slate-400">
                            Showing {filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"}
                            {(actionTypeFilter !== "all" || dateFilter !== "all" || userFilter !== "all" || searchQuery) && " (filtered)"}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-700/50">
                        No activity logs found {(actionTypeFilter !== "all" || dateFilter !== "all" || userFilter !== "all" || searchQuery) && " matching your filters"}
                    </div>
                )}
            </div>
        </div>
    );
};

export { SystemActivityLogs }; 