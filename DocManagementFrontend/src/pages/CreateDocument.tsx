import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import documentService from '@/services/documentService';
import subTypeService from '@/services/subTypeService';
import { DocumentType } from '@/models/document';
import { SubType } from '@/models/subtype';
import { StepIndicator } from '@/components/create-document/steps/StepIndicator';
import { TypeSelectionStep } from '@/components/create-document/steps/TypeSelectionStep';
import { TitleStep } from '@/components/create-document/steps/TitleStep';
import { DateSelectionStep } from '@/components/create-document/steps/DateSelectionStep';
import { ContentStep } from '@/components/create-document/steps/ContentStep';
import { ReviewStep } from '@/components/create-document/steps/ReviewStep';
import { StepNavigation } from '@/components/create-document/StepNavigation';

export default function CreateDocument() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [subTypes, setSubTypes] = useState<SubType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [documentAlias, setDocumentAlias] = useState('');
  const [docDate, setDocDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setIsLoading(true);
        const types = await documentService.getAllDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error('Failed to fetch document types:', error);
        toast.error('Failed to load document types');
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
          const data = await subTypeService.getSubTypesByDocType(selectedTypeId);
          setSubTypes(data);
          setSelectedSubTypeId(null);
        } catch (error) {
          console.error('Failed to fetch subtypes:', error);
          toast.error('Failed to load subtypes');
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
      const dateStr = newDate.toISOString().split('T')[0];
      setDocDate(dateStr);

      const selectedSubType = subTypes.find(st => st.id === selectedSubTypeId);
      if (selectedSubType && !validateDate(dateStr, selectedSubType)) {
        setDateError(`Date must be between ${new Date(selectedSubType.startDate).toLocaleDateString()} and ${new Date(selectedSubType.endDate).toLocaleDateString()}`);
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
    
    const selectedSubType = subTypes.find(st => st.id === subTypeId);
    if (selectedSubType && !validateDate(docDate, selectedSubType)) {
      setDateError(`Date must be between ${new Date(selectedSubType.startDate).toLocaleDateString()} and ${new Date(selectedSubType.endDate).toLocaleDateString()}`);
    } else {
      setDateError(null);
    }
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        if (!selectedTypeId) {
          toast.error('Please select a document type');
          return false;
        }
        if (subTypes.length > 0 && !selectedSubTypeId) {
          toast.error('Please select a subtype');
          return false;
        }
        return true;
      case 2:
        if (!title.trim()) {
          toast.error('Please enter a document title');
          return false;
        }
        return true;
      case 3:
        if (!docDate) {
          toast.error('Please select a document date');
          return false;
        }
        if (dateError) {
          toast.error(dateError);
          return false;
        }
        return true;
      case 4:
        if (!content.trim()) {
          toast.error('Please enter document content');
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
      toast.error('Document type is required');
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
        subTypeId: selectedSubTypeId
      };

      const createdDocument = await documentService.createDocument(documentData);
      toast.success('Document created successfully');
      navigate(`/documents/${createdDocument.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
      toast.error('Failed to create document');
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
        return (
          <TitleStep
            title={title}
            onTitleChange={setTitle}
          />
        );
      case 3:
        return (
          <DateSelectionStep
            docDate={docDate}
            dateError={dateError}
            onDateChange={handleDocDateChange}
          />
        );
      case 4:
        return (
          <ContentStep
            content={content}
            onContentChange={setContent}
          />
        );
      case 5:
        return (
          <ReviewStep
            selectedType={documentTypes.find(t => t.id === selectedTypeId)}
            selectedSubType={subTypes.find(st => st.id === selectedSubTypeId)}
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
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-6 w-6 text-blue-500" />
          <h1 className="text-3xl font-semibold text-white">Create Document</h1>
        </div>
        <p className="text-gray-400">Create a new document in simple steps</p>
      </div>

      <Card className="w-full max-w-3xl mx-auto border-gray-800 bg-[#0d1117]">
        <div className="p-6 space-y-6">
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
              onPrevStep={() => setStep(prev => prev - 1)}
              onNextStep={() => {
                if (validateCurrentStep()) {
                  setStep(prev => prev + 1);
                }
              }}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/documents')}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
