import { DashboardCard } from "@/components/ui/dashboard-card";
import { User } from "@/models/auth";
import { CalendarClock } from "lucide-react";
import { format } from "date-fns";

interface WelcomeCardProps {
  user: User | null;
}

export function WelcomeCard({ user }: WelcomeCardProps) {
  return (
    <DashboardCard className="col-span-1 lg:col-span-1 bg-gradient-to-br from-[#122259] to-[#0c1945] border-blue-900/30">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-blue-300">Welcome back,</p>
          <h2 className="text-2xl font-bold text-white">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-sm text-blue-300/80">
            Glad to see you again! Monitor your document workflow and team
            activity here.
          </p>
        </div>

        <div className="flex items-center text-sm text-blue-300/80 mt-4 pt-4 border-t border-blue-900/30">
          <CalendarClock className="h-4 w-4 mr-2" />
          <span>Today is {format(new Date(), "EEEE, MMMM d, yyyy")}</span>
        </div>
      </div>
    </DashboardCard>
  );
}
