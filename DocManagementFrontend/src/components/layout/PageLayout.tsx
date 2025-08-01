import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PageAction {
  label: string;
  onClick: () => void;
  variant?:
  | "default"
  | "outline"
  | "secondary"
  | "destructive"
  | "ghost"
  | "link";
  icon?: LucideIcon;
  disabled?: boolean;
  tooltip?: string;
}

interface PageLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: PageAction[];
  children: React.ReactNode;
  status?: string;
  statusColor?: string;
}

export function PageLayout({
  title,
  subtitle,
  icon: Icon,
  actions = [],
  children,
  status,
  statusColor = "text-green-500",
}: PageLayoutProps) {
  return (
    <div
      className="h-full flex flex-col gap-2 max-w-full"
      style={{ minHeight: "100%" }}
    >
      {/* Clean Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background/30 backdrop-blur-xl border border-primary/20 shadow-lg">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text flex items-center gap-2">
              <span>{title}</span>
              {status && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className={`${statusColor} font-semibold`}>{status}</span>
                </>
              )}
            </h1>
            {/* <p className="text-muted-foreground mt-1">{subtitle}</p> */}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-3">
            <TooltipProvider>
              {actions.map((action, index) => {
                const buttonElement = (
                  <Button
                    key={index}
                    variant={action.variant || "default"}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={
                      action.disabled
                        ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-muted hover:bg-muted hover:text-muted-foreground hover:border-muted"
                        : action.variant === "outline"
                          ? "bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                          : action.variant === "default"
                            ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl border border-primary/30 hover:border-primary/50 transition-all duration-300"
                            : undefined
                    }
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </Button>
                );

                if (action.disabled && action.tooltip) {
                  return (
                    <Tooltip key={index} delayDuration={300}>
                      <TooltipTrigger asChild>
                        {buttonElement}
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">{action.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return buttonElement;
              })}
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Main Content Section */}
      <div className="flex-1 overflow-y-auto min-h-0">{children}</div>
    </div>
  );
}
