import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title?: string;
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
  noPadding?: boolean;
  headerAction?: ReactNode;
}

export function DashboardCard({
  title,
  className,
  children,
  footer,
  noPadding = false,
  headerAction,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        "bg-[#0f1642] border-blue-900/30 shadow-md overflow-hidden",
        className
      )}
    >
      {title && (
        <CardHeader className="bg-[#0a1033]/50 border-b border-blue-900/30 px-4 py-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-white">
              {title}
            </CardTitle>
            {headerAction}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn("text-blue-100", noPadding ? "p-0" : "p-4")}>
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="bg-[#0a1033]/30 border-t border-blue-900/30 px-4 py-3">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
