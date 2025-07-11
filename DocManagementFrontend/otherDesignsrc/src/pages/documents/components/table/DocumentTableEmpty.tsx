import { TableCell, TableRow } from "@/components/ui/table";
import { FileText, Search } from "lucide-react";

interface DocumentTableEmptyProps {
  isFiltered: boolean;
}

export function DocumentTableEmpty({ isFiltered }: DocumentTableEmptyProps) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={8} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
          {isFiltered ? (
            <>
              <Search className="h-8 w-8 text-muted-foreground/60" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No documents found</p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search filters to find what you're looking
                  for.
                </p>
              </div>
            </>
          ) : (
            <>
              <FileText className="h-8 w-8 text-muted-foreground/60" />
              <div className="space-y-1">
                <p className="text-sm font-medium">No documents available</p>
                <p className="text-xs text-muted-foreground">
                  Create your first document to get started.
                </p>
              </div>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
