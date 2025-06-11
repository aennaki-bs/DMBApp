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
import { Clock, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { Link } from "react-router-dom";
import { EnhancedButton } from "@/components/ui/enhanced-button";
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
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-blue-400/80">
          <span>{t("dashboard.home")}</span>
          <span>/</span>
          <span className="text-blue-100">{t("dashboard.title")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300">
            {t("dashboard.lastUpdated")}: {format(new Date(), "MMM d, yyyy HH:mm")}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats stats={dashboardStats} />

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <WelcomeCard user={user} />
        <CompletionRateCard completionRate={dashboardStats?.completionRate} />
        <ActivityScoreCard user={user} />
      </div>

      {/* Charts Section */}
      <DashboardCard className="p-0">
        <Tabs defaultValue="activity" className="w-full">
          <div className="flex items-center justify-between p-4 border-b border-blue-900/30">
            <TabsList className="bg-blue-900/20">
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-blue-600"
              >
                {t("dashboard.activityOverview")}
              </TabsTrigger>
              <TabsTrigger
                value="weekly"
                className="data-[state=active]:bg-blue-600"
              >
                {t("dashboard.weeklyStats")}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border-blue-900/30 ${
                  timeRange === "day" ? "bg-blue-600" : ""
                }`}
                onClick={() => setTimeRange("day")}
              >
                {t("dashboard.timeRange24h")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-blue-900/30 ${
                  timeRange === "week" ? "bg-blue-600" : ""
                }`}
                onClick={() => setTimeRange("week")}
              >
                {t("dashboard.timeRange7d")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-blue-900/30 ${
                  timeRange === "month" ? "bg-blue-600" : ""
                }`}
                onClick={() => setTimeRange("month")}
              >
                {t("dashboard.timeRange30d")}
              </Button>
            </div>
          </div>

          <TabsContent value="activity" className="m-0 p-4">
            <div className="h-64">
              <DocumentActivityChart data={documentActivity || []} />
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="m-0 p-4">
            <div className="h-64">
              <WeeklyStatsChart data={dashboardStats?.weeklyStats || []} />
            </div>
          </TabsContent>
        </Tabs>
      </DashboardCard>

      {/* Recent Documents */}
      {recentDocuments && recentDocuments.length > 0 && (
        <DashboardCard
          title={t("dashboard.recentDocuments")}
          // headerAction={
          //   <Button variant="outline" size="sm" className="border-blue-900/30">
          //     <Filter className="h-4 w-4 mr-2" />
          //     Filter
          //   </Button>
          // }
        >
          <RecentDocumentsCard documents={recentDocuments} />
        </DashboardCard>
      )}

      {/* UI Showcase Link */}
      {/* <DashboardCard title="UI Components">
        <div className="p-4">
          <p className="text-blue-200 mb-4">
            Explore the enhanced UI components available in DocuVerse with
            interactive previews.
          </p>
          <Link to="/ui-showcase">
            <EnhancedButton
              variant="premium"
              size="lg"
              animation="shimmer"
              rounded="lg"
              className="mt-2"
            >
              View UI Component Showcase
            </EnhancedButton>
          </Link>
        </div>
      </DashboardCard> */}
    </div>
  );
}
