import { ReactNode } from 'react';
import { FileX, FileQuestion, Database, List, BarChart, AlertCircle, Layers, GitBranch } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'file' | 'database' | 'list' | 'chart' | 'warning' | 'layers' | 'diagram' | 'custom';
  customIcon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ 
  title, 
  description, 
  icon = 'file', 
  customIcon,
  action 
}: EmptyStateProps) {
  
  const renderIcon = () => {
    if (customIcon) return customIcon;
    
    switch (icon) {
      case 'file':
        return <FileQuestion className="h-12 w-12 text-muted-foreground/50" />;
      case 'database':
        return <Database className="h-12 w-12 text-muted-foreground/50" />;
      case 'list':
        return <List className="h-12 w-12 text-muted-foreground/50" />;
      case 'chart':
        return <BarChart className="h-12 w-12 text-muted-foreground/50" />;
      case 'warning':
        return <AlertCircle className="h-12 w-12 text-amber-500" />;
      case 'layers':
        return <Layers className="h-12 w-12 text-muted-foreground/50" />;
      case 'diagram':
        return <GitBranch className="h-12 w-12 text-muted-foreground/50" />;
      default:
        return <FileX className="h-12 w-12 text-muted-foreground/50" />;
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
} 