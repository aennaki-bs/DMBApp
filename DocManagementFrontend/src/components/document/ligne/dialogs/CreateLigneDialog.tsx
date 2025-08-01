import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Ban,
  Check,
  ArrowRight,
  ArrowLeft,
  Package,
  Calculator,
  Percent,
  DollarSign,
  Hash,
  Loader2,
  CheckCircle,
  XCircle,
  Layers,
  Edit,
  Search,
  ChevronDown,
} from "lucide-react";
import { Document, CreateLigneRequest, Ligne } from "@/models/document";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import lineElementsService from "@/services/lineElementsService";
import locationService from "@/services/locationService";
import {
  LignesElementTypeSimple,
  ItemSimple,
  GeneralAccountsSimple,
  ItemUnitOfMeasure,
  Item,
} from "@/models/lineElements";
import { LocationSimpleDto } from "@/models/location";
import { calculateLigneAmounts, formatPrice as formatPriceUtil, formatPercentage as formatPercentageUtil } from "@/utils/ligneCalculations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, motion } from "framer-motion";

interface CreateLigneDialogProps {
  document: Document;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3 | 4;

interface FormValues {
  ligneKey: string;
  code: string;
  article: string;
  lignesElementTypeId?: number;
  selectedElementCode?: string;
  locationCode?: string;
  unitCode?: string;
  quantity: number;
  priceHT: number;
  discountPercentage: number;
  discountAmount?: number;
  vatPercentage: number;
  useFixedDiscount: boolean;
}

interface CodeValidation {
  isValidating: boolean;
  isValid: boolean | null;
  message: string;
}

const CreateLigneDialog = ({
  document,
  isOpen,
  onOpenChange,
}: CreateLigneDialogProps) => {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    ligneKey: "",
    code: "",
    article: "",
    quantity: 1,
    priceHT: 0,
    discountPercentage: 0,
    vatPercentage: 0.2, // Default 20% VAT
    useFixedDiscount: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [codeValidation, setCodeValidation] = useState<CodeValidation>({
    isValidating: false,
    isValid: null,
    message: "",
  });
  const [existingLignes, setExistingLignes] = useState<Ligne[]>([]);

  // Dropdown data
  const [elementTypes, setElementTypes] = useState<LignesElementTypeSimple[]>([]);
  const [items, setItems] = useState<ItemSimple[]>([]);
  const [generalAccounts, setGeneralAccounts] = useState<GeneralAccountsSimple[]>([]);
  const [availableElements, setAvailableElements] = useState<(ItemSimple | GeneralAccountsSimple)[]>([]);
  const [loadingElements, setLoadingElements] = useState(false);
  const [locations, setLocations] = useState<LocationSimpleDto[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [itemUnits, setItemUnits] = useState<ItemUnitOfMeasure[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = useState<Item | null>(null);

  const queryClient = useQueryClient();

  // Load dropdown data and existing lignes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesData, lignesData, locationsData] = await Promise.all([
          lineElementsService.elementTypes.getSimple(),
          documentService.getLignesByDocumentId(document.id),
          locationService.getSimple()
        ]);
        
        setElementTypes(typesData);
        setExistingLignes(lignesData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Failed to load form data:", error);
        toast.error("Failed to load form data");
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen, document.id]);

  // Load elements dynamically based on selected element type
  useEffect(() => {
    const loadElements = async () => {
      if (!formValues.lignesElementTypeId) {
        setAvailableElements([]);
        return;
      }

      const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
      if (!selectedType) return;

      setLoadingElements(true);
      try {
        if (selectedType.typeElement === 'Item') {
          const itemsData = await lineElementsService.items.getSimple();
          setItems(itemsData);
          setAvailableElements(itemsData);
        } else if (selectedType.typeElement === 'GeneralAccounts') {
          const accountsData = await lineElementsService.generalAccounts.getSimple();
          setGeneralAccounts(accountsData);
          setAvailableElements(accountsData);
        }
      } catch (error) {
        console.error("Failed to load elements:", error);
        toast.error("Failed to load available elements");
      } finally {
        setLoadingElements(false);
      }
    };

    loadElements();
  }, [formValues.lignesElementTypeId, elementTypes]);

  // Ensure element data is available for review step
  useEffect(() => {
    const ensureElementDataForReview = async () => {
      if (step === 4 && formValues.lignesElementTypeId && availableElements.length === 0) {
        const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
        if (!selectedType) return;

        try {
          if (selectedType.typeElement === 'Item') {
            const itemsData = await lineElementsService.items.getSimple();
            setItems(itemsData);
            setAvailableElements(itemsData);
          } else if (selectedType.typeElement === 'GeneralAccounts') {
            const accountsData = await lineElementsService.generalAccounts.getSimple();
            setGeneralAccounts(accountsData);
            setAvailableElements(accountsData);
          }
        } catch (error) {
          console.error("Failed to reload elements for review:", error);
        }
      }
    };

    ensureElementDataForReview();
  }, [step, formValues.lignesElementTypeId, elementTypes, availableElements.length]);

  // Fetch item units when item is selected
  useEffect(() => {
    const fetchItemUnits = async () => {
      if (!formValues.selectedElementCode) {
        setItemUnits([]);
        setSelectedItemDetails(null);
        setFormValues(prev => ({ ...prev, unitCode: undefined }));
        return;
      }

      const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
      if (selectedType?.typeElement !== 'Item') {
        setItemUnits([]);
        setSelectedItemDetails(null);
        setFormValues(prev => ({ ...prev, unitCode: undefined }));
        return;
      }

      setLoadingUnits(true);
      try {
        // First get the item details to find the default unit
        const [units, itemDetails] = await Promise.all([
          lineElementsService.items.getItemUnits(formValues.selectedElementCode),
          lineElementsService.items.getByCode(formValues.selectedElementCode)
        ]);
        
        setItemUnits(units);
        setSelectedItemDetails(itemDetails);
        
        if (units.length === 1) {
          // Auto-select unit if only one exists
          setFormValues(prev => ({ ...prev, unitCode: units[0].unitOfMeasureCode }));
        } else if (units.length > 1) {
          // Multiple units - pre-select the default unit from Item table
          const defaultUnitCode = itemDetails.unite;
          const defaultUnit = defaultUnitCode 
            ? units.find(unit => unit.unitOfMeasureCode === defaultUnitCode)
            : units[0]; // Fallback to first unit if no default found
          
          setFormValues(prev => ({ ...prev, unitCode: defaultUnit?.unitOfMeasureCode || units[0].unitOfMeasureCode }));
        } else {
          // No units available for this item
          setFormValues(prev => ({ ...prev, unitCode: undefined }));
        }
      } catch (error) {
        console.error("Failed to fetch item units:", error);
        setItemUnits([]);
        setSelectedItemDetails(null);
        setFormValues(prev => ({ ...prev, unitCode: undefined }));
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchItemUnits();
  }, [formValues.selectedElementCode, formValues.lignesElementTypeId, elementTypes]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen && document) {
      setFormValues(prev => ({ 
        ...prev, 
        ligneKey: '', 
        code: '',
        lignesElementTypeId: undefined,
        selectedElementCode: undefined,
        locationCode: undefined,
        unitCode: undefined,
      }));
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: "",
      });
      setAvailableElements([]);
    }
  }, [isOpen, document]);

  // Auto-generate suggested codes when element is selected
  useEffect(() => {
    if (formValues.selectedElementCode && availableElements.length > 0) {
      const selectedElement = availableElements.find(el => el.code === formValues.selectedElementCode);
      const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
      
      if (selectedElement && selectedType) {
        // Generate suggested code based on element type and selected element
        const typePrefix = selectedType.typeElement === 'Item' ? 'ITM' : 'ACC';
        let baseSuggestedCode = `${typePrefix}_${selectedElement.code}`;
        
        // Ensure uniqueness by checking against existing lignes
        let suggestedCode = baseSuggestedCode;
        let suffix = 1;
        
        // Get all existing codes in the document
        const existingCodes = new Set(existingLignes.map(ligne => 
          ligne.ligneKey?.toLowerCase() || ligne.title?.toLowerCase() || ''
        ).filter(code => code.length > 0));
        
        // If the base code is already used, add a suffix
        while (existingCodes.has(suggestedCode.toLowerCase())) {
          suggestedCode = `${baseSuggestedCode}_${suffix}`;
          suffix++;
        }
        
        // Auto-fill code and description from selected element
        console.log("Auto-generating code:", suggestedCode);
        handleFieldChange("code", suggestedCode);
        handleFieldChange("article", selectedElement.description);
      }
    }
  }, [formValues.selectedElementCode, availableElements, elementTypes, formValues.lignesElementTypeId, existingLignes]);

  // Ensure code is generated when reaching step 3 (Code & Description)
  useEffect(() => {
    if (step === 3 && formValues.selectedElementCode && availableElements.length > 0 && !formValues.code.trim()) {
      const selectedElement = availableElements.find(el => el.code === formValues.selectedElementCode);
      const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
      
      if (selectedElement && selectedType) {
        // Generate suggested code based on element type and selected element
        const typePrefix = selectedType.typeElement === 'Item' ? 'ITM' : 'ACC';
        let baseSuggestedCode = `${typePrefix}_${selectedElement.code}`;
        
        // Ensure uniqueness by checking against existing lignes
        let suggestedCode = baseSuggestedCode;
        let suffix = 1;
        
        // Get all existing codes in the document
        const existingCodes = new Set(existingLignes.map(ligne => 
          ligne.ligneKey?.toLowerCase() || ligne.title?.toLowerCase() || ''
        ).filter(code => code.length > 0));
        
        // If the base code is already used, add a suffix
        while (existingCodes.has(suggestedCode.toLowerCase())) {
          suggestedCode = `${baseSuggestedCode}_${suffix}`;
          suffix++;
        }
        
        // Auto-fill code when reaching step 3
        console.log("Re-generating code on step 3:", suggestedCode);
        handleFieldChange("code", suggestedCode);
      }
    }
  }, [step, formValues.selectedElementCode, availableElements, elementTypes, formValues.lignesElementTypeId, existingLignes, formValues.code]);

  // Validate code with debouncing (client-side validation)
  useEffect(() => {
    const validateCode = async () => {
      if (!formValues.code.trim()) {
        setCodeValidation({
          isValidating: false,
          isValid: null,
          message: "",
        });
        return;
      }

      setCodeValidation(prev => ({
        ...prev,
        isValidating: true,
      }));

      // Simulate async validation with a small delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Basic format validation
      if (formValues.code.length < 2) {
        setCodeValidation({
          isValidating: false,
          isValid: false,
          message: "Code must be at least 2 characters long",
        });
        return;
      }

      // Check for invalid characters
      if (!/^[A-Za-z0-9-_]+$/.test(formValues.code)) {
        setCodeValidation({
          isValidating: false,
          isValid: false,
          message: "Code can only contain letters, numbers, hyphens, and underscores",
        });
        return;
      }

      // Check for uniqueness against existing lignes
      const isDuplicate = existingLignes.some(ligne => 
        ligne.ligneKey?.toLowerCase() === formValues.code.toLowerCase() ||
        ligne.title?.toLowerCase() === formValues.code.toLowerCase()
      );

      if (isDuplicate) {
        setCodeValidation({
          isValidating: false,
          isValid: false,
          message: "This code is already used in this document",
        });
        return;
      }

      setCodeValidation({
        isValidating: false,
        isValid: true,
        message: "Code is available",
      });
    };

    const timeoutId = setTimeout(validateCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formValues.code, existingLignes]);

  // Calculate amounts using centralized utility
  const calculateAmounts = () => {
    return calculateLigneAmounts(
      formValues.quantity,
      formValues.priceHT,
      formValues.discountPercentage,
      formValues.discountAmount,
      formValues.vatPercentage,
      formValues.useFixedDiscount,
      formValues.unitCode,
      selectedItemDetails || undefined,
      itemUnits
    );
  };

  const resetForm = () => {
    setFormValues({
      ligneKey: "",
      code: "",
      article: "",
      lignesElementTypeId: undefined,
      selectedElementCode: undefined,
      locationCode: undefined,
      unitCode: undefined,
      quantity: 1,
      priceHT: 0,
      discountPercentage: 0,
      discountAmount: 0,
      vatPercentage: 0.2,
      useFixedDiscount: false,
    });
    setErrors({});
    setStep(1);
    setItemUnits([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Searchable select state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [isLocationSelectOpen, setIsLocationSelectOpen] = useState(false);

  // Filter available elements based on search query
  const filteredElements = availableElements.filter((element) => 
    element.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    element.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter locations based on search query
  const filteredLocations = locations.filter((location) => 
    location.locationCode.toLowerCase().includes(locationSearchQuery.toLowerCase()) ||
    location.description.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  // Reset search and dropdown state when elements change
  useEffect(() => {
    setSearchQuery("");
    setIsSelectOpen(false);
  }, [availableElements]);

  // Reset location search when locations change
  useEffect(() => {
    setLocationSearchQuery("");
    setIsLocationSelectOpen(false);
  }, [locations]);

  // Helper function to validate numeric input
  const isValidNumber = (value: string): boolean => {
    // Allow empty string, numbers, and decimal point
    return value === "" || /^[0-9]*\.?[0-9]*$/.test(value);
  };

  // Helper function to validate and parse numeric input
  const handleNumericInput = (key: keyof FormValues, value: string, isInteger = false) => {
    if (!isValidNumber(value)) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: `Please enter only numbers ${isInteger ? '' : 'and decimal point (.)'}`
      }));
      return;
    }

    let numValue: number;
    if (value === "" || value === ".") {
      numValue = 0;
    } else {
      numValue = isInteger ? parseInt(value) : parseFloat(value);
      if (isNaN(numValue)) {
        setErrors(prev => ({ 
          ...prev, 
          [key]: "Please enter a valid number"
        }));
        return;
      }
    }

    // Validate negative values for price fields
    if ((key === 'priceHT' || key === 'discountAmount') && numValue < 0) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: `${key === 'priceHT' ? 'Price' : 'Discount amount'} cannot be negative`
      }));
      return;
    }

    // Validate quantity
    if (key === 'quantity' && numValue < 0) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: "Quantity cannot be negative"
      }));
      return;
    }

    handleFieldChange(key, numValue);
  };

  // Helper function to validate percentage input
  const handlePercentageInput = (key: keyof FormValues, value: string) => {
    if (!isValidNumber(value)) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: "Please enter only numbers and decimal point (.)"
      }));
      return;
    }

    let numValue: number;
    if (value === "" || value === ".") {
      numValue = 0;
    } else {
      numValue = parseFloat(value);
      if (isNaN(numValue)) {
        setErrors(prev => ({ 
          ...prev, 
          [key]: "Please enter a valid percentage"
        }));
        return;
      }
    }

    if (numValue < 0) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: "Percentage cannot be negative"
      }));
      return;
    }

    if (numValue > 100) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: "Percentage cannot exceed 100%"
      }));
      return;
    }

    handleFieldChange(key, numValue / 100);
  };

  const handleFieldChange = (key: keyof FormValues, value: any) => {
    if (key === 'code') {
      console.log("Code field changing from:", formValues.code, "to:", value);
    }
    setFormValues(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<Record<keyof FormValues, string>> = {};

    switch (stepNumber) {
      case 1:
        if (!formValues.lignesElementTypeId) {
          newErrors.lignesElementTypeId = "Element type is required";
        }
        if (!formValues.selectedElementCode) {
          newErrors.selectedElementCode = "Element selection is required";
        }
        // Location is required only for Item types
        const selectedType = elementTypes.find(t => t.id === formValues.lignesElementTypeId);
        if (selectedType?.typeElement === 'Item' && !formValues.locationCode) {
          newErrors.locationCode = "Location is required for items";
        }
        // Unit is required only for Item types when multiple units are available
        if (selectedType?.typeElement === 'Item' && itemUnits.length > 0 && !formValues.unitCode) {
          newErrors.unitCode = "Unit of measure is required for items";
        }
        break;
      case 2:
        // Validate quantity
        if (isNaN(formValues.quantity) || formValues.quantity <= 0) {
          newErrors.quantity = "Quantity must be a valid number greater than 0";
        }

        // Validate price HT
        if (isNaN(formValues.priceHT) || formValues.priceHT <= 0) {
          newErrors.priceHT = "Price must be a valid number greater than 0";
        }
        
        // Validate discount percentage (0-100%)
        if (!formValues.useFixedDiscount) {
          if (isNaN(formValues.discountPercentage)) {
            newErrors.discountPercentage = "Discount percentage must be a valid number";
          } else {
            const discountPercent = formValues.discountPercentage * 100;
            if (discountPercent < 0 || discountPercent > 100) {
              newErrors.discountPercentage = "Discount percentage must be between 0 and 100";
            }
          }
        }
        
        // Validate discount amount (0 to unit price HT * quantity)
        if (formValues.useFixedDiscount) {
          if (formValues.discountAmount && isNaN(formValues.discountAmount)) {
            newErrors.discountAmount = "Discount amount must be a valid number";
          } else if (formValues.discountAmount && formValues.discountAmount < 0) {
            newErrors.discountAmount = "Discount amount cannot be negative";
          } else if (formValues.discountAmount && formValues.priceHT > 0 && formValues.quantity > 0) {
            const maxDiscountAmount = formValues.priceHT * formValues.quantity;
            if (formValues.discountAmount > maxDiscountAmount) {
              newErrors.discountAmount = `Discount amount cannot exceed ${maxDiscountAmount.toFixed(2)} MAD (Unit Price × Quantity)`;
            }
          }
        }
        
        // Validate VAT percentage (0-100%)
        if (isNaN(formValues.vatPercentage)) {
          newErrors.vatPercentage = "VAT percentage must be a valid number";
        } else {
          const vatPercent = formValues.vatPercentage * 100;
          if (vatPercent < 0 || vatPercent > 100) {
            newErrors.vatPercentage = "VAT percentage must be between 0 and 100";
          }
        }
        break;
      case 3:
        if (!formValues.code.trim()) {
          newErrors.code = "Code is required";
        }
        if (!formValues.article.trim()) {
          newErrors.article = "Article description is required";
        }
        if (codeValidation.isValid !== true) {
          newErrors.code = "Code validation failed";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4) as Step);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1) as Step);
  };

  const handleEditStep = (targetStep: Step) => {
    setStep(targetStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // Calculate amounts to send to backend
      const calculatedAmounts = calculateAmounts();
      
      const request: CreateLigneRequest = {
        documentId: document.id,
        ligneKey: formValues.code,
        title: formValues.article,
        article: formValues.article,
        lignesElementTypeId: formValues.lignesElementTypeId!,
        selectedElementCode: formValues.selectedElementCode,
        locationCode: formValues.locationCode,
        unitCode: formValues.unitCode,
        quantity: formValues.quantity,
        priceHT: formValues.priceHT, // Send original price (quantity is now adjusted instead)
        discountPercentage: formValues.discountPercentage,
        discountAmount: calculatedAmounts.discountAmount, // Send calculated discount amount
        vatPercentage: formValues.vatPercentage,
        originalPriceHT: formValues.priceHT, // Send original price for reference
      };

      await documentService.createLigne(request);
      await queryClient.invalidateQueries({ queryKey: ["documentLignes", document.id] });
      
      toast.success("Line created successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to create line:", error);
      toast.error("Failed to create line");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use centralized formatting functions
  const formatPrice = formatPriceUtil;
  const formatPercentage = formatPercentageUtil;

  const { amountHT, amountVAT, amountTTC, unitConversionFactor, adjustedQuantity } = calculateAmounts();

  const getSelectedElementType = () => {
    if (!formValues.lignesElementTypeId || !elementTypes.length) return null;
    return elementTypes.find(t => t.id === formValues.lignesElementTypeId);
  };

  const getSelectedElement = () => {
    if (!formValues.selectedElementCode || !availableElements.length) return null;
    return availableElements.find(el => el.code === formValues.selectedElementCode);
  };

  // Keep a reference to selected element and type for the review
  const selectedElementType = getSelectedElementType();
  const selectedElement = getSelectedElement();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1e3a8a]/50 to-[#0f172a]/50 border-b border-blue-500/20 py-5 px-6">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="bg-blue-500/20 p-1.5 rounded-lg">
              <Plus className="h-5 w-5 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-semibold text-white m-0 p-0">
              Add New Line
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-200 m-0 pl-10">
            Create a new line item for document: {document.documentKey}
          </DialogDescription>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-4 border-b border-blue-500/20">
          <div className="flex items-center justify-between overflow-x-auto">
            {[
              { number: 1, title: "Element Type", icon: Layers },
              { number: 2, title: "Pricing", icon: Calculator },
              { number: 3, title: "Code & Description", icon: Hash },
              { number: 4, title: "Review", icon: Check },
            ].map((stepData, index) => (
              <div key={stepData.number} className="flex items-center flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step >= stepData.number
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-blue-400/30 text-blue-400"
                  }`}
                >
                  <stepData.icon className="h-4 w-4" />
                </div>
                <div className="ml-2 min-w-0">
                  <p
                    className={`text-xs font-medium whitespace-nowrap ${
                      step >= stepData.number ? "text-blue-300" : "text-blue-400/70"
                    }`}
                  >
                    {stepData.title}
                  </p>
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 lg:w-16 h-0.5 mx-2 flex-shrink-0 ${
                      step > stepData.number ? "bg-blue-500" : "bg-blue-400/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 1: Element Type & Element Selection */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Element Type Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="lignesElementTypeId" className="text-blue-200 text-base font-medium">
                      Element Type<span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formValues.lignesElementTypeId?.toString()}
                      onValueChange={(value) => {
                        const lignesElementTypeId = value ? parseInt(value) : undefined;
                        handleFieldChange("lignesElementTypeId", lignesElementTypeId);
                        // Reset element selection and location when type changes
                        handleFieldChange("selectedElementCode", undefined);
                        handleFieldChange("locationCode", undefined);
                        // Reset search query
                        setSearchQuery("");
                        setIsSelectOpen(false);
                        // Reset location search query
                        setLocationSearchQuery("");
                        setIsLocationSelectOpen(false);
                      }}
                    >
                      <SelectTrigger className="bg-blue-950/40 border-blue-400/20 text-white h-12 text-base">
                        <SelectValue placeholder="Select element type" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-950 border-blue-400/20">
                        {elementTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()} className="text-white hover:bg-blue-800">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                type.typeElement === 'Item' ? 'bg-green-400' :
                                type.typeElement === 'GeneralAccounts' ? 'bg-blue-400' :
                                'bg-blue-400'
                              }`}></div>
                              <div>
                                <div className="font-medium">{type.code} - {type.typeElement}</div>
                                <div className="text-sm text-gray-400">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.lignesElementTypeId && (
                      <p className="text-red-400 text-sm mt-1">{errors.lignesElementTypeId}</p>
                    )}
                  </div>

                  {/* Dynamic Element Selection */}
                  {formValues.lignesElementTypeId && (
                    <div className="space-y-3">
                      <Label htmlFor="selectedElementCode" className="text-blue-200 text-base font-medium">
                        Select {getSelectedElementType()?.typeElement === 'Item' ? 'Item' : 'General Account'}<span className="text-red-400">*</span>
                      </Label>
                      
                      {loadingElements ? (
                        <div className="flex items-center justify-center p-8 bg-blue-950/30 rounded-lg border border-blue-400/20">
                          <Loader2 className="h-6 w-6 text-blue-400 animate-spin mr-2" />
                          <span className="text-blue-300">Loading available elements...</span>
                        </div>
                      ) : (
                        <div className="relative">
                          {/* Trigger Button */}
                          <button
                            type="button"
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            className="w-full bg-blue-950/40 border border-blue-400/20 text-white h-12 px-3 text-base rounded-md flex items-center justify-between hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <span className={formValues.selectedElementCode ? "text-white" : "text-blue-300/70"}>
                              {formValues.selectedElementCode ? (
                                availableElements.find(el => el.code === formValues.selectedElementCode)?.code || formValues.selectedElementCode
                              ) : (
                                `Select ${getSelectedElementType()?.typeElement === 'Item' ? 'an item' : 'a general account'}`
                              )}
                            </span>
                            <ChevronDown className={`h-4 w-4 text-blue-400 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {/* Dropdown */}
                          {isSelectOpen && (
                            <div className="absolute z-50 w-full mt-1 bg-blue-950 border border-blue-400/20 rounded-md shadow-lg max-h-60 overflow-hidden">
                              {/* Search Input */}
                              <div className="p-2 border-b border-blue-400/20">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                                  <Input
                                    placeholder={`Search ${getSelectedElementType()?.typeElement === 'Item' ? 'items' : 'general accounts'}...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-blue-900/40 border-blue-400/20 text-white pl-10 h-9 focus:border-blue-400"
                                    autoFocus
                                  />
                                </div>
                              </div>

                              {/* Options List */}
                              <div className="max-h-48 overflow-y-auto">
                                {filteredElements.length > 0 ? (
                                  filteredElements.map((element) => (
                                    <button
                                      key={element.code}
                                      type="button"
                                      onClick={() => {
                                        handleFieldChange("selectedElementCode", element.code);
                                        setIsSelectOpen(false);
                                        setSearchQuery("");
                                      }}
                                      className={`w-full text-left px-3 py-2 text-white hover:bg-blue-800/50 focus:bg-blue-800/50 focus:outline-none ${
                                        formValues.selectedElementCode === element.code ? 'bg-blue-800/50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-blue-400 flex-shrink-0"></div>
                                        <div className="min-w-0 flex-1">
                                          <div className="font-medium text-sm">{element.code}</div>
                                          <div className="text-xs text-gray-400 truncate">{element.description}</div>
                                        </div>
                                        {formValues.selectedElementCode === element.code && (
                                          <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                        )}
                                      </div>
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 py-6 text-center text-sm text-blue-300/70">
                                    No {getSelectedElementType()?.typeElement === 'Item' ? 'items' : 'general accounts'} found
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Click outside to close */}
                      {isSelectOpen && (
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => {
                            setIsSelectOpen(false);
                            setSearchQuery("");
                          }}
                        />
                      )}
                      
                      {errors.selectedElementCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.selectedElementCode}</p>
                      )}
                    </div>
                  )}

                  {/* Unit of Measure Selection - Only for Item types */}
                  {formValues.lignesElementTypeId && getSelectedElementType()?.typeElement === 'Item' && formValues.selectedElementCode && (
                    <div className="space-y-3">
                      <Label htmlFor="unitCode" className="text-blue-200 text-base font-medium">
                        Unit of Measure<span className="text-red-400">*</span>
                      </Label>
                      
                      {loadingUnits ? (
                        <div className="flex items-center justify-center p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin mr-2" />
                          <span className="text-blue-300 text-sm">Loading available units...</span>
                        </div>
                      ) : itemUnits.length === 0 ? (
                        <div className="p-4 bg-yellow-950/30 rounded-lg border border-yellow-400/20">
                          <p className="text-yellow-300 text-sm">
                            No units of measure found for this item. Please contact an administrator.
                          </p>
                        </div>
                      ) : itemUnits.length === 1 ? (
                        <div className="p-4 bg-green-950/30 rounded-lg border border-green-400/20">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-500/20 p-2 rounded-lg">
                              <Package className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <h4 className="text-green-200 font-medium">
                                {itemUnits[0].unitOfMeasureCode} - {itemUnits[0].unitOfMeasureDescription}
                              </h4>
                              <p className="text-green-300/70 text-sm">
                                Auto-selected (only unit available) • Ratio: {itemUnits[0].qtyPerUnitOfMeasure}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Select
                          value={formValues.unitCode || ""}
                          onValueChange={(value) => handleFieldChange("unitCode", value || undefined)}
                        >
                          <SelectTrigger className="bg-blue-950/40 border-blue-400/20 text-white h-12 text-base">
                            <SelectValue placeholder="Select unit of measure" />
                          </SelectTrigger>
                          <SelectContent className="bg-blue-950 border-blue-400/20 max-h-60">
                            {itemUnits.map((unit) => (
                              <SelectItem key={unit.unitOfMeasureCode} value={unit.unitOfMeasureCode} className="text-white hover:bg-blue-800">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{unit.unitOfMeasureCode} - {unit.unitOfMeasureDescription}</span>
                                    {selectedItemDetails?.unite === unit.unitOfMeasureCode && (
                                      <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded">Default</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-400">Ratio: {unit.qtyPerUnitOfMeasure}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {/* Show info about pre-selected unit */}
                      {itemUnits.length > 1 && formValues.unitCode && (
                        <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-400/10">
                          <p className="text-blue-300 text-sm">
                            {selectedItemDetails?.unite === formValues.unitCode 
                              ? `✓ Pre-selected default unit from item: ${formValues.unitCode}` 
                              : `✓ Pre-selected unit: ${formValues.unitCode} (no default unit defined for this item)`}
                          </p>
                        </div>
                      )}
                      
                      {errors.unitCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.unitCode}</p>
                      )}
                    </div>
                  )}

                  {/* Location Selection - Only for Item types */}
                  {formValues.lignesElementTypeId && getSelectedElementType()?.typeElement === 'Item' && (
                    <div className="space-y-3">
                      <Label htmlFor="locationCode" className="text-blue-200 text-base font-medium">
                        Location<span className="text-red-400">*</span>
                      </Label>
                      <div className="relative">
                        {/* Trigger Button */}
                        <button
                          type="button"
                          onClick={() => setIsLocationSelectOpen(!isLocationSelectOpen)}
                          className="w-full bg-blue-950/40 border border-blue-400/20 text-white h-12 px-3 text-base rounded-md flex items-center justify-between hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <span className={formValues.locationCode ? "text-white" : "text-blue-300/70"}>
                            {formValues.locationCode ? (
                              locations.find(loc => loc.locationCode === formValues.locationCode)?.locationCode || formValues.locationCode
                            ) : (
                              "Select location"
                            )}
                          </span>
                          <ChevronDown className={`h-4 w-4 text-blue-400 transition-transform ${isLocationSelectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown */}
                        {isLocationSelectOpen && (
                          <div className="absolute z-50 w-full mt-1 bg-blue-950 border border-blue-400/20 rounded-md shadow-lg max-h-60 overflow-hidden">
                            {/* Search Input */}
                            <div className="p-2 border-b border-blue-400/20">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                                <Input
                                  placeholder="Search locations..."
                                  value={locationSearchQuery}
                                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                                  className="bg-blue-900/40 border-blue-400/20 text-white pl-10 h-9 focus:border-blue-400"
                                  autoFocus
                                />
                              </div>
                            </div>

                            {/* Options List */}
                            <div className="max-h-48 overflow-y-auto">
                              {filteredLocations.length > 0 ? (
                                filteredLocations.map((location) => (
                                  <button
                                    key={location.locationCode}
                                    type="button"
                                    onClick={() => {
                                      handleFieldChange("locationCode", location.locationCode);
                                      setIsLocationSelectOpen(false);
                                      setLocationSearchQuery("");
                                    }}
                                    className={`w-full text-left px-3 py-2 text-white hover:bg-blue-800/50 focus:bg-blue-800/50 focus:outline-none ${
                                      formValues.locationCode === location.locationCode ? 'bg-blue-800/50' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-3 h-3 rounded-full bg-blue-400 flex-shrink-0"></div>
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-sm">{location.locationCode}</div>
                                        <div className="text-xs text-gray-400 truncate">{location.description}</div>
                                      </div>
                                      {formValues.locationCode === location.locationCode && (
                                        <Check className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                      )}
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-6 text-center text-sm text-blue-300/70">
                                  No locations found
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Click outside to close */}
                      {isLocationSelectOpen && (
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => {
                            setIsLocationSelectOpen(false);
                            setLocationSearchQuery("");
                          }}
                        />
                      )}
                      {errors.locationCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.locationCode}</p>
                      )}
                    </div>
                  )}

                  {/* Information card about the selected element */}
                  {formValues.selectedElementCode && getSelectedElement() && (
                    <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <Package className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-blue-200 font-medium mb-1">
                            {getSelectedElement()?.code} - {getSelectedElementType()?.typeElement}
                          </h4>
                          <p className="text-blue-300/70 text-sm">
                            {getSelectedElement()?.description}
                          </p>
                          <p className="text-blue-400/60 text-xs mt-2">
                            This will be used as the reference for your line item. Code and description will be auto-suggested in the last step.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Help text when no selections are made */}
                  {!formValues.lignesElementTypeId && (
                    <div className="p-6 bg-gray-950/30 rounded-lg border border-gray-500/20 text-center">
                      <div className="bg-gray-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Layers className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-gray-300 font-medium mb-2">Choose an Element Type</h4>
                      <p className="text-gray-400 text-sm">
                        Start by selecting the type of element you want to add to this line.
                      </p>
                    </div>
                  )}

                  {formValues.lignesElementTypeId && !formValues.selectedElementCode && !loadingElements && (
                    <div className="p-6 bg-gray-950/30 rounded-lg border border-gray-500/20 text-center">
                      <div className="bg-gray-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-gray-300 font-medium mb-2">Select Specific Element</h4>
                      <p className="text-gray-400 text-sm">
                        Now choose the specific {getSelectedElementType()?.typeElement === 'Item' ? 'item' : 'general account'} you want to reference.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Pricing */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Quantity and Unit Price */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-blue-950/20 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <Label htmlFor="quantity" className="text-blue-200 text-base font-medium">
                          Quantity
                        </Label>
                      </div>
                      <Input
                        id="quantity"
                        type="text"
                        value={formValues.quantity === 0 ? "" : formValues.quantity.toString()}
                        onChange={(e) => handleNumericInput("quantity", e.target.value, true)}
                        className={`bg-blue-950/40 border-blue-400/20 text-white h-12 text-base ${errors.quantity ? 'border-red-500' : ''}`}
                        placeholder="Enter quantity"
                      />
                      {errors.quantity && (
                        <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>
                      )}
                    </div>

                    <div className="space-y-3 p-4 bg-blue-950/20 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <Label htmlFor="priceHT" className="text-blue-200 text-base font-medium">
                          Unit Price (HT)
                        </Label>
                      </div>
                      <Input
                        id="priceHT"
                        type="text"
                        value={formValues.priceHT === 0 ? "" : formValues.priceHT.toString()}
                        onChange={(e) => handleNumericInput("priceHT", e.target.value, false)}
                        className={`bg-blue-950/40 border-blue-400/20 text-white h-12 text-base ${errors.priceHT ? 'border-red-500' : ''}`}
                        placeholder="Enter price"
                      />
                      {errors.priceHT && (
                        <p className="text-red-400 text-sm mt-1">{errors.priceHT}</p>
                      )}
                    </div>
                  </div>

                  {/* Unit Conversion Info - Only show for Item types with non-default units */}
                  {formValues.unitCode && selectedItemDetails && unitConversionFactor !== 1 && (
                    <div className="p-4 bg-blue-950/20 rounded-lg border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <Label className="text-yellow-200 text-base font-medium">Unit Conversion Applied</Label>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-yellow-400">Base Quantity:</span>
                          <div className="text-white font-medium">{formValues.quantity}</div>
                        </div>
                        <div>
                          <span className="text-yellow-400">Conversion Factor:</span>
                          <div className="text-white font-medium">× {unitConversionFactor}</div>
                        </div>
                        <div>
                          <span className="text-yellow-400">Adjusted Quantity:</span>
                          <div className="text-white font-medium">{adjustedQuantity}</div>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-950/30 rounded border border-yellow-500/30">
                        <p className="text-yellow-100 text-xs">
                          <strong>Note:</strong> Since you're using unit "{formValues.unitCode}" instead of the default unit "{selectedItemDetails.unite}", 
                          the quantity has been automatically adjusted by the conversion factor ({unitConversionFactor}).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Discount Section */}
                  <div className="space-y-4 p-4 bg-blue-950/20 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <Label className="text-blue-200 text-base font-medium">Discount Options</Label>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <Switch
                        id="useFixedDiscount"
                        checked={formValues.useFixedDiscount}
                        onCheckedChange={(checked) => {
                          handleFieldChange("useFixedDiscount", checked);
                          if (checked) {
                            handleFieldChange("discountPercentage", 0);
                          } else {
                            handleFieldChange("discountAmount", 0);
                          }
                        }}
                      />
                      <Label htmlFor="useFixedDiscount" className="text-blue-200">
                        Use fixed amount instead of percentage
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {!formValues.useFixedDiscount ? (
                        <div className="space-y-2">
                          <Label htmlFor="discountPercentage" className="text-blue-200">
                            Discount Percentage
                          </Label>
                          <Input
                            id="discountPercentage"
                            type="text"
                            value={formValues.discountPercentage === 0 ? "" : (formValues.discountPercentage * 100).toString()}
                            onChange={(e) => handlePercentageInput("discountPercentage", e.target.value)}
                            className={`bg-blue-950/40 border-blue-400/20 text-white ${errors.discountPercentage ? 'border-red-500' : ''}`}
                            placeholder="0"
                          />
                          {errors.discountPercentage && (
                            <p className="text-red-400 text-sm mt-1">{errors.discountPercentage}</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="discountAmount" className="text-blue-200">
                            Discount Amount
                          </Label>
                          <Input
                            id="discountAmount"
                            type="text"
                            value={formValues.discountAmount === 0 || !formValues.discountAmount ? "" : formValues.discountAmount.toString()}
                            onChange={(e) => handleNumericInput("discountAmount", e.target.value, false)}
                            className={`bg-blue-950/40 border-blue-400/20 text-white ${errors.discountAmount ? 'border-red-500' : ''}`}
                            placeholder="0.00"
                          />
                          {errors.discountAmount && (
                            <p className="text-red-400 text-sm mt-1">{errors.discountAmount}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VAT Section */}
                  <div className="space-y-3 p-4 bg-blue-950/20 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                      <Label htmlFor="vatPercentage" className="text-blue-200 text-base font-medium">
                        VAT Percentage
                      </Label>
                    </div>
                    <Input
                      id="vatPercentage"
                      type="text"
                      value={formValues.vatPercentage === 0 ? "" : (formValues.vatPercentage * 100).toString()}
                      onChange={(e) => handlePercentageInput("vatPercentage", e.target.value)}
                      className={`bg-blue-950/40 border-blue-400/20 text-white h-12 text-base ${errors.vatPercentage ? 'border-red-500' : ''}`}
                      placeholder="20"
                    />
                    {errors.vatPercentage && (
                      <p className="text-red-400 text-sm mt-1">{errors.vatPercentage}</p>
                    )}
                  </div>

                  {/* Live Calculation Preview */}
                  <div className="p-6 bg-gray-950/40 rounded-lg border border-gray-500/20">
                    <h4 className="text-gray-200 font-medium mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-gray-400" />
                      Calculation Preview
                    </h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-950/30 rounded-lg border border-blue-500/20">
                        <div className="text-blue-300 text-sm font-medium">Amount Discount</div>
                        <div className="text-blue-100 text-xl font-bold">
                          {formatPrice(calculateAmounts().discountAmount)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-950/30 rounded-lg border border-blue-500/20">
                        <div className="text-blue-300 text-sm font-medium">Amount HT</div>
                        <div className="text-blue-100 text-xl font-bold">
                          {formatPrice(calculateAmounts().amountHT)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-950/30 rounded-lg border border-blue-500/20">
                        <div className="text-blue-300 text-sm font-medium">VAT</div>
                        <div className="text-blue-100 text-xl font-bold">
                          {formatPrice(calculateAmounts().amountVAT)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-blue-950/30 rounded-lg border border-blue-500/20">
                        <div className="text-blue-300 text-sm font-medium">Amount TTC</div>
                        <div className="text-blue-100 text-xl font-bold">
                          {formatPrice(calculateAmounts().amountTTC)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Code & Description */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-blue-200">
                      Code<span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="code"
                        value={formValues.code}
                        onChange={(e) => handleFieldChange("code", e.target.value)}
                        placeholder="Enter unique line code"
                        className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400 pr-10"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {codeValidation.isValidating && (
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                        )}
                        {!codeValidation.isValidating && codeValidation.isValid === true && (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        )}
                        {!codeValidation.isValidating && codeValidation.isValid === false && (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                    </div>
                    {codeValidation.message && (
                      <p className={`text-sm mt-1 ${
                        codeValidation.isValid === true 
                          ? "text-green-400" 
                          : "text-red-400"
                      }`}>
                        {codeValidation.message}
                      </p>
                    )}
                    {errors.code && (
                      <p className="text-red-400 text-sm mt-1">{errors.code}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="article" className="text-blue-200">
                      Article Description<span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="article"
                      value={formValues.article}
                      onChange={(e) => handleFieldChange("article", e.target.value)}
                      placeholder="Enter article description"
                      rows={4}
                      className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
                    />
                    {errors.article && (
                      <p className="text-red-400 text-sm mt-1">{errors.article}</p>
                    )}
                  </div>

                  {/* Preview of selected element */}
                  {getSelectedElement() && (
                    <div className="p-4 bg-green-950/20 rounded-lg border border-green-400/20">
                      <h4 className="text-green-200 font-medium mb-2">Based on Selected Element</h4>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-300">Element Type:</span>
                          <span className="text-white">{getSelectedElementType()?.typeElement}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-300">Element Code:</span>
                          <span className="text-white">{getSelectedElement()?.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-300">Element Description:</span>
                          <span className="text-white">{getSelectedElement()?.description}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-blue-200 font-medium">Review Line Details</h3>
                    <p className="text-blue-400/70 text-sm">Click edit buttons to modify any section</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-4">
                      {/* Code & Description Section */}
                      <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-500/30 relative">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-blue-200 font-medium flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            Code & Description
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep(3)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 h-8 w-8 p-0"
                            title="Edit Code & Description"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-blue-400">Code:</span>
                            <div className="text-white font-medium">{formValues.code}</div>
                          </div>
                          <div>
                            <span className="text-blue-400">Description:</span>
                            <div className="text-white">
                              {formValues.article.length > 100
                                ? `${formValues.article.substring(0, 100)}...`
                                : formValues.article}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Element Type & Selection Section */}
                      <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-500/30 relative">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-blue-200 font-medium flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            Element Type & Selection
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep(1)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 h-8 w-8 p-0"
                            title="Edit Element Type & Selection"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-blue-400">Element Type:</span>
                            <div className="text-white">
                              {selectedElementType ? (
                                <div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${
                                      selectedElementType?.typeElement === 'Item' ? 'bg-blue-400' :
                                      selectedElementType?.typeElement === 'GeneralAccounts' ? 'bg-blue-400' :
                                      'bg-blue-400'
                                    }`}></div>
                                    <span className="font-medium">{selectedElementType?.code} - {selectedElementType?.typeElement}</span>
                                  </div>
                                  <div className="text-gray-400 text-xs mt-1">
                                    {selectedElementType?.description}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Element type information not available</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-blue-400">Selected Element:</span>
                            <div className="text-white">
                              {selectedElement ? (
                                <div>
                                  <div className="font-medium">{selectedElement?.code}</div>
                                  <div className="text-gray-400 text-xs">{selectedElement?.description}</div>
                                </div>
                              ) : formValues.selectedElementCode ? (
                                <div>
                                  <div className="font-medium">{formValues.selectedElementCode}</div>
                                  <div className="text-gray-400 text-xs">Selected element details not available</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">No element selected</span>
                              )}
                            </div>
                          </div>
                          {/* Location - Only for Item types */}
                          {selectedElementType?.typeElement === 'Item' && (
                            <div>
                              <span className="text-blue-400">Location:</span>
                              <div className="text-white">
                                {formValues.locationCode ? (
                                  <div>
                                    <div className="font-medium">{formValues.locationCode}</div>
                                    <div className="text-gray-400 text-xs">
                                      {locations.find(l => l.locationCode === formValues.locationCode)?.description || 'Location details not available'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No location selected</span>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Unit of Measure - Only for Item types */}
                          {selectedElementType?.typeElement === 'Item' && (
                            <div>
                              <span className="text-blue-400">Unit of Measure:</span>
                              <div className="text-white">
                                {formValues.unitCode ? (
                                  <div>
                                    <div className="font-medium">{formValues.unitCode}</div>
                                    <div className="text-gray-400 text-xs">
                                      {(() => {
                                        const selectedUnit = itemUnits.find(u => u.unitOfMeasureCode === formValues.unitCode);
                                        if (selectedUnit) {
                                          return `${selectedUnit.unitOfMeasureDescription} • Ratio: ${selectedUnit.qtyPerUnitOfMeasure}`;
                                        }
                                        return 'Unit details not available';
                                      })()}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">
                                    {itemUnits.length === 1 && itemUnits[0] ? 
                                      `${itemUnits[0].unitOfMeasureCode} (Auto-selected)` : 
                                      'No unit selected'
                                    }
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Pricing Section */}
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-500/30 relative">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-blue-200 font-medium flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Pricing Details
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep(2)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/40 h-8 w-8 p-0"
                            title="Edit Pricing Details"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-blue-400">Quantity:</span>
                            <div className="text-white">
                              <div className="font-medium">{formValues.quantity}</div>
                              {unitConversionFactor !== 1 && (
                                <div className="text-yellow-300 text-xs mt-1">
                                  Adjusted: {adjustedQuantity} (× {unitConversionFactor})
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-blue-400">Unit Price (HT):</span>
                            <div className="text-white font-medium">{formatPrice(formValues.priceHT)}</div>
                          </div>
                          <div>
                            <span className="text-blue-400">Discount:</span>
                            <div className="text-white font-medium">
                              {formValues.useFixedDiscount 
                                ? formatPrice(formValues.discountAmount || 0)
                                : formatPercentage(formValues.discountPercentage)
                              }
                            </div>
                          </div>
                          <div>
                            <span className="text-blue-400">VAT:</span>
                            <div className="text-white font-medium">{formatPercentage(formValues.vatPercentage)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Unit Conversion Summary - Only show for Item types with non-default units */}
                  {formValues.unitCode && selectedItemDetails && unitConversionFactor !== 1 && (
                    <div className="p-4 bg-blue-950/20 rounded-lg border border-yellow-500/20">
                      <h4 className="text-yellow-200 font-medium mb-2 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Unit Conversion Applied
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-yellow-400">Selected Unit:</span>
                          <div className="text-white font-medium">{formValues.unitCode}</div>
                        </div>
                        <div>
                          <span className="text-yellow-400">Default Unit:</span>
                          <div className="text-white font-medium">{selectedItemDetails.unite}</div>
                        </div>
                        <div>
                          <span className="text-yellow-400">Conversion Factor:</span>
                          <div className="text-white font-medium">× {unitConversionFactor}</div>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-950/30 rounded border border-yellow-500/30">
                        <p className="text-yellow-100 text-xs">
                          Quantity has been automatically adjusted from {formValues.quantity} to {adjustedQuantity} to account for the unit conversion.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Final calculation */}
                  <div className="p-4 bg-green-950/30 rounded-lg border border-green-400/20">
                    <h4 className="text-green-200 font-medium mb-2">Final Calculation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-blue-400 text-sm">Amount Discount</div>
                        <div className="text-white font-bold text-lg">{formatPrice(calculateAmounts().discountAmount)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 text-sm">Amount HT</div>
                        <div className="text-white font-bold text-lg">{formatPrice(calculateAmounts().amountHT)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-400 text-sm">VAT</div>
                        <div className="text-white font-bold text-lg">{formatPrice(calculateAmounts().amountVAT)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 text-sm">Amount TTC</div>
                        <div className="text-white font-bold text-xl">{formatPrice(calculateAmounts().amountTTC)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t border-blue-500/20 mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
              >
                <Ban className="h-4 w-4 mr-2" /> Cancel
              </Button>
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}
            </div>

            <div>
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!formValues.lignesElementTypeId || !formValues.selectedElementCode || 
                      (getSelectedElementType()?.typeElement === 'Item' && !formValues.locationCode) ||
                      (getSelectedElementType()?.typeElement === 'Item' && itemUnits.length > 0 && !formValues.unitCode))) ||
                    (step === 2 && (formValues.quantity <= 0 || formValues.priceHT <= 0)) ||
                    (step === 3 && (codeValidation.isValidating || codeValidation.isValid !== true))
                  }
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" /> Create Line
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLigneDialog;
