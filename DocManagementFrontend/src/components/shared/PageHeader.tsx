import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`bg-white border-blue-200 dark:bg-[#0a1033] dark:border-blue-900/30 border rounded-lg p-6 mb-6 transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-blue-900 dark:text-white flex items-center">
            {icon && <span className="mr-3">{icon}</span>}
            {title}
          </h1>
          {description && (
            <p className="text-sm md:text-base text-blue-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  );
}
