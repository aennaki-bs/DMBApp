import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  FileText,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  FileSignature,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import documentService from "@/services/documentService";
import subTypeService from "@/services/subTypeService";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import { TypeSelectionStep } from "@/components/create-document/steps/TypeSelectionStep";
import { TitleStep } from "@/components/create-document/steps/TitleStep";
import { DateSelectionStep } from "@/components/create-document/steps/DateSelectionStep";
import { ContentStep } from "@/components/create-document/steps/ContentStep";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function CreateDocument() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<number | null>(
    null
  );
  const [title, setTitle] = useState("");
  const [documentAlias, setDocumentAlias] = useState("");
  const [docDate, setDocDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [content, setContent] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);

  // Total number of steps
  const TOTAL_STEPS = 4;

  // Step definitions
  const steps = [
    {
      id: 1,
      title: "Document Type",
      description: "Select document type and subtype",
      icon: <Layers className="h-4 w-4" />,
      completed: step > 1,
    },
    {
      id: 2,
      title: "Document Details",
      description: "Enter title and alias",
      icon: <FileSignature className="h-4 w-4" />,
      completed: step > 2,
    },
    {
      id: 3,
      title: "Document Date",
      description: "Set document date",
      icon: <Calendar className="h-4 w-4" />,
      completed: step > 3,
    },
    {
      id: 4,
      title: "Content",
      description: "Add document content",
      icon: <FileText className="h-4 w-4" />,
      completed: false,
    },
  ];

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setIsLoading(true);
        const types = await documentService.getAllDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error("Failed to fetch document types:", error);
        toast.error("Failed to load document types");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  useEffect(() => {
    const fetchSubTypes = async () => {
      if (selectedTypeId) {
        try {
          setIsLoading(true);
          const data = await subTypeService.getSubTypesByDocType(
            selectedTypeId
          );
          setSubTypes(data);
          setSelectedSubTypeId(null);
        } catch (error) {
          console.error("Failed to fetch subtypes:", error);
          toast.error("Failed to load subtypes");
        } finally {
          setIsLoading(false);
        }
      } else {
        setSubTypes([]);
        setSelectedSubTypeId(null);
      }
    };

    fetchSubTypes();
  }, [selectedTypeId]);

  const validateDate = (date: string, subType: SubType | null): boolean => {
    if (!subType) return true;

    const selectedDate = new Date(date);
    const startDate = new Date(subType.startDate);
    const endDate = new Date(subType.endDate);

    return selectedDate >= startDate && selectedDate <= endDate;
  };

  const handleDocDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const dateStr = newDate.toISOString().split("T")[0];
      setDocDate(dateStr);

      const selectedSubType = subTypes.find(
        (st) => st.id === selectedSubTypeId
      );
      if (selectedSubType && !validateDate(dateStr, selectedSubType)) {
        setDateError(
          `Date must be between ${new Date(
            selectedSubType.startDate
          ).toLocaleDateString()} and ${new Date(
            selectedSubType.endDate
          ).toLocaleDateString()}`
        );
      } else {
        setDateError(null);
      }
    }
  };

  const handleTypeChange = (value: string) => {
    const typeId = Number(value);
    setSelectedTypeId(typeId);
    setSelectedSubTypeId(null);
    setDateError(null);
  };

  const handleSubTypeChange = (value: string) => {
    const subTypeId = Number(value);
    setSelectedSubTypeId(subTypeId);

    const selectedSubType = subTypes.find((st) => st.id === subTypeId);
    if (selectedSubType && !validateDate(docDate, selectedSubType)) {
      setDateError(
        `Date must be between ${new Date(
          selectedSubType.startDate
        ).toLocaleDateString()} and ${new Date(
          selectedSubType.endDate
        ).toLocaleDateString()}`
      );
    } else {
      setDateError(null);
    }
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!selectedTypeId) {
          toast.error("Please select a document type");
          return false;
        }
        if (subTypes.length > 0 && !selectedSubTypeId) {
          toast.error("Please select a subtype");
          return false;
        }
        return true;
      case 2:
        if (!title.trim()) {
          toast.error("Please enter a document title");
          return false;
        }
        return true;
      case 3:
        if (!docDate) {
          toast.error("Please select a document date");
          return false;
        }
        if (dateError) {
          toast.error(dateError);
          return false;
        }
        return true;
      case 4:
        if (!content.trim()) {
          toast.error("Please enter document content");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    if (!selectedTypeId) {
      toast.error("Document type is required");
      setStep(1);
      return;
    }

    try {
      setIsSubmitting(true);
      const documentData = {
        title,
        content,
        typeId: selectedTypeId,
        documentAlias,
        docDate,
        subTypeId: selectedSubTypeId,
      };

      const createdDocument = await documentService.createDocument(
        documentData
      );
      toast.success("Document created successfully");
      navigate(`/documents/${createdDocument.id}`);
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to create document");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <TypeSelectionStep
            documentTypes={documentTypes}
            subTypes={subTypes}
            selectedTypeId={selectedTypeId}
            selectedSubTypeId={selectedSubTypeId}
            documentAlias={documentAlias}
            onTypeChange={handleTypeChange}
            onSubTypeChange={handleSubTypeChange}
            onAliasChange={setDocumentAlias}
          />
        );
      case 2:
        return <TitleStep title={title} onTitleChange={setTitle} />;
      case 3:
        return (
          <DateSelectionStep
            docDate={docDate}
            dateError={dateError}
            onDateChange={handleDocDateChange}
          />
        );
      case 4:
        return <ContentStep content={content} onContentChange={setContent} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    return steps[step - 1]?.title || "Create Document";
  };

  const getStepDescription = () => {
    return steps[step - 1]?.description || "";
  };

  const isLastStep = step === TOTAL_STEPS;
  const isFirstStep = step === 1;

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      }
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-blue-100">
                Create Document
              </h1>
              <p className="text-sm text-blue-300">
                Create a new document with specific type and content
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/documents")}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex justify-between mb-3">
            {steps.map((s, idx) => (
              <div
                key={s.id}
                className={`flex flex-col items-center ${
                  idx < step
                    ? "text-blue-400"
                    : idx === step - 1
                    ? "text-blue-400"
                    : "text-gray-500"
                }`}
                style={{ width: `${100 / steps.length}%` }}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${
                    idx < step - 1
                      ? "bg-blue-600 text-white"
                      : idx === step - 1
                      ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                      : "bg-blue-900/30 border border-blue-900/50"
                  }`}
                >
                  {idx < step - 1 ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    steps[idx].icon
                  )}
                </div>
                <div className="text-xs text-center hidden md:block">
                  {s.title}
                </div>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-blue-900/30 rounded-full overflow-hidden">
            <MotionDiv
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((step - 1) / (steps.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-center mt-2 text-sm text-blue-200">
            {getStepDescription()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <MotionDiv
            key={`step-${step}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="mb-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-4 text-blue-400">Loading...</p>
                </div>
              ) : (
                renderStepContent()
              )}
            </div>
          </MotionDiv>

          <div className="flex justify-between pt-4 mt-4 border-t border-blue-900/30">
            {isFirstStep ? (
              <Button
                type="button"
                onClick={() => navigate("/documents")}
                variant="outline"
                className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200"
              >
                Cancel
              </Button>
            ) : (
              <Button
                type="button"
                onClick={prevStep}
                variant="outline"
                className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            {isLastStep ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Create Document
                    <Check className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
