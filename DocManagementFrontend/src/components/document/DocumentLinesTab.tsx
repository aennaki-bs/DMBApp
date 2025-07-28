import { FileText, Layers, Plus, Search, Archive, Filter, X } from 'lucide-react';
import { Document, Ligne } from '@/models/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LignesList from '@/components/document/LignesList';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDocumentEditingStatus } from "@/hooks/useDocumentEditingStatus";

interface DocumentLinesTabProps {
  document: Document;
  lignes: Ligne[];
  canManageDocuments: boolean;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
}

const DocumentLinesTab = ({
  document,
  lignes,
  canManageDocuments,
  isCreateDialogOpen,
  setIsCreateDialogOpen
}: DocumentLinesTabProps) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Check if line editing should be disabled due to pending approval
  const { isLineEditingDisabled, disabledReason } = useDocumentEditingStatus(document.id);

  // Check if document is archived to ERP (read-only)
  const isArchivedToERP = !!(document.erpDocumentCode && document.erpDocumentCode.length > 0);

  // Search fields configuration
  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "ligneKey", label: "Line Key" },
    { id: "title", label: "Title" },
    { id: "article", label: "Article" },
  ];

  // Filtered lines
  const filteredLignes = useMemo(() => {
    if (!searchQuery.trim()) return lignes;
    const q = searchQuery.toLowerCase();

    if (searchField === "all") {
      return lignes.filter(ligne =>
        (ligne.ligneKey && ligne.ligneKey.toLowerCase().includes(q)) ||
        (ligne.title && ligne.title.toLowerCase().includes(q)) ||
        (ligne.article && ligne.article.toLowerCase().includes(q))
      );
    } else {
      return lignes.filter(ligne => {
        const value = ligne[searchField as keyof Ligne];
        return value && String(value).toLowerCase().includes(q);
      });
    }
  }, [lignes, searchQuery, searchField]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || searchField !== "all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full flex flex-col space-y-2"
    >
      {/* Page Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background/30 backdrop-blur-xl border border-primary/20 shadow-lg rounded-xl p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/15 backdrop-blur-sm border border-primary/30">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            {/* <div>
              <h2 className="text-2xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Document Lines</h2>
              <p className="text-muted-foreground mt-1">Manage and organize your document lines efficiently</p>
            </div> */}
          </div>
          <div className="flex items-center gap-2">
            {canManageDocuments && !isArchivedToERP && (
              <>
                {isLineEditingDisabled ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          className="bg-primary/40 opacity-60 cursor-not-allowed text-primary-foreground shadow-lg border border-primary/30"
                          disabled
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add New Line
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Line editing is disabled when document has sub-lines</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg border border-primary/30"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add New Line
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex-shrink-0 bg-gradient-to-r from-background/80 via-background/60 to-background/80 backdrop-blur-xl border border-border/50 shadow-lg rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search lines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/60 border-border/70 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            
            {/* Field Selector */}
            <Select value={searchField} onValueChange={setSearchField}>
              <SelectTrigger className="w-[180px] bg-background/60 border-border/70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {searchFields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background/60 border-border/70 hover:bg-primary/10"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                      {hasActiveFilters ? '1' : '0'}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Advanced Filters</h4>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" /> Clear All
                      </Button>
                    )}
                  </div>

                  {/* Filter Badges */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2">
                      {searchQuery && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                          Search: "{searchQuery}"
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchQuery("")}
                            className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                      {searchField !== "all" && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                          Field: {searchFields.find(f => f.id === searchField)?.label}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSearchField("all")}
                            className="ml-1 h-4 w-4 p-0 hover:bg-primary/20"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Lines Table/List - Expandable */}
      <div className="flex-1 bg-background/50 backdrop-blur-sm border-border/50 rounded-xl border shadow-lg overflow-hidden min-h-0">
        <LignesList
          document={document}
          lignes={filteredLignes}
          canManageDocuments={canManageDocuments && !isArchivedToERP && !isLineEditingDisabled}
          isCreateDialogOpen={isCreateDialogOpen}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
        />
      </div>
    </motion.div>
  );
};

export default DocumentLinesTab;
