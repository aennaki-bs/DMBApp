import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  FileText,
  Calendar,
  Layers,
  Save,
  CheckCircle,
  Share2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import documentService from "@/services/documentService";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";

// Import step components
import { DateSelectionStep } from "./steps/DateSelectionStep";
import { TypeSelectionWithDateFilterStep } from "./steps/TypeSelectionWithDateFilterStep";
import { ContentStep } from "./steps/ContentStep";
import { ReviewStep } from "./steps/ReviewStep";
import { CircuitAssignmentStep } from "./steps/CircuitAssignmentStep";

interface CreateDocumentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Step definition interface
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

// Form data interface
interface FormData {
  docDate: string;
  comptableDate: string | null;
  selectedTypeId: number | null;
  selectedSubTypeId: number | null;
  title: string;
  documentAlias: string;
  content: string;
  circuitId: number | null;
  circuitName: string;
}

const MotionDiv = motion.div;

export default function CreateDocumentWizard({
  open,
  onOpenChange,
  onSuccess,
}: CreateDocumentWizardProps) {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    docDate: new Date().toISOString().split("T")[0],
    comptableDate: null,
    selectedTypeId: null,
    selectedSubTypeId: null,
    title: "",
    documentAlias: "",
    content: "",
    circuitId: null,
    circuitName: "",
  });

  // Data fetching states
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [circuits, setCircuits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Validation errors
  const [dateError, setDateError] = useState<string | null>(null);
  const [comptableDateError, setComptableDateError] = useState<string | null>(
    null
  );
  const [typeError, setTypeError] = useState<string | null>(null);
  const [subTypeError, setSubTypeError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [circuitError, setCircuitError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData({
        docDate: new Date().toISOString().split("T")[0],
        comptableDate: null,
        selectedTypeId: null,
        selectedSubTypeId: null,
        title: "",
        documentAlias: "",
        content: "",
        circuitId: null,
        circuitName: "",
      });
      fetchDocumentTypes();
      fetchCircuits();
    }
  }, [open]);

  // Step definitions
  const steps: Step[] = [
    {
      id: 1,
      title: "Document Date",
      description: "Select the document date",
      icon: <Calendar className="h-4 w-4" />,
      completed: currentStep > 1,
    },
    {
      id: 2,
      title: "Document Type",
      description: "Select type and subtype",
      icon: <Layers className="h-4 w-4" />,
      completed: currentStep > 2,
    },
    {
      id: 3,
      title: "Content",
      description: "Add document content",
      icon: <FileText className="h-4 w-4" />,
      completed: currentStep > 3,
    },
    {
      id: 4,
      title: "Circuit",
      description: "Assign to circuit",
      icon: <Share2 className="h-4 w-4" />,
      completed: currentStep > 4,
    },
    {
      id: 5,
      title: "Review",
      description: "Confirm document details",
      icon: <CheckCircle className="h-4 w-4" />,
      completed: false,
    },
  ];

  const TOTAL_STEPS = steps.length;

  const fetchDocumentTypes = async () => {
    try {
      setIsLoading(true);
      const types = await documentTypeService.getAllDocumentTypes();

      if (types && types.length > 0) {
        setDocumentTypes(types);
      } else {
        toast.warning("No document types found", {
          description:
            "You need to create document types before creating documents.",
          duration: 5000,
        });
        setDocumentTypes([]);
      }
    } catch (error) {
      console.error("Failed to fetch document types:", error);
      toast.error("Failed to load document types", {
        description:
          "There was a problem loading document types. Using fallback data.",
        duration: 4000,
      });

      // Set some default document types as fallback
      setDocumentTypes([
        { id: 1, typeName: "Invoice", typeKey: "INV" },
        { id: 2, typeName: "Contract", typeKey: "CON" },
        { id: 3, typeName: "Report", typeKey: "REP" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCircuits = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API call to fetch circuits
      // For now, using mock data that matches the table shown in screenshot
      const mockCircuits = [
        {
          id: 1,
          name: "circuit",
          description: "circuit de vente",
          code: "CR01",
          isActive: true,
        },
        {
          id: 2,
          name: "circuitA",
          description: "circuit test of management",
          code: "CR02",
          isActive: false,
        },
        {
          id: 3,
          name: "adfa",
          description: "adfa adfaa adfa",
          code: "CR03",
          isActive: false,
        },
        {
          id: 4,
          name: "CircuitC",
          description: "string",
          code: "CR04",
          isActive: false,
        },
      ];

      setCircuits(mockCircuits);
    } catch (error) {
      console.error("Failed to fetch circuits:", error);
      toast.error("Failed to load circuits", {
        description:
          "There was a problem loading circuits. Using fallback data.",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubTypesForDate = async (typeId: number, date: string) => {
    try {
      setIsLoading(true);
      const dateObj = new Date(date);

      // Try to get subtypes from API that are valid for the selected date
      const subtypes = await subTypeService.getSubTypesForDate(typeId, dateObj);

      if (subtypes && subtypes.length > 0) {
        setSubTypes(subtypes);
        return;
      }

      // If we get here, no valid subtypes were found for this date
      setSubTypes([]);

      // Get the type name for better error message
      const typeName =
        documentTypes.find((t) => t.id === typeId)?.typeName || "selected type";

      toast.warning(`No valid subtypes available`, {
        description: `There are no subtypes available for "${typeName}" on ${new Date(
          date
        ).toLocaleDateString()}. Please select a different document type or date.`,
        duration: 5000,
      });
    } catch (error) {
      console.error("Failed to fetch subtypes:", error);
      toast.error("Failed to load subtypes", {
        description:
          "There was a problem loading subtypes for the selected date. Using fallback data.",
        duration: 4000,
      });

      // Use fallback subtypes filtered by date
      const fallbackSubtypes = getFallbackSubtypes(typeId, date);

      if (fallbackSubtypes.length === 0) {
        // Get the type name for better error message
        const typeName =
          documentTypes.find((t) => t.id === typeId)?.typeName ||
          "selected type";

        toast.warning(`No valid subtypes available`, {
          description: `There are no subtypes available for "${typeName}" on ${new Date(
            date
          ).toLocaleDateString()}. Please select a different document type or date.`,
          duration: 5000,
        });
      }

      setSubTypes(fallbackSubtypes);
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback subtypes function
  const getFallbackSubtypes = (
    typeId: number,
    selectedDate?: string
  ): SubType[] => {
    const fallbackData: Record<number, SubType[]> = {
      1: [
        // For Invoice
        {
          id: 101,
          name: "Standard Invoice",
          subTypeKey: "SI",
          description: "Standard invoice for regular billing",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 1,
          isActive: true,
        },
        {
          id: 102,
          name: "Tax Invoice",
          subTypeKey: "TI",
          description: "Invoice with tax details included",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 1,
          isActive: true,
        },
      ],
      2: [
        // For Contract
        {
          id: 201,
          name: "Employment Contract",
          subTypeKey: "EC",
          description: "Contract for employment purposes",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 2,
          isActive: true,
        },
        {
          id: 202,
          name: "Service Agreement",
          subTypeKey: "SA",
          description: "Agreement for service provision",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 2,
          isActive: true,
        },
      ],
      3: [
        // For Report
        {
          id: 301,
          name: "Monthly Report",
          subTypeKey: "MR",
          description: "Regular monthly reporting document",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 3,
          isActive: true,
        },
        {
          id: 302,
          name: "Annual Report",
          subTypeKey: "AR",
          description: "Yearly comprehensive report",
          startDate: "2023-01-01",
          endDate: "2025-12-31",
          documentTypeId: 3,
          isActive: true,
        },
      ],
    };

    // Get all subtypes for the type
    const allSubtypes = fallbackData[typeId] || [];

    // If no date provided, return all subtypes
    if (!selectedDate) {
      return allSubtypes;
    }

    // Filter subtypes based on date range
    const docDate = new Date(selectedDate);
    return allSubtypes.filter((subtype) => {
      const startDate = new Date(subtype.startDate);
      const endDate = new Date(subtype.endDate);

      // Check if document date falls within the subtype's valid date range
      return docDate >= startDate && docDate <= endDate;
    });
  };

  const handleUpdateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear related errors when a field changes
    if (field === "docDate") setDateError(null);
    if (field === "selectedTypeId") setTypeError(null);
    if (field === "selectedSubTypeId") setSubTypeError(null);
    if (field === "title") setTitleError(null);
    if (field === "content") setContentError(null);

    // If document date changes, reset type and subtype selections
    if (field === "docDate") {
      setFormData((prev) => ({
        ...prev,
        selectedTypeId: null,
        selectedSubTypeId: null,
      }));
    }

    // If document type changes, reset subtype selection and fetch valid subtypes
    if (field === "selectedTypeId" && value !== null) {
      setFormData((prev) => ({
        ...prev,
        selectedSubTypeId: null,
      }));
      fetchSubTypesForDate(value, formData.docDate);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Document Date
        if (!formData.docDate) {
          setDateError("Document date is required");
          toast.error("Document date is required", {
            description: "Please select a valid date to continue.",
            duration: 3000,
          });
          return false;
        }

        try {
          // Validate date format
          const dateObj = new Date(formData.docDate);
          if (isNaN(dateObj.getTime())) {
            setDateError("Invalid date format");
            toast.error("Invalid date format", {
              description: "Please select a valid date to continue.",
              duration: 3000,
            });
            return false;
          }
        } catch (error) {
          setDateError("Invalid date");
          toast.error("Invalid date", {
            description: "Please select a valid date to continue.",
            duration: 3000,
          });
          return false;
        }

        return true;

      case 2: // Document Type & Subtype
        if (!formData.selectedTypeId) {
          setTypeError("Document type is required");
          toast.error("Document type is required", {
            description: "Please select a document type to continue.",
            duration: 3000,
          });
          return false;
        }

        if (!formData.selectedSubTypeId) {
          setSubTypeError("Subtype is required");
          toast.error("Subtype is required", {
            description: "Please select a subtype to continue.",
            duration: 3000,
          });
          return false;
        }

        // Validate that the selected subtype is valid for the selected date
        const selectedSubType = subTypes.find(
          (st) => st.id === formData.selectedSubTypeId
        );
        if (!selectedSubType) {
          setSubTypeError("Invalid subtype selection");
          toast.error("Invalid subtype selection", {
            description:
              "The selected subtype is not valid. Please select a valid subtype.",
            duration: 3000,
          });
          return false;
        }

        // Additional validation to ensure the subtype is valid for the selected date
        try {
          const docDate = new Date(formData.docDate);
          const startDate = new Date(selectedSubType.startDate);
          const endDate = new Date(selectedSubType.endDate);

          if (docDate < startDate || docDate > endDate) {
            setSubTypeError("Subtype not valid for selected date");
            toast.error("Subtype not valid for selected date", {
              description: `The selected subtype is only valid from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.`,
              duration: 4000,
            });
            return false;
          }
        } catch (error) {
          console.error("Error validating subtype date range:", error);
        }

        return true;

      case 3: // Content
        if (!formData.content.trim()) {
          setContentError("Document content is required");
          toast.error("Document content is required", {
            description: "Please enter content for your document to continue.",
            duration: 3000,
          });
          return false;
        }

        // If we haven't set a title yet, derive it from the content
        if (!formData.title.trim()) {
          // Get the first line or first few words as the title
          const firstLine = formData.content.split("\n")[0].trim();
          const title =
            firstLine.length > 50
              ? firstLine.substring(0, 50) + "..."
              : firstLine;
          handleUpdateFormData("title", title);
        }

        return true;

      case 4: // Circuit
        if (!formData.circuitId) {
          // Check if there are any active circuits available
          const activeCircuits = circuits.filter((c) => c.isActive);
          if (activeCircuits.length === 0) {
            setCircuitError("No active circuits available for assignment");
            toast.error("No active circuits available", {
              description:
                "You need at least one active circuit to assign documents. Please activate a circuit first.",
              duration: 5000,
            });
            return false;
          }

          setCircuitError("Circuit is required");
          toast.error("Circuit is required", {
            description: "Please select a circuit to continue.",
            duration: 3000,
          });
          return false;
        }
        return true;

      case 5: // Review
        // Final validation before submission
        if (!formData.title.trim()) {
          toast.error("Document title is required", {
            description: "Please provide a title for your document.",
            duration: 3000,
          });
          return false;
        }

        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setIsSubmitting(true);
      toast.loading("Creating document...");

      // Get the selected type and subtype objects
      const selectedType = documentTypes.find(
        (t) => t.id === formData.selectedTypeId
      );
      const selectedSubType = subTypes.find(
        (st) => st.id === formData.selectedSubTypeId
      );

      if (!selectedType || !selectedSubType) {
        toast.dismiss();
        toast.error("Invalid document type or subtype");
        return;
      }

      // Prepare the request data
      const requestData = {
        typeId: formData.selectedTypeId!,
        subTypeId: formData.selectedSubTypeId!,
        title: formData.title,
        documentAlias: formData.documentAlias,
        docDate: formData.docDate,
        comptableDate: formData.comptableDate,
        content: formData.content,
        circuitId: formData.circuitId,
        circuitName: formData.circuitName,
      };

      // Call the API to create the document
      const response = await documentService.createDocument(requestData);

      toast.dismiss();
      toast.success("Document created successfully");

      onSuccess(); // Notify parent component
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.dismiss();
      toast.error("Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      handleUpdateFormData("docDate", dateString);
    }
  };

  const handleComptableDateChange = (date: Date | undefined) => {
    if (date) {
      const dateString = date.toISOString().split("T")[0];
      handleUpdateFormData("comptableDate", dateString);
    } else {
      handleUpdateFormData("comptableDate", null);
    }
  };

  const handleTypeChange = (value: string) => {
    const typeId = value ? parseInt(value, 10) : null;
    handleUpdateFormData("selectedTypeId", typeId);
  };

  const handleSubTypeChange = (value: string) => {
    const subTypeId = value ? parseInt(value, 10) : null;
    handleUpdateFormData("selectedSubTypeId", subTypeId);
  };

  const handleContentChange = (value: string) => {
    handleUpdateFormData("content", value);
  };

  const handleCircuitChange = (value: string) => {
    const circuitId = value ? parseInt(value, 10) : null;
    handleUpdateFormData("circuitId", circuitId);

    // Find the circuit name for the selected ID
    if (circuitId) {
      const selectedCircuit = circuits.find((c) => c.id === circuitId);
      if (selectedCircuit) {
        handleUpdateFormData("circuitName", selectedCircuit.name);
      }
    } else {
      handleUpdateFormData("circuitName", "");
    }
  };

  const jumpToStep = (step: number) => {
    setCurrentStep(step);
  };

  const renderStepContent = () => {
    const variants = {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    };

    switch (currentStep) {
      case 1: // Document Date
        return (
          <MotionDiv
            key="step1"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <DateSelectionStep
                docDate={formData.docDate}
                comptableDate={formData.comptableDate}
                dateError={dateError}
                comptableDateError={comptableDateError}
                onDateChange={handleDateChange}
                onComptableDateChange={handleComptableDateChange}
                selectedSubType={subTypes.find(
                  (st) => st.id === formData.selectedSubTypeId
                )}
              />
            </div>
          </MotionDiv>
        );

      case 2: // Document Type & Subtype
        return (
          <MotionDiv
            key="step2"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <TypeSelectionWithDateFilterStep
                documentTypes={documentTypes}
                selectedTypeId={formData.selectedTypeId}
                selectedSubTypeId={formData.selectedSubTypeId}
                onTypeChange={handleTypeChange}
                onSubTypeChange={handleSubTypeChange}
                typeError={typeError}
                subTypeError={subTypeError}
                documentDate={formData.docDate}
              />
            </div>
          </MotionDiv>
        );

      case 3: // Content
        return (
          <MotionDiv
            key="step3"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <ContentStep
                content={formData.content}
                onContentChange={handleContentChange}
                contentError={contentError}
              />
            </div>
          </MotionDiv>
        );

      case 4: // Circuit
        return (
          <MotionDiv
            key="step4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <CircuitAssignmentStep
                circuits={circuits
                  .filter((circuit) => circuit.isActive) // Only show active circuits
                  .map((circuit) => ({
                    ...circuit,
                    stats: {
                      documentsProcessed: 74, // Exact value from screenshot
                      averageProcessingTime: "19h", // Exact value from screenshot
                      approvers: 4, // Exact value from screenshot
                    },
                  }))}
                selectedCircuitId={formData.circuitId}
                circuitError={circuitError}
                onCircuitChange={handleCircuitChange}
                isLoading={isLoading}
              />
            </div>
          </MotionDiv>
        );

      case 5: // Review
        return (
          <MotionDiv
            key="step5"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4 py-4">
              <ReviewStep
                selectedType={documentTypes.find(
                  (t) => t.id === formData.selectedTypeId
                )}
                selectedSubType={subTypes.find(
                  (st) => st.id === formData.selectedSubTypeId
                )}
                documentAlias={formData.documentAlias}
                title={formData.title}
                docDate={formData.docDate}
                comptableDate={formData.comptableDate}
                content={formData.content}
                circuitName={formData.circuitName}
                onEditTypeClick={() => jumpToStep(2)}
                onEditDetailsClick={() => jumpToStep(3)}
                onEditDateClick={() => jumpToStep(1)}
                onEditContentClick={() => jumpToStep(3)}
                onEditCircuitClick={() => jumpToStep(4)}
              />
            </div>
          </MotionDiv>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-[#0a1033] border border-blue-900/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-blue-100">
            Create Document
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Create a new document with the selected type and date
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-4 mt-2">
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2",
                    step.id === currentStep
                      ? "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500"
                      : step.completed
                      ? "border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500"
                      : "border-gray-300 text-gray-500 dark:border-gray-700"
                  )}
                >
                  {step.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon || step.id
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-sm font-medium",
                    step.id === currentStep
                      ? "text-blue-600 dark:text-blue-500"
                      : step.completed
                      ? "text-green-600 dark:text-green-500"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </span>
                <span
                  className={cn(
                    "text-xs text-gray-500 dark:text-gray-400 hidden sm:block",
                    step.id === currentStep &&
                      "text-blue-600 dark:text-blue-500"
                  )}
                >
                  {step.description}
                </span>
              </div>
            ))}
          </div>

          {/* Progress line */}
          <div className="relative mt-4 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
            <div className="absolute inset-0 flex items-center">
              <div
                className="h-1 bg-blue-600 dark:bg-blue-500 rounded transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="py-2 min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
                className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="bg-transparent border-blue-900/50 text-blue-200 hover:bg-blue-900/20"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner mr-2" /> Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Create Document
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
