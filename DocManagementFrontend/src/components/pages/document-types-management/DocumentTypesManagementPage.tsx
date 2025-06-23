import { useState } from "react";
import { RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DocumentTypesManagementContent from "./DocumentTypesManagementContent";

export default function DocumentTypesManagementPage() {
  const [refetchFunction, setRefetchFunction] = useState<(() => void) | null>(
    null
  );

  const handleHeaderRefresh = () => {
    if (refetchFunction) {
      refetchFunction();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Document Types
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage document types and their configurations
              </p>
            </div>
          </div>

          {refetchFunction && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHeaderRefresh}
                  className="h-9 px-3 text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh document types</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-h-0">
        <DocumentTypesManagementContent onRefetchReady={setRefetchFunction} />
      </div>
    </div>
  );
}
