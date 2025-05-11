import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import documentService from "@/services/documentService";
import subTypeService from "@/services/subTypeService";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import { StepIndicator } from "@/components/create-document/steps/StepIndicator";
import { TypeSelectionStep } from "@/components/create-document/steps/TypeSelectionStep";
import { TitleStep } from "@/components/create-document/steps/TitleStep";
import { DateSelectionStep } from "@/components/create-document/steps/DateSelectionStep";
import { ContentStep } from "@/components/create-document/steps/ContentStep";
import { ReviewStep } from "@/components/create-document/steps/ReviewStep";
import { StepNavigation } from "@/components/create-document/StepNavigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: () => void;
}

export const CreateDocumentModal = ({
  isOpen,
  onClose,
  onDocumentCreated,
}: CreateDocumentModalProps) => {
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

  // Reset the form when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedTypeId(null);
      setSelectedSubTypeId(null);
      setTitle("");
      setDocumentAlias("");
      setDocDate(new Date().toISOString().split("T")[0]);
      setContent("");
      setDateError(null);
    }
  }, [isOpen]);

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

    if (isOpen) {
      fetchDocumentTypes();
    }
  }, [isOpen]);

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

  // Update date validation when subtype changes
  useEffect(() => {
    if (selectedSubTypeId && docDate) {
      const selectedSubType = subTypes.find(
        (st) => st.id === selectedSubTypeId
      );
      if (selectedSubType) {
        const subTypeStartDate = new Date(selectedSubType.startDate);
        const subTypeEndDate = new Date(selectedSubType.endDate);
        const selectedDate = new Date(docDate);

        // Reset time components for accurate date comparison
        subTypeStartDate.setHours(0, 0, 0, 0);
        subTypeEndDate.setHours(0, 0, 0, 0);
        selectedDate.setHours(0, 0, 0, 0);

        if (selectedDate < subTypeStartDate || selectedDate > subTypeEndDate) {
          setDateError(
            `Date must be within the subtype date range (${subTypeStartDate.toLocaleDateString()} - ${subTypeEndDate.toLocaleDateString()})`
          );

          // Try to set a default date within the range
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (today >= subTypeStartDate && today <= subTypeEndDate) {
            // If today is in range, use it
            setDocDate(today.toISOString().split("T")[0]);
            setDateError(null);
          } else if (today < subTypeStartDate) {
            // If today is before range, use start date
            setDocDate(subTypeStartDate.toISOString().split("T")[0]);
            setDateError(null);
          } else {
            // If today is after range, use end date
            setDocDate(subTypeEndDate.toISOString().split("T")[0]);
            setDateError(null);
          }
        } else {
          setDateError(null);
        }
      }
    }
  }, [selectedSubTypeId, subTypes]);

  const handleTypeChange = (typeId: number) => {
    setSelectedTypeId(typeId);
    setSelectedSubTypeId(null);
  };

  const handleSubTypeChange = (subTypeId: number) => {
    setSelectedSubTypeId(subTypeId);
  };

  const handleDocDateChange = (date: Date | undefined) => {
    if (date) {
      setDocDate(date.toISOString().split("T")[0]);

      // Validate against selected subtype date range
      if (selectedSubTypeId) {
        const selectedSubType = subTypes.find(
          (st) => st.id === selectedSubTypeId
        );
        if (selectedSubType) {
          const subTypeStartDate = new Date(selectedSubType.startDate);
          const subTypeEndDate = new Date(selectedSubType.endDate);
          const selectedDate = new Date(date);

          // Reset time components for accurate date comparison
          subTypeStartDate.setHours(0, 0, 0, 0);
          subTypeEndDate.setHours(0, 0, 0, 0);
          selectedDate.setHours(0, 0, 0, 0);

          if (
            selectedDate < subTypeStartDate ||
            selectedDate > subTypeEndDate
          ) {
            setDateError(
              `Date must be within the subtype date range (${subTypeStartDate.toLocaleDateString()} - ${subTypeEndDate.toLocaleDateString()})`
            );
          } else {
            setDateError(null);
          }
        }
      } else {
        setDateError(null);
      }
    } else {
      // If date is undefined or invalid, set an error
      setDateError("Please enter a valid date");
    }
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!selectedTypeId) {
          toast.error("Please select a document type");
          return false;
        }
        if (subTypes.length === 0) {
          toast.error(
            "The selected document type has no subtypes. Please add subtypes first."
          );
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
        // Add extra validation to check against subtype date range
        if (selectedSubTypeId) {
          const selectedSubType = subTypes.find(
            (st) => st.id === selectedSubTypeId
          );
          if (selectedSubType) {
            const subTypeStartDate = new Date(selectedSubType.startDate);
            const subTypeEndDate = new Date(selectedSubType.endDate);
            const selectedDate = new Date(docDate);

            // Reset time components for accurate date comparison
            subTypeStartDate.setHours(0, 0, 0, 0);
            subTypeEndDate.setHours(0, 0, 0, 0);
            selectedDate.setHours(0, 0, 0, 0);

            if (
              selectedDate < subTypeStartDate ||
              selectedDate > subTypeEndDate
            ) {
              toast.error(
                `Date must be within the subtype date range (${subTypeStartDate.toLocaleDateString()} - ${subTypeEndDate.toLocaleDateString()})`
              );
              return false;
            }
          }
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
      onDocumentCreated();
      onClose();
      // Redirect to the document view page
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
            onTypeChange={(value: string) => handleTypeChange(Number(value))}
            onSubTypeChange={(value: string) =>
              handleSubTypeChange(Number(value))
            }
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
            selectedSubType={
              selectedSubTypeId
                ? subTypes.find((st) => st.id === selectedSubTypeId)
                : null
            }
          />
        );
      case 4:
        return <ContentStep content={content} onContentChange={setContent} />;
      case 5:
        return (
          <ReviewStep
            selectedType={documentTypes.find((t) => t.id === selectedTypeId)}
            selectedSubType={subTypes.find((st) => st.id === selectedSubTypeId)}
            documentAlias={documentAlias}
            title={title}
            docDate={docDate}
            content={content}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl bg-[#0d1117] border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span className="text-white">Create Document</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <StepIndicator currentStep={step} />

          <div className="border-b border-gray-800 pb-4">
            <h2 className="text-xl font-semibold text-center text-white">
              {step === 1 && "Select Document Type"}
              {step === 2 && "Document Title"}
              {step === 3 && "Document Date"}
              {step === 4 && "Document Content"}
              {step === 5 && "Review Document"}
            </h2>
          </div>

          <div className="space-y-6">
            {renderStepContent()}
            <StepNavigation
              step={step}
              isSubmitting={isSubmitting}
              onPrevStep={() => setStep((prev) => prev - 1)}
              onNextStep={() => {
                if (validateCurrentStep()) {
                  setStep((prev) => prev + 1);
                }
              }}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
