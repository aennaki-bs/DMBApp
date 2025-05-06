import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import dashboardService from "@/services/dashboardService";
import { CircuitNavigation } from "@/components/navigation/CircuitNavigation";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { CompletionRateCard } from "@/components/dashboard/CompletionRateCard";
import { ActivityScoreCard } from "@/components/dashboard/ActivityScoreCard";
import { DocumentActivityChart } from "@/components/dashboard/DocumentActivityChart";
import { WeeklyStatsChart } from "@/components/dashboard/WeeklyStatsChart";
import { RecentDocumentsCard } from "@/components/dashboard/RecentDocumentsCard";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Filter } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

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
        case 'day':
          start.setDate(start.getDate() - 1);
          break;
        case 'month':
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
          <span>Home</span>
          <span>/</span>
          <span className="text-blue-100">Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300">
            Last updated: {format(new Date(), 'MMM d, yyyy HH:mm')}
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
      <Card className="p-6 bg-[#0f1642] border-blue-900/30">
        <Tabs defaultValue="activity" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-blue-900/20">
              <TabsTrigger value="activity" className="data-[state=active]:bg-blue-600">
                Activity Overview
              </TabsTrigger>
              <TabsTrigger value="weekly" className="data-[state=active]:bg-blue-600">
                Weekly Stats
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border-blue-900/30 ${timeRange === 'day' ? 'bg-blue-600' : ''}`}
                onClick={() => setTimeRange('day')}
              >
                24h
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-blue-900/30 ${timeRange === 'week' ? 'bg-blue-600' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                7d
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`border-blue-900/30 ${timeRange === 'month' ? 'bg-blue-600' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                30d
              </Button>
            </div>
          </div>
          
          <TabsContent value="activity" className="m-0">
            <DocumentActivityChart data={documentActivity || []} />
          </TabsContent>
          
          <TabsContent value="weekly" className="m-0">
            <WeeklyStatsChart data={dashboardStats?.weeklyStats || []} />
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Recent Documents */}
      {recentDocuments && recentDocuments.length > 0 && (
        <Card className="bg-[#0f1642] border-blue-900/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Recent Documents</h3>
            <Button variant="outline" size="sm" className="border-blue-900/30">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <RecentDocumentsCard documents={recentDocuments} />
        </Card>
      )}
    </div>
  );
}
