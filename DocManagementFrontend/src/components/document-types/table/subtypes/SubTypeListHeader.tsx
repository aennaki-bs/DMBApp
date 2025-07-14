import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubTypeListHeaderProps {
  documentTypeName: string;
  onCreateClick: () => void;
}

export default function SubTypeListHeader({
  documentTypeName,
  onCreateClick,
}: SubTypeListHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Series Management
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage series for{" "}
            <span className="text-primary font-medium">{documentTypeName}</span>
          </p>
        </div>
      </div>
      <Button
        onClick={onCreateClick}
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Series
      </Button>
    </div>
  );
}
