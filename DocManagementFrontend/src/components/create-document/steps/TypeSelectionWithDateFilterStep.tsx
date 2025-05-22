import React, { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  PlusCircle,
  Info,
  Layers,
  Tag,
  ChevronDown,
  Clock,
  Calendar,
  Loader2,
  FileWarning,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";
import { toast } from "sonner";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface TypeSelectionWithDateFilterStepProps {
  documentTypes: DocumentType[];
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  onTypeChange: (value: string) => void;
  onSubTypeChange: (value: string) => void;
  typeError?: string | null;
  subTypeError?: string | null;
  documentDate: string;
}

export const TypeSelectionWithDateFilterStep = ({
  documentTypes,
  selectedTypeId,
  selectedSubTypeId,
  onTypeChange,
  onSubTypeChange,
  typeError,
  subTypeError,
  documentDate,
}: TypeSelectionWithDateFilterStepProps) => {
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(false);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [filteredSubTypes, setFilteredSubTypes] = useState<SubType[]>([]);
  const [noSubTypesAvailable, setNoSubTypesAvailable] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<DocumentType[]>([]);

  // Custom select state
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [subtypeDropdownOpen, setSubtypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const subtypeDropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = selectedTypeId
    ? documentTypes.find((type) => type.id === selectedTypeId)
    : null;

  const selectedSubType = selectedSubTypeId
    ? filteredSubTypes.find((subtype) => subtype.id === selectedSubTypeId)
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setTypeDropdownOpen(false);
      }
      if (
        subtypeDropdownRef.current &&
        !subtypeDropdownRef.current.contains(event.target as Node)
      ) {
        setSubtypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set available types immediately to show all types initially
  useEffect(() => {
    // Initially show all document types
    setAvailableTypes(documentTypes);
  }, [documentTypes]);

  // Filter document types based on the selected date
  useEffect(() => {
    const fetchAvailableTypesForDate = async () => {
      try {
        if (!documentDate) {
          setAvailableTypes(documentTypes);
          return;
        }

        setIsLoadingTypes(true);

        // For each document type, check if there are valid subtypes for this date
        const validTypes: DocumentType[] = [];
        const docDate = new Date(documentDate);

        for (const docType of documentTypes) {
          if (!docType.id) continue;

          try {
            // Get subtypes that are valid for the selected date
            const subtypes = await subTypeService.getSubTypesForDate(
              docType.id,
              docDate
            );

            // If there are any valid subtypes for this date, include the document type
            if (subtypes && subtypes.length > 0) {
              validTypes.push(docType);
              continue;
            }

            // If no subtypes from API, check all subtypes for this type and filter by date
            const allSubtypes = await subTypeService.getSubTypesByDocType(
              docType.id
            );
            const validSubtypes = filterSubtypesByDateRange(
              allSubtypes,
              documentDate
            );

            if (validSubtypes.length > 0) {
              validTypes.push(docType);
            }
          } catch (error) {
            console.error(
              `Error checking subtypes for document type ${docType.id}:`,
              error
            );
          }
        }

        if (validTypes.length > 0) {
          setAvailableTypes(validTypes);
        } else {
          // If no valid types found, show empty state
          setAvailableTypes([]);
          toast.warning(
            "No document types have valid subtypes for the selected date",
            {
              description:
                "Please select a different date or create new subtypes with valid date ranges.",
              duration: 5000,
              icon: <FileWarning className="h-5 w-5 text-amber-400" />,
            }
          );
        }

        // If the currently selected type is not valid for this date, clear it
        if (
          selectedTypeId &&
          !validTypes.find((t) => t.id === selectedTypeId)
        ) {
          onTypeChange("");
          onSubTypeChange("");
          toast.info(
            "Selected document type is not valid for the chosen date",
            {
              description:
                "Your selection has been reset. Please choose from available types.",
              duration: 4000,
            }
          );
        }
      } catch (error) {
        console.error("Error filtering document types by date:", error);
        toast.error("Failed to filter document types", {
          description:
            "There was a problem loading document types for the selected date.",
          duration: 4000,
        });
        setAvailableTypes([]);
      } finally {
        setIsLoadingTypes(false);
      }
    };

    fetchAvailableTypesForDate();
  }, [
    documentDate,
    documentTypes,
    selectedTypeId,
    onTypeChange,
    onSubTypeChange,
  ]);

  // Helper function to filter subtypes by date range
  const filterSubtypesByDateRange = (
    subtypes: SubType[],
    date: string
  ): SubType[] => {
    const docDate = new Date(date);
    return subtypes.filter((subtype) => {
      const startDate = subtype.startDate ? new Date(subtype.startDate) : null;
      const endDate = subtype.endDate ? new Date(subtype.endDate) : null;

      // If either start date or end date is missing, consider it invalid
      if (!startDate || !endDate) return false;

      // Check if document date falls within the subtype's valid date range
      return docDate >= startDate && docDate <= endDate;
    });
  };

  // Update filtered subtypes when document type changes
  useEffect(() => {
    if (selectedTypeId) {
      setIsLoadingSubTypes(true);
      setNoSubTypesAvailable(false);

      const fetchSubTypesForDate = async () => {
        try {
          // Get subtypes that are valid for the selected date
          const subtypes = await subTypeService.getSubTypesForDate(
            selectedTypeId,
            new Date(documentDate)
          );

          if (subtypes && subtypes.length > 0) {
            setFilteredSubTypes(subtypes);
            setNoSubTypesAvailable(false);
          } else {
            // If no subtypes returned, fall back to getting all subtypes for this document type
            const allSubtypes = await subTypeService.getSubTypesByDocType(
              selectedTypeId
            );

            // Filter these subtypes by date range
            const validSubtypes = filterSubtypesByDateRange(
              allSubtypes,
              documentDate
            );

            if (validSubtypes.length > 0) {
              setFilteredSubTypes(validSubtypes);
              setNoSubTypesAvailable(false);
            } else {
              setFilteredSubTypes([]);
              setNoSubTypesAvailable(true);
              toast.warning(
                "No stumps available for this document type on the selected date",
                {
                  description:
                    "Please select a different document type or date.",
                  duration: 4000,
                }
              );
            }
          }

          // If the currently selected stump is not valid for this date, clear it
          if (
            selectedSubTypeId &&
            !subtypes.find((st) => st.id === selectedSubTypeId)
          ) {
            onSubTypeChange("");
            toast.info("Selected stump is not valid for the chosen date", {
              description:
                "Your selection has been reset. Please choose from available stumps.",
              duration: 3000,
            });
          }
        } catch (error) {
          console.error("Failed to load stumps for date:", error);
          toast.error("Failed to load stumps", {
            description:
              "There was a problem loading stumps for the selected document type and date.",
            duration: 4000,
          });

          // Try to get all stumps as fallback
          try {
            const allSubtypes = await subTypeService.getSubTypesByDocType(
              selectedTypeId
            );

            // Filter these stumps by date range
            const validSubtypes = filterSubtypesByDateRange(
              allSubtypes,
              documentDate
            );

            if (validSubtypes.length > 0) {
              setFilteredSubTypes(validSubtypes);
              setNoSubTypesAvailable(false);
            } else {
              setFilteredSubTypes([]);
              setNoSubTypesAvailable(true);
            }
          } catch {
            setFilteredSubTypes([]);
            setNoSubTypesAvailable(true);
          }
        } finally {
          setIsLoadingSubTypes(false);
        }
      };

      fetchSubTypesForDate();
    } else {
      setFilteredSubTypes([]);
      setNoSubTypesAvailable(false);
    }
  }, [selectedTypeId, documentDate]);

  const handleTypeSelect = (typeId: string) => {
    onTypeChange(typeId);
    setTypeDropdownOpen(false);
  };

  const handleSubtypeSelect = (subtypeId: string) => {
    onSubTypeChange(subtypeId);
    setSubtypeDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter Info */}
      <Card className="bg-blue-900/20 border-blue-800/40">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 mt-0.5 text-blue-400" />
            <div>
              <h4 className="text-sm font-medium text-blue-400">
                Filtering by Document Date
              </h4>
              <p className="text-sm text-gray-300 mt-1">
                Showing document types and stumps valid for:{" "}
                <span className="font-medium text-white">
                  {format(new Date(documentDate), "MMMM d, yyyy")}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Type Selection */}
      <div className="space-y-3">
        <Label
          htmlFor="documentType"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <Tag className="h-4 w-4 text-blue-400" />
          Document Type*
        </Label>

        {isLoadingTypes ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-gray-800/50" />
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading document types for selected date...</span>
            </div>
          </div>
        ) : availableTypes.length === 0 ? (
          <Card className="bg-amber-900/20 border-amber-800/40">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3 text-amber-400">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm">
                    No document types have valid stumps for the selected date
                    ({format(new Date(documentDate), "MMM d, yyyy")}).
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      onClick={() => {
                        // Go back to previous step to change date
                        // This is handled by the parent component
                        toast.info("Please select a different date", {
                          description:
                            "Try choosing another date that has valid document types and stumps.",
                          duration: 3000,
                        });
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Change Date
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                      asChild
                    >
                      <Link to="/document-types-management">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Document Type
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Custom Document Type Select */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                type="button"
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                className={`flex items-center justify-between w-full h-10 px-3 py-2 text-base bg-gray-900 border ${
                  typeError
                    ? "border-red-500"
                    : typeDropdownOpen
                    ? "border-blue-500 ring-1 ring-blue-500/30"
                    : "border-gray-800 hover:border-gray-700"
                } rounded-md text-white transition-all duration-200`}
                data-testid="document-type-select"
              >
                <span
                  className={selectedTypeId ? "text-white" : "text-gray-500"}
                >
                  {selectedType
                    ? `${selectedType.typeName} ${
                        selectedType.typeKey ? `(${selectedType.typeKey})` : ""
                      }`
                    : "Select document type"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    typeDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {typeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-800 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 duration-100">
                  {availableTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
                        selectedTypeId === type.id
                          ? "bg-blue-900/40 text-blue-300 font-medium"
                          : "text-gray-200"
                      }`}
                      onClick={() =>
                        handleTypeSelect(type.id?.toString() || "")
                      }
                    >
                      {type.typeName} {type.typeKey ? `(${type.typeKey})` : ""}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {typeError && (
          <p className="text-sm text-red-500 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {typeError}
          </p>
        )}
        <p className="text-sm text-gray-400">
          Only showing document types with valid stumps for the selected date
        </p>
      </div>

      {/* Stump Selection */}
      {selectedTypeId && (
        <div className="space-y-3 mt-4 pt-4 border-t border-gray-800/50">
          <Label
            htmlFor="subType"
            className="text-sm font-medium text-gray-200 flex items-center gap-2"
          >
            <Layers className="h-4 w-4 text-blue-400" />
            Stump*
          </Label>
          {isLoadingSubTypes ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full bg-gray-800/50" />
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading stumps for selected document type...</span>
              </div>
            </div>
          ) : noSubTypesAvailable ? (
            <Card className="bg-amber-900/20 border-amber-800/40">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3 text-amber-400">
                  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm">
                      No stumps available for{" "}
                      <strong>{selectedType?.typeName}</strong> on{" "}
                      {format(new Date(documentDate), "MMMM d, yyyy")}.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        onClick={() => {
                          onTypeChange("");
                          toast.info(
                            "Please select a different document type",
                            {
                              description:
                                "Try choosing another document type that has valid stumps.",
                              duration: 3000,
                            }
                          );
                        }}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Change Type
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        asChild
                      >
                        <Link to={`/document-types/${selectedTypeId}/subtypes`}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Stump
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Custom Stump Select */}
              <div className="relative" ref={subtypeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSubtypeDropdownOpen(!subtypeDropdownOpen)}
                  className={`flex items-center justify-between w-full h-10 px-3 py-2 text-base bg-gray-900 border ${
                    subTypeError
                      ? "border-red-500"
                      : subtypeDropdownOpen
                      ? "border-blue-500 ring-1 ring-blue-500/30"
                      : "border-gray-800 hover:border-gray-700"
                  } rounded-md text-white transition-all duration-200`}
                  data-testid="subtype-select"
                >
                  <span
                    className={
                      selectedSubTypeId ? "text-white" : "text-gray-500"
                    }
                  >
                    {selectedSubType ? selectedSubType.name : "Select stump"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      subtypeDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {subtypeDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-900 border border-gray-800 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in-0 zoom-in-95 duration-100">
                    {filteredSubTypes.map((subType) => (
                      <div
                        key={subType.id}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-800 transition-colors ${
                          selectedSubTypeId === subType.id
                            ? "bg-blue-900/40 text-blue-300 font-medium"
                            : "text-gray-200"
                        }`}
                        onClick={() =>
                          handleSubtypeSelect(subType.id?.toString() || "")
                        }
                      >
                        <div>{subType.name}</div>
                        <div className="text-xs text-gray-400 flex items-center mt-0.5">
                          <Clock className="h-3 w-3 mr-1" />
                          Valid:{" "}
                          {format(
                            new Date(subType.startDate),
                            "MMM d, yyyy"
                          )} -{" "}
                          {format(new Date(subType.endDate), "MMM d, yyyy")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          {subTypeError && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {subTypeError}
            </p>
          )}
          <p className="text-sm text-gray-400">
            Only showing stumps valid for the selected date
          </p>
        </div>
      )}

      {/* Show selected stump details */}
      {selectedSubType && (
        <Card className="bg-blue-900/20 border-blue-800/40 mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 mt-0.5 text-blue-400" />
              <div>
                <h4 className="text-sm font-medium text-blue-400">
                  Selected: {selectedSubType.name}
                </h4>
                <p className="text-sm text-gray-300 mt-1">
                  {selectedSubType.description || "No description available"}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Valid period:{" "}
                  {format(
                    new Date(selectedSubType.startDate),
                    "MMMM d, yyyy"
                  )}{" "}
                  - {format(new Date(selectedSubType.endDate), "MMMM d, yyyy")}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
