import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { DocumentType } from "@/models/document";
import {
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
  Plus,
  Filter,
  Check,
  X,
  Tag,
  FileText,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import documentService from "@/services/documentService";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BulkActionsBar, BulkAction } from "@/components/shared/BulkActionsBar";
import { AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { PageLayout } from "@/components/layout/PageLayout";

const DocumentTypes = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [types, setTypes] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<DocumentType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [typeToEdit, setTypeToEdit] = useState<DocumentType | null>(null);
  const [typeName, setTypeName] = useState("");
  const [typeKey, setTypeKey] = useState("");
  const [typeAttr, setTypeAttr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [attributeFilter, setAttributeFilter] = useState("any");

  // Determine if user is a simple user for conditional rendering
  const isSimpleUser = user?.role === "SimpleUser";

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "f") {
        e.preventDefault();
        setFilterOpen(true);
      }
      if (e.key === "Escape" && filterOpen) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filterOpen]);

  const fetchTypes = async () => {
    try {
      setIsLoading(true);
      const data = await documentService.getAllDocumentTypes();
      setTypes(data);
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast.error("Failed to load document types");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (type: DocumentType) => {
    setTypeToDelete(type);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!typeToDelete?.id) return;

    try {
      await documentService.deleteDocumentType(typeToDelete.id);
      toast.success("Document type deleted successfully");
      setDeleteDialogOpen(false);
      setTypeToDelete(null);
      fetchTypes();
    } catch (error) {
      console.error("Error deleting document type:", error);
      toast.error("Failed to delete document type");
    }
  };

  const openEditDialog = (type: DocumentType) => {
    setTypeToEdit(type);
    setTypeName(type.typeName || "");
    setTypeKey(type.typeKey || "");
    setTypeAttr(type.typeAttr || "");
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!typeToEdit?.id) return;

    try {
      const updatedType = {
        ...typeToEdit,
        typeName,
        typeKey,
        typeAttr,
      };

      await documentService.updateDocumentType(typeToEdit.id, updatedType);
      toast.success("Document type updated successfully");
      setEditDialogOpen(false);
      setTypeToEdit(null);
      setTypeName("");
      setTypeKey("");
      setTypeAttr("");
      fetchTypes();
    } catch (error) {
      console.error("Error updating document type:", error);
      toast.error("Failed to update document type");
    }
  };

  const openBulkDeleteDialog = () => {
    if (selectedTypes.length === 0) {
      toast.error("Please select document types to delete");
      return;
    }
    setBulkDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedTypes.map((id) => documentService.deleteDocumentType(id))
      );
      toast.success(`${selectedTypes.length} document types deleted successfully`);
      setBulkDeleteDialogOpen(false);
      setSelectedTypes([]);
      fetchTypes();
    } catch (error) {
      console.error("Error deleting document types:", error);
      toast.error("Failed to delete document types");
    }
  };

  const handleSelectType = (id: number | undefined) => {
    if (!id) return;
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((typeId) => typeId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTypes.length === filteredTypes.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(filteredTypes.map((type) => type.id || 0).filter(Boolean));
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setAttributeFilter("any");
  };

  // Filter types based on search query and other filters
  const filteredTypes = types.filter((type) => {
    let matchesSearch = true;
    let matchesAttribute = true;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        searchField === "all"
          ? type.typeName?.toLowerCase().includes(query) ||
          type.typeKey?.toLowerCase().includes(query) ||
          type.typeAttr?.toLowerCase().includes(query)
          : searchField === "name"
            ? type.typeName?.toLowerCase().includes(query)
            : searchField === "key"
              ? type.typeKey?.toLowerCase().includes(query)
              : searchField === "attr"
                ? type.typeAttr?.toLowerCase().includes(query)
                : true;
    }

    // Attribute filter
    if (attributeFilter === "with") {
      matchesAttribute = Boolean(type.typeAttr && type.typeAttr.trim());
    } else if (attributeFilter === "without") {
      matchesAttribute = !type.typeAttr || !type.typeAttr.trim();
    }

    return matchesSearch && matchesAttribute;
  });

  // Filter badges for display
  const filterBadges = [
    ...(searchQuery
      ? [
        {
          id: "search",
          label: `Search: ${searchQuery}`,
          onRemove: () => setSearchQuery(""),
        },
      ]
      : []),
    ...(attributeFilter !== "any"
      ? [
        {
          id: "attributes",
          label: `Attributes: ${attributeFilter}`,
          onRemove: () => setAttributeFilter("any"),
        },
      ]
      : []),
  ];

  // Search fields for SearchAndFilterBar
  const searchFields = [
    { id: "all", label: "All fields" },
    { id: "name", label: "Type Name" },
    { id: "key", label: "Type Code" },
    { id: "attr", label: "Attributes" },
  ];

  // Create bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: openBulkDeleteDialog,
      variant: "destructive",
      className:
        "bg-red-900/30 border-red-500/30 text-red-300 hover:text-red-200 hover:bg-red-900/50 hover:border-red-400/50 transition-all duration-200 shadow-md",
    },
  ];

  // Page actions for PageLayout
  const pageActions = [
    ...(isSimpleUser
      ? []
      : [
        {
          label: "New Type",
          variant: "default" as const,
          icon: Plus,
          onClick: () => navigate("/document-types-management/create"),
        },
        {
          label: "Management View",
          variant: "outline" as const,
          icon: ArrowRight,
          onClick: () => navigate("/document-types-management"),
        },
      ]),
  ];

  // Clean and format the type name to handle edge cases
  const getDisplayTypeName = (typeName?: string) => {
    if (!typeName || typeName.trim() === '') {
      return "Unnamed Type";
    }

    // Clean the type name by removing unwanted numeric suffixes
    let cleanName = typeName.trim();

    // Very aggressive cleaning to handle all possible patterns:

    // 1. Remove numbers directly attached to the end (like "Name0", "Name123")
    cleanName = cleanName.replace(/\d+$/, '');

    // 2. Remove trailing spaces and numbers (like " 0 0", " 1 2 3", etc.)
    cleanName = cleanName.replace(/(\s+\d+)+\s*$/, '');

    // 3. Remove any remaining standalone numbers at the end
    cleanName = cleanName.replace(/\s+\d+$/, '');

    // 4. Remove multiple spaces and clean up
    cleanName = cleanName.replace(/\s+/g, ' ');

    // 5. Remove any trailing zeros specifically (with or without spaces)
    cleanName = cleanName.replace(/\s*0+\s*$/, '');

    // 6. Final cleanup of any remaining numbers at the end
    cleanName = cleanName.replace(/[\s\d]*$/, '').trim();

    // If the name is empty after cleaning, it was probably all numbers
    if (!cleanName || cleanName.trim() === '') {
      return "Unnamed Type";
    }

    // Final trim
    cleanName = cleanName.trim();

    // Check for numeric-only values like "00", "0", etc.
    if (/^\d+$/.test(cleanName)) {
      return `Type ${cleanName}`;
    }

    // Check for very short or invalid names after cleaning
    if (cleanName.length < 2) {
      return "Unnamed Type";
    }

    return cleanName;
  };

  return (
    <PageLayout
      title="Document Types"
      subtitle="Browse and manage document classification"
      icon={Layers}
      actions={pageActions}
    >
      {/* Professional Search and Filter Section */}
      <div className="flex flex-col gap-6 p-6 rounded-xl bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-xl border border-primary/10 shadow-lg">
        {/* Search Bar and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Input
                placeholder="Search document types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 transition-all duration-300 placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "grid" | "table")}
              className="border border-primary/20 rounded-lg bg-background/30 backdrop-blur-sm"
            >
              <ToggleGroupItem
                value="table"
                aria-label="Table view"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <LayoutList className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground text-muted-foreground hover:text-foreground hover:bg-primary/10"
              >
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 ${filterOpen ? "bg-primary/10 border-primary/30" : ""
                }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {filterBadges.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                  {filterBadges.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {filterOpen && (
          <div className="p-4 rounded-lg bg-background/30 backdrop-blur-sm border border-primary/10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search Field
                </label>
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="bg-background/50 border-primary/20">
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

              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Attributes
                </label>
                <Select value={attributeFilter} onValueChange={setAttributeFilter}>
                  <SelectTrigger className="bg-background/50 border-primary/20 hover:border-primary/30 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                    <SelectItem value="any" className="hover:bg-primary/10">Any</SelectItem>
                    <SelectItem value="with" className="hover:bg-primary/10">With Attributes</SelectItem>
                    <SelectItem value="without" className="hover:bg-primary/10">Without Attributes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="bg-background/50 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setFilterOpen(false)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Professional Filter Badges */}
        {filterBadges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filterBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-foreground hover:bg-primary/15 transition-all duration-200"
              >
                <span className="font-medium">{badge.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-primary/20 rounded-full"
                  onClick={badge.onRemove}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="min-h-0 flex-1">
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Card
                  key={item}
                  className="bg-background/50 border-primary/10 shadow-lg h-[180px] animate-pulse"
                >
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-primary/20 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-primary/20 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 space-y-4 rounded-xl bg-background/50 border border-primary/10">
              <div className="h-10 bg-primary/10 rounded animate-pulse"></div>
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-16 bg-primary/5 rounded animate-pulse"
                ></div>
              ))}
            </div>
          )
        ) : filteredTypes.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredTypes.map((type) => (
                <Card
                  key={type.id}
                  className={`bg-background/50 backdrop-blur-sm border-primary/10 shadow-lg overflow-hidden hover:border-primary/30 transition-all duration-300 ${selectedTypes.includes(type.id || 0)
                    ? "border-l-4 border-l-primary bg-primary/5"
                    : ""
                    }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg text-foreground flex items-center gap-2">
                        {!isSimpleUser && (
                          <Checkbox
                            checked={selectedTypes.includes(type.id || 0)}
                            onCheckedChange={() => handleSelectType(type.id)}
                            className="border-primary/50 mr-2"
                          />
                        )}
                        {type.typeName || "Unnamed Type"}
                      </CardTitle>
                      {!isSimpleUser && (
                        <div className="flex items-center space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                                  onClick={() => openEditDialog(type)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Edit Type</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                  onClick={() => openDeleteDialog(type)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                <p className="text-xs">Delete Type</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      <span className="font-medium">Key:</span>{" "}
                      {type.typeKey || "No key defined"}
                    </div>
                    {type.typeAttr && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Attributes:</span>{" "}
                        {type.typeAttr}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`border-primary/20 ${type.documentCounter && type.documentCounter > 0
                        ? "text-primary hover:bg-primary/10 cursor-pointer"
                        : "text-slate-400 cursor-not-allowed opacity-50"
                        }`}
                      onClick={() => {
                        const hasDocuments = type.documentCounter && type.documentCounter > 0;
                        if (hasDocuments) {
                          navigate(`/document-types/${type.id}/subtypes`);
                        }
                      }}
                      disabled={!(type.documentCounter && type.documentCounter > 0)}
                    >
                      View Series
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-primary/10 overflow-hidden bg-background/50 backdrop-blur-xl shadow-lg">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-primary/5 sticky top-0 z-10">
                    <TableRow className="border-primary/10 hover:bg-primary/10">
                      {!isSimpleUser && (
                        <TableHead className="w-12 text-muted-foreground">
                          <Checkbox
                            checked={
                              selectedTypes.length === filteredTypes.length &&
                              filteredTypes.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                            className="border-primary/50"
                          />
                        </TableHead>
                      )}
                      <TableHead className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Type Name
                        </div>
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          Key
                        </div>
                      </TableHead>
                      <TableHead className="text-muted-foreground">
                        Attributes
                      </TableHead>
                      <TableHead className="text-muted-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTypes.map((type) => (
                      <TableRow
                        key={type.id}
                        className={`border-primary/10 hover:bg-primary/5 transition-colors ${selectedTypes.includes(type.id || 0)
                          ? "bg-primary/10 border-l-4 border-l-primary"
                          : ""
                          }`}
                      >
                        {!isSimpleUser && (
                          <TableCell className="w-12">
                            <Checkbox
                              checked={selectedTypes.includes(type.id || 0)}
                              onCheckedChange={() => handleSelectType(type.id)}
                              className="border-primary/50"
                            />
                          </TableCell>
                        )}
                        <TableCell className="font-medium text-foreground">
                          {getDisplayTypeName(type.typeName)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {type.typeKey || "No key defined"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {type.typeAttr || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`border-primary/20 ${type.documentCounter && type.documentCounter > 0
                                ? "text-primary hover:bg-primary/10 cursor-pointer"
                                : "text-slate-400 cursor-not-allowed opacity-50"
                                }`}
                              onClick={() => {
                                const hasDocuments = type.documentCounter && type.documentCounter > 0;
                                if (hasDocuments) {
                                  navigate(`/document-types/${type.id}/subtypes`);
                                }
                              }}
                              disabled={!(type.documentCounter && type.documentCounter > 0)}
                            >
                              View Series
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            {!isSimpleUser && (
                              <>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10"
                                        onClick={() => openEditDialog(type)}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit Type</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                        onClick={() => openDeleteDialog(type)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete Type</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Layers className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No document types found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery || filterBadges.length > 0
                ? "No document types match your current filters. Try adjusting your search criteria."
                : "Get started by creating your first document type to organize your documents."}
            </p>
            {!isSimpleUser && (
              <Button
                onClick={() => navigate("/document-types-management/create")}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Document Type
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-destructive/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Document Type
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{typeToDelete?.typeName}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-destructive/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Multiple Document Types
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTypes.length} selected document
              types? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-primary" />
              Edit Document Type
            </DialogTitle>
            <DialogDescription>
              Update the document type information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type Name
              </label>
              <Input
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                placeholder="Enter type name..."
                className="bg-background/50 border-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type Key
              </label>
              <Input
                value={typeKey}
                onChange={(e) => setTypeKey(e.target.value)}
                placeholder="Enter type key..."
                className="bg-background/50 border-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Attributes
              </label>
              <Input
                value={typeAttr}
                onChange={(e) => setTypeAttr(e.target.value)}
                placeholder="Enter attributes..."
                className="bg-background/50 border-primary/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="bg-primary hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {!isSimpleUser && selectedTypes.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedTypes.length}
            entityName="document type"
            actions={bulkActions}
            icon={<Layers className="w-5 h-5 text-primary" />}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
};

export default DocumentTypes;
