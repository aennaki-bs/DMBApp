import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    FileText,
    Calendar,
    Layers,
    Save,
    CheckCircle,
    Share2,
    Building2,
    Users,
    MapPin,
} from "lucide-react";
import { DocumentType } from "@/models/document";
import { SubType } from "@/models/subtype";
import documentService from "@/services/documentService";
import subTypeService from "@/services/subTypeService";
import documentTypeService from "@/services/documentTypeService";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import circuitService from "@/services/circuitService";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

// Import enhanced components
import EnhancedWizardLayout from "@/components/shared/EnhancedWizardLayout";
import { Step } from "@/components/shared/EnhancedStepIndicator";
import {
    EnhancedInput,
    EnhancedTextarea,
    EnhancedSelect,
} from "@/components/shared/EnhancedFormFields";

// Import step components (we'll enhance these too)
import { ResponsibilityCentreStepEnhanced } from "./steps/ResponsibilityCentreStepEnhanced";
import { DateSelectionStepEnhanced } from "./steps/DateSelectionStepEnhanced";
import { TypeSelectionStepEnhanced } from "./steps/TypeSelectionStepEnhanced";
import { CustomerVendorStepEnhanced } from "./steps/CustomerVendorStepEnhanced";
import { ContentStepEnhanced } from "./steps/ContentStepEnhanced";
import { CircuitStepEnhanced } from "./steps/CircuitStepEnhanced";
import { ReviewStepEnhanced } from "./steps/ReviewStepEnhanced";

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
    isExternal: boolean;
    externalReference: string;
    responsibilityCentreId: number | null;
    selectedCustomerVendor: any | null;
    customerVendorName: string;
    customerVendorAddress: string;
    customerVendorCity: string;
    customerVendorCountry: string;
}

interface CreateDocumentWizardEnhancedProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function CreateDocumentWizardEnhanced({
    open,
    onOpenChange,
    onSuccess,
}: CreateDocumentWizardEnhancedProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useTranslation();

    // Check if user has a responsibility centre
    const userHasResponsibilityCentre =
        user?.responsibilityCentre?.id !== undefined || user?.responsibilityCenter?.id !== undefined;

    // Get user's responsibility centre ID
    const getUserResponsibilityCentreId = () => {
        return user?.responsibilityCentre?.id || user?.responsibilityCenter?.id || null;
    };

    // State management
    const [currentStep, setCurrentStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
        isExternal: false,
        externalReference: "",
        responsibilityCentreId: getUserResponsibilityCentreId(),
        selectedCustomerVendor: null,
        customerVendorName: "",
        customerVendorAddress: "",
        customerVendorCity: "",
        customerVendorCountry: "",
    });

    // Data states
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [subTypes, setSubTypes] = useState<SubType[]>([]);
    const [circuits, setCircuits] = useState<any[]>([]);
    const [responsibilityCentres, setResponsibilityCentres] = useState<ResponsibilityCentreSimple[]>([]);

    // Validation states
    const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
    const [globalError, setGlobalError] = useState<string>("");

    // Define steps with enhanced design
    const steps: Step[] = [
        {
            id: 1,
            title: t("documents.responsibilityCentre"),
            description: userHasResponsibilityCentre
                ? t("documents.documentWillBeAssignedToYourCentre")
                : t("documents.selectResponsibilityCentreForDocument"),
            icon: <Building2 className="h-4 w-4" />,
            required: true,
            completed: currentStep > 1,
        },
        {
            id: 2,
            title: t("documents.documentDate"),
            description: t("documents.selectDocumentDate"),
            icon: <Calendar className="h-4 w-4" />,
            required: true,
            completed: currentStep > 2,
        },
        {
            id: 3,
            title: t("common.type"),
            description: t("documents.selectTypeAndSeries"),
            icon: <Layers className="h-4 w-4" />,
            required: true,
            completed: currentStep > 3,
        },
        {
            id: 4,
            title: t("documents.customerVendor"),
            description: t("documents.selectCustomerOrVendor"),
            icon: <Users className="h-4 w-4" />,
            required: false,
            completed: currentStep > 4,
        },
        {
            id: 5,
            title: t("documents.content"),
            description: t("documents.addDocumentContent"),
            icon: <FileText className="h-4 w-4" />,
            required: true,
            completed: currentStep > 5,
        },
        {
            id: 6,
            title: t("documents.circuitOptional"),
            description: t("documents.assignToWorkflowOrSkip"),
            icon: <Share2 className="h-4 w-4" />,
            required: false,
            completed: currentStep > 6,
        },
        {
            id: 7,
            title: t("documents.review"),
            description: t("documents.confirmDocumentDetails"),
            icon: <CheckCircle className="h-4 w-4" />,
            required: false,
            completed: false,
        },
    ];

    // Reset wizard when dialog opens/closes
    useEffect(() => {
        if (open) {
            setCurrentStep(1);
            setDirection(0);
            setIsSubmitting(false);
            setStepErrors({});
            setGlobalError("");
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
                isExternal: false,
                externalReference: "",
                responsibilityCentreId: getUserResponsibilityCentreId(),
                selectedCustomerVendor: null,
                customerVendorName: "",
                customerVendorAddress: "",
                customerVendorCity: "",
                customerVendorCountry: "",
            });

            // Fetch initial data
            fetchDocumentTypes();
            fetchCircuits();
            if (!userHasResponsibilityCentre) {
                fetchResponsibilityCentres();
            }
        }
    }, [open]);

    // Data fetching functions
    const fetchDocumentTypes = async () => {
        try {
            setIsLoading(true);
            const types = await documentTypeService.getAllDocumentTypes();
            setDocumentTypes(types || []);
        } catch (error) {
            console.error("Failed to fetch document types:", error);
            toast.error("Failed to load document types");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCircuits = async () => {
        try {
            const allCircuits = await circuitService.getAllCircuits();
            const activeCircuits = allCircuits
                .filter((circuit) => circuit.isActive)
                .map((circuit) => ({
                    id: circuit.id,
                    name: circuit.title,
                    code: circuit.circuitKey,
                    description: circuit.descriptif || circuit.title,
                    isActive: circuit.isActive,
                    documentTypeId: circuit.documentTypeId,
                    documentType: circuit.documentType,
                }));
            setCircuits(activeCircuits);
        } catch (error) {
            console.error("Failed to fetch circuits:", error);
            toast.error("Failed to load circuits");
            setCircuits([]);
        }
    };

    const fetchResponsibilityCentres = async () => {
        try {
            const centres = await responsibilityCentreService.getAll();
            setResponsibilityCentres(centres || []);
        } catch (error) {
            console.error("Failed to fetch responsibility centres:", error);
            toast.error("Failed to load responsibility centres");
        }
    };

    const fetchSubTypesForDate = async (typeId: number, date: string) => {
        try {
            setIsLoading(true);
            const dateObj = new Date(date);
            const subtypes = await subTypeService.getSubTypesForDate(typeId, dateObj);
            setSubTypes(subtypes || []);

            if (!subtypes || subtypes.length === 0) {
                const typeName = documentTypes.find((t) => t.id === typeId)?.typeName || "selected type";
                toast.warning(`No valid subtypes available`, {
                    description: `There are no subtypes available for "${typeName}" on ${new Date(date).toLocaleDateString()}.`,
                });
            }
        } catch (error) {
            console.error("Failed to fetch subtypes:", error);
            toast.error("Failed to load subtypes");
            setSubTypes([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Validation functions
    const validateStep = (stepId: number): boolean => {
        const errors: Record<number, string> = { ...stepErrors };
        delete errors[stepId]; // Clear previous error for this step

        switch (stepId) {
            case 1: // Responsibility Centre
                if (!formData.responsibilityCentreId) {
                    errors[stepId] = t("documents.responsibilityCentreRequired");
                    setStepErrors(errors);
                    return false;
                }
                break;

            case 2: // Document Date
                if (!formData.docDate) {
                    errors[stepId] = "Document date is required";
                    setStepErrors(errors);
                    return false;
                }
                break;

            case 3: // Document Type & Subtype
                if (!formData.selectedTypeId) {
                    errors[stepId] = "Document type is required";
                    setStepErrors(errors);
                    return false;
                }
                if (!formData.selectedSubTypeId) {
                    errors[stepId] = "Document series is required";
                    setStepErrors(errors);
                    return false;
                }
                break;

            case 5: // Content
                if (!formData.content.trim() && !formData.isExternal) {
                    errors[stepId] = t("documents.documentContentRequired");
                    setStepErrors(errors);
                    return false;
                }
                if (formData.isExternal && !formData.externalReference.trim()) {
                    errors[stepId] = "External document reference is required";
                    setStepErrors(errors);
                    return false;
                }
                break;
        }

        setStepErrors(errors);
        return true;
    };

    const canGoNext = (): boolean => {
        return validateStep(currentStep);
    };

    const canGoPrevious = (): boolean => {
        return currentStep > 1;
    };

    // Navigation functions
    const handleNext = () => {
        if (canGoNext()) {
            setDirection(1);
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (canGoPrevious()) {
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepId: number) => {
        if (stepId < currentStep || stepId === currentStep) {
            const newDirection = stepId > currentStep ? 1 : -1;
            setDirection(newDirection);
            setCurrentStep(stepId);
        }
    };

    // Form data update functions
    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    // Handle type change - fetch subtypes when type changes
    const handleTypeChange = async (typeId: number) => {
        updateFormData({
            selectedTypeId: typeId,
            selectedSubTypeId: null
        });

        if (typeId && formData.docDate) {
            await fetchSubTypesForDate(typeId, formData.docDate);
        }
    };

    // Handle date change - refetch subtypes if type is selected
    const handleDateChange = async (date: string) => {
        updateFormData({ docDate: date });

        if (formData.selectedTypeId && date) {
            await fetchSubTypesForDate(formData.selectedTypeId, date);
        }
    };

    // Submit function
    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedType = documentTypes.find(t => t.id === formData.selectedTypeId);
            const selectedSubType = subTypes.find(st => st.id === formData.selectedSubTypeId);

            const createRequest = {
                docDate: formData.docDate,
                comptableDate: formData.comptableDate,
                documentTypeId: formData.selectedTypeId!,
                subTypeId: formData.selectedSubTypeId!,
                title: formData.title || `${selectedType?.typeName} - ${selectedSubType?.name}`,
                documentAlias: formData.documentAlias,
                content: formData.isExternal ? formData.externalReference : formData.content,
                responsibilityCentreId: formData.responsibilityCentreId!,
                circuitId: formData.circuitId,
                isExternal: formData.isExternal,
                customerVendorData: formData.selectedCustomerVendor ? {
                    name: formData.customerVendorName,
                    address: formData.customerVendorAddress,
                    city: formData.customerVendorCity,
                    country: formData.customerVendorCountry,
                } : null,
            };

            await documentService.createDocument(createRequest);
            toast.success("Document created successfully!");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to create document:", error);
            setGlobalError("Failed to create document. Please try again.");
            toast.error("Failed to create document");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <ResponsibilityCentreStepEnhanced
                        selectedCentreId={formData.responsibilityCentreId}
                        availableCentres={responsibilityCentres}
                        userHasAssignedCentre={userHasResponsibilityCentre}
                        onCentreSelect={(centreId) => updateFormData({ responsibilityCentreId: centreId })}
                        isLoading={isLoading}
                    />
                );

            case 2:
                return (
                    <DateSelectionStepEnhanced
                        docDate={formData.docDate}
                        comptableDate={formData.comptableDate}
                        onDateChange={handleDateChange}
                        onComptableDateChange={(date) => updateFormData({ comptableDate: date })}
                        selectedSubType={subTypes.find(st => st.id === formData.selectedSubTypeId)}
                    />
                );

            case 3:
                return (
                    <TypeSelectionStepEnhanced
                        documentTypes={documentTypes}
                        subTypes={subTypes}
                        selectedTypeId={formData.selectedTypeId}
                        selectedSubTypeId={formData.selectedSubTypeId}
                        onTypeChange={handleTypeChange}
                        onSubTypeChange={(subTypeId) => updateFormData({ selectedSubTypeId: subTypeId })}
                        documentDate={formData.docDate}
                        isLoading={isLoading}
                        onJumpToDateStep={() => handleStepClick(2)}
                    />
                );

            case 4:
                return (
                    <CustomerVendorStepEnhanced
                        selectedTypeId={formData.selectedTypeId}
                        documentTypes={documentTypes}
                        selectedCustomerVendor={formData.selectedCustomerVendor}
                        customerVendorName={formData.customerVendorName}
                        customerVendorAddress={formData.customerVendorAddress}
                        customerVendorCity={formData.customerVendorCity}
                        customerVendorCountry={formData.customerVendorCountry}
                        onCustomerVendorSelect={(cv) => updateFormData({ selectedCustomerVendor: cv })}
                        onNameChange={(name) => updateFormData({ customerVendorName: name })}
                        onAddressChange={(address) => updateFormData({ customerVendorAddress: address })}
                        onCityChange={(city) => updateFormData({ customerVendorCity: city })}
                        onCountryChange={(country) => updateFormData({ customerVendorCountry: country })}
                    />
                );

            case 5:
                return (
                    <ContentStepEnhanced
                        content={formData.content}
                        isExternal={formData.isExternal}
                        externalReference={formData.externalReference}
                        onContentChange={(content) => updateFormData({ content })}
                        onExternalChange={(isExternal) => updateFormData({ isExternal })}
                        onExternalReferenceChange={(ref) => updateFormData({ externalReference: ref })}
                    />
                );

            case 6:
                return (
                    <CircuitStepEnhanced
                        circuits={circuits.filter(circuit => {
                            if (!circuit.isActive) return false;
                            if (formData.selectedTypeId && circuit.documentTypeId) {
                                return circuit.documentTypeId === formData.selectedTypeId;
                            }
                            return !circuit.documentTypeId;
                        })}
                        selectedCircuitId={formData.circuitId}
                        onCircuitChange={(circuitId, circuitName) =>
                            updateFormData({ circuitId, circuitName: circuitName || "" })
                        }
                        isLoading={isLoading}
                    />
                );

            case 7:
                return (
                    <ReviewStepEnhanced
                        formData={formData}
                        selectedType={documentTypes.find(t => t.id === formData.selectedTypeId)}
                        selectedSubType={subTypes.find(st => st.id === formData.selectedSubTypeId)}
                        selectedCircuit={circuits.find(c => c.id === formData.circuitId)}
                        responsibilityCentres={responsibilityCentres}
                        userHasAssignedCentre={userHasResponsibilityCentre}
                        onEditStep={handleStepClick}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <EnhancedWizardLayout
            open={open}
            onOpenChange={onOpenChange}
            title="Create Document"
            description="Create a new document with all necessary details and workflow assignments"
            icon={<FileText className="h-5 w-5" />}
            steps={steps}
            currentStep={currentStep}
            onStepChange={handleStepClick}
            allowStepNavigation={true}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={() => onOpenChange(false)}
            onSubmit={handleSubmit}
            nextLabel={t("common.next")}
            previousLabel={t("common.back")}
            cancelLabel={t("common.cancel")}
            submitLabel={t("documents.createDocument")}
            isSubmitting={isSubmitting}
            canGoNext={canGoNext()}
            canGoPrevious={canGoPrevious()}
            stepErrors={stepErrors}
            globalError={globalError}
            maxWidth="lg"
            showStepPreview={true}
            stepIndicatorVariant="horizontal"
            aria-label="Document creation wizard"
        >
            {renderStepContent()}
        </EnhancedWizardLayout>
    );
} 