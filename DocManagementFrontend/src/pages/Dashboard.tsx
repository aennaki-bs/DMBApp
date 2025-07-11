import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import dashboardService from "@/services/dashboardService";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { CompletionRateCard } from "@/components/dashboard/CompletionRateCard";
import { ActivityScoreCard } from "@/components/dashboard/ActivityScoreCard";
import { DocumentActivityChart } from "@/components/dashboard/DocumentActivityChart";
import { WeeklyStatsChart } from "@/components/dashboard/WeeklyStatsChart";
import { RecentDocumentsCard } from "@/components/dashboard/RecentDocumentsCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { useTranslation } from "@/hooks/useTranslation";

export default function Dashboard() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");

    const { data: dashboardStats } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => dashboardService.getDashboardStats(),
        enabled: !!user,
    });

    const { data: recentDocuments } = useQuery({
        queryKey: ["recent-documents"],
        queryFn: () => documentService.getRecentDocuments(5),
        enabled: !!user,
    });

    const { data: documentActivity } = useQuery({
        queryKey: ["document-activity", timeRange],
        queryFn: () => {
            const end = new Date();
            const start = new Date();
            switch (timeRange) {
                case "day":
                    start.setDate(start.getDate() - 1);
                    break;
                case "month":
                    start.setMonth(start.getMonth() - 1);
                    break;
                default: // week
                    start.setDate(start.getDate() - 7);
            }
            return dashboardService.getDocumentActivity(start, end);
        },
        enabled: !!user,
    });

    return (
        <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
            <div className="p-6 space-y-6 min-h-full">
                {/* Professional breadcrumb navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-foreground font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Last updated:{" "}
                            <span className="text-foreground font-medium">
                                {format(new Date(), "MMM d, yyyy HH:mm")}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Professional stats cards */}
                <DashboardStats stats={dashboardStats} />

                {/* Main content grid with enhanced styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <WelcomeCard user={user} />
                    <CompletionRateCard completionRate={dashboardStats?.completionRate} />
                    <ActivityScoreCard user={user} />
                </div>

                {/* Professional charts section */}
                <DashboardCard className="p-0 overflow-hidden">
                    <Tabs defaultValue="activity" className="w-full">
                        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
                            <TabsList className="bg-muted">
                                <TabsTrigger
                                    value="activity"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                                >
                                    Activity Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="weekly"
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                                >
                                    Weekly Stats
                                </TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant={timeRange === "day" ? "default" : "outline"}
                                    size="sm"
                                    className={`border-border transition-all duration-200 ${timeRange === "day" ? "shadow-sm" : "hover:bg-accent"
                                        }`}
                                    onClick={() => setTimeRange("day")}
                                >
                                    24h
                                </Button>
                                <Button
                                    variant={timeRange === "week" ? "default" : "outline"}
                                    size="sm"
                                    className={`border-border transition-all duration-200 ${timeRange === "week" ? "shadow-sm" : "hover:bg-accent"
                                        }`}
                                    onClick={() => setTimeRange("week")}
                                >
                                    7d
                                </Button>
                                <Button
                                    variant={timeRange === "month" ? "default" : "outline"}
                                    size="sm"
                                    className={`border-border transition-all duration-200 ${timeRange === "month" ? "shadow-sm" : "hover:bg-accent"
                                        }`}
                                    onClick={() => setTimeRange("month")}
                                >
                                    30d
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="activity" className="m-0 p-6">
                            <div className="h-64 rounded-lg bg-muted/20 p-4">
                                <DocumentActivityChart data={documentActivity || []} />
                            </div>
                        </TabsContent>

                        <TabsContent value="weekly" className="m-0 p-6">
                            <div className="h-64 rounded-lg bg-muted/20 p-4">
                                <WeeklyStatsChart data={dashboardStats?.weeklyStats || []} />
                            </div>
                        </TabsContent>
                    </Tabs>
                </DashboardCard>

                {/* Professional recent documents section */}
                {recentDocuments && recentDocuments.length > 0 && (
                    <DashboardCard
                        title="Recent Documents"
                        className="transition-all duration-300 hover:shadow-lg"
                    >
                        <RecentDocumentsCard documents={recentDocuments} />
                    </DashboardCard>
                )}
            </div>
        </div>
    );
} 