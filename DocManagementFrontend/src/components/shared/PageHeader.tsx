import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  description, 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col md:flex-row md:items-center justify-between gap-4",
      className
    )}>
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-blue-200 to-purple-200 text-transparent bg-clip-text">
          {title}
        </h1>
        {description && (
          <p className="text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
} 