
import { Card, CardContent } from "@/components/ui/card";
import { User } from "@/models/auth";

interface WelcomeCardProps {
  user: User | null;
}

export function WelcomeCard({ user }: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-br from-[#122259]/80 to-[#0c1945]/80 backdrop-blur-md border-blue-900/30 overflow-hidden col-span-1 lg:col-span-1">
      <CardContent className="p-6 relative">
        <div className="space-y-2">
          <p className="text-blue-300">Welcome back,</p>
          <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
          <p className="text-sm text-blue-300/80">
            Glad to see you again! Monitor your document workflow and team activity here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
