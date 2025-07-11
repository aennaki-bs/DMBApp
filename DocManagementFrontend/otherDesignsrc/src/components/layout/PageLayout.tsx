import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}

interface PageLayoutProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  actions?: PageAction[];
  children: React.ReactNode;
}

export function PageLayout({
  title,
  subtitle,
  icon: Icon,
  actions = [],
  children,
}: PageLayoutProps) {
  return (
    <div
      className="h-full flex flex-col gap-4 max-w-full relative"
      style={{ minHeight: "100%" }}
    >
      {/* Compact Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 rounded-lg bg-gradient-to-r from-primary/8 via-primary/4 to-background/20 backdrop-blur-lg border border-primary/15 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/12 backdrop-blur-sm border border-primary/20 flex-shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-foreground leading-tight">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground leading-tight">
              {subtitle}
            </p>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || "default"}
                onClick={action.onClick}
                className={
                  action.variant === "outline"
                    ? "h-8 px-3 text-xs bg-background/40 backdrop-blur-sm border-border/40 hover:bg-primary/8 hover:border-primary/25 transition-all duration-200"
                    : action.variant === "default"
                    ? "h-8 px-3 text-xs bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary/75 text-primary-foreground shadow-md hover:shadow-lg border border-primary/25 hover:border-primary/40 transition-all duration-200"
                    : "h-8 px-3 text-xs"
                }
              >
                {action.icon && <action.icon className="h-3.5 w-3.5 mr-1.5" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Section */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
