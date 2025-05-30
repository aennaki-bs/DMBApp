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
} from "lucide-react";
import { Document, CreateLigneRequest } from "@/models/document";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import lineElementsService from "@/services/lineElementsService";
import {
  LignesElementTypeSimple,
  ItemSimple,
  GeneralAccountsSimple,
} from "@/models/lineElements";
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
  title: string;
  article: string;
  typeId?: number;
  itemCode?: string;
  generalAccountsCode?: string;
  quantity: number;
  priceHT: number;
  discountPercentage: number;
  discountAmount?: number;
  vatPercentage: number;
  useFixedDiscount: boolean;
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
    title: "",
    article: "",
    quantity: 1,
    priceHT: 0,
    discountPercentage: 0,
    vatPercentage: 0.2, // Default 20% VAT
    useFixedDiscount: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  // Dropdown data
  const [elementTypes, setElementTypes] = useState<LignesElementTypeSimple[]>([]);
  const [items, setItems] = useState<ItemSimple[]>([]);
  const [generalAccounts, setGeneralAccountsSimple] = useState<GeneralAccountsSimple[]>([]);

  const queryClient = useQueryClient();

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [typesData, itemsData, accountsData] = await Promise.all([
          lineElementsService.elementTypes.getSimple(),
          lineElementsService.items.getSimple(),
          lineElementsService.generalAccounts.getSimple(),
        ]);
        
        setElementTypes(typesData);
        setItems(itemsData);
        setGeneralAccountsSimple(accountsData);
      } catch (error) {
        console.error("Failed to load dropdown data:", error);
        toast.error("Failed to load form data");
      }
    };

    if (isOpen) {
      loadDropdownData();
    }
  }, [isOpen]);

  // Generate ligne key based on document
  useEffect(() => {
    if (isOpen && document) {
      const ligneCount = (document.lignesCount || 0) + 1;
      const ligneKey = `${document.documentKey}-L${ligneCount.toString().padStart(3, '0')}`;
      setFormValues(prev => ({ ...prev, ligneKey }));
    }
  }, [isOpen, document]);

  // Calculate amounts
  const calculateAmounts = () => {
    const { quantity, priceHT, discountPercentage, discountAmount, vatPercentage, useFixedDiscount } = formValues;
    
    let amountHT: number;
    if (useFixedDiscount && discountAmount) {
      amountHT = priceHT * quantity - discountAmount;
    } else {
      amountHT = priceHT * quantity * (1 - discountPercentage);
    }
    
    const amountVAT = amountHT * vatPercentage;
    const amountTTC = amountHT + amountVAT;
    
    return { amountHT, amountVAT, amountTTC };
  };

  const resetForm = () => {
    setFormValues({
      ligneKey: "",
      title: "",
      article: "",
      quantity: 1,
      priceHT: 0,
      discountPercentage: 0,
      vatPercentage: 0.2,
      useFixedDiscount: false,
    });
    setErrors({});
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFieldChange = (key: keyof FormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formValues.title && formValues.title.trim());
      case 2:
        if (!formValues.typeId) return false;
        
        // Get the selected element type
        const selectedElementType = elementTypes.find(t => t.id === formValues.typeId);
        if (!selectedElementType) return false;
        
        // Validate based on element type
        switch (selectedElementType.typeElement) {
          case 'Item':
            return !!(formValues.itemCode && formValues.itemCode.trim());
          case 'General Accounts':
            return !!(formValues.generalAccountsCode && formValues.generalAccountsCode.trim());
          default:
            return false;
        }
      case 3:
        return !!(
          formValues.quantity && 
          formValues.quantity > 0 && 
          formValues.priceHT && 
          formValues.priceHT >= 0 &&
          formValues.vatPercentage !== undefined &&
          formValues.vatPercentage >= 0
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    try {
      setIsSubmitting(true);
      const newLigne: CreateLigneRequest = {
        documentId: document.id,
        ligneKey: formValues.ligneKey,
        title: formValues.title,
        article: formValues.article,
        typeId: formValues.typeId,
        itemCode: formValues.itemCode,
        generalAccountsCode: formValues.generalAccountsCode,
        quantity: formValues.quantity,
        priceHT: formValues.priceHT,
        discountPercentage: formValues.discountPercentage,
        discountAmount: formValues.useFixedDiscount ? formValues.discountAmount : undefined,
        vatPercentage: formValues.vatPercentage,
      };

      await documentService.createLigne(newLigne);
      toast.success("Line created successfully");
      resetForm();
      onOpenChange(false);

      // Refresh document data
      queryClient.invalidateQueries({ queryKey: ["document", document.id] });
      queryClient.invalidateQueries({
        queryKey: ["documentLignes", document.id],
      });
    } catch (error) {
      console.error("Failed to create line:", error);
      toast.error("Failed to create line");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format price with MAD currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const { amountHT, amountVAT, amountTTC } = calculateAmounts();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
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
            Create a new line item for document: {document.title}
          </DialogDescription>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {[
            { number: 1, title: "Basic Info", icon: "📝", description: "Title & Description" },
            { number: 2, title: "Elements", icon: "🔗", description: "Type & References" },
            { number: 3, title: "Pricing", icon: "💰", description: "Costs & Discounts" },
            { number: 4, title: "Review", icon: "✅", description: "Final Check" },
          ].map((stepInfo, index) => (
            <div key={stepInfo.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    step === stepInfo.number
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-110"
                      : step > stepInfo.number
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-700 text-gray-400 border-2 border-gray-600"
                  }`}
                >
                  {step > stepInfo.number ? "✓" : stepInfo.icon}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium transition-colors duration-300 ${
                      step === stepInfo.number
                        ? "text-blue-300"
                        : step > stepInfo.number
                        ? "text-green-300"
                        : "text-gray-400"
                    }`}
                  >
                    {stepInfo.title}
                  </div>
                  <div
                    className={`text-xs transition-colors duration-300 ${
                      step === stepInfo.number
                        ? "text-blue-400/70"
                        : step > stepInfo.number
                        ? "text-green-400/70"
                        : "text-gray-500"
                    }`}
                  >
                    {stepInfo.description}
                  </div>
                </div>
              </div>
              {index < 3 && (
                <div
                  className={`w-16 h-1 mx-4 rounded-full transition-all duration-500 ${
                    step > stepInfo.number
                      ? "bg-green-500 shadow-sm shadow-green-500/30"
                      : step === stepInfo.number
                      ? "bg-blue-500/50"
                      : "bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
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
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ligneKey" className="text-blue-200">
                      Line Key
                    </Label>
                    <Input
                      id="ligneKey"
                      value={formValues.ligneKey}
                      onChange={(e) => handleFieldChange("ligneKey", e.target.value)}
                      placeholder="Auto-generated"
                      className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-blue-200">
                      Title<span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formValues.title}
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      placeholder="Enter line title"
                      className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm mt-1">{errors.title}</p>
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
                </div>
              )}

              {/* Step 2: Element References */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="typeId" className="text-blue-200 text-base font-medium">
                      Element Type
                    </Label>
                    <Select
                      value={formValues.typeId?.toString()}
                      onValueChange={(value) => {
                        const typeId = value ? parseInt(value) : undefined;
                        handleFieldChange("typeId", typeId);
                        // Reset related fields when element type changes
                        handleFieldChange("itemCode", undefined);
                        handleFieldChange("generalAccountsCode", undefined);
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
                                type.typeElement === 'General Accounts' ? 'bg-purple-400' :
                                'bg-purple-400'
                              }`}></div>
                              <div>
                                <div className="font-medium">{type.typeElement}</div>
                                <div className="text-sm text-gray-400">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Conditional rendering based on selected element type */}
                  {formValues.typeId && (
                    <div className="space-y-4">
                      {/* Show Items dropdown only if Item type is selected */}
                      {elementTypes.find(t => t.id === formValues.typeId)?.typeElement === 'Item' && (
                        <div className="space-y-3 p-4 bg-green-950/20 rounded-lg border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            <Label htmlFor="itemCode" className="text-green-200 text-base font-medium">
                              Select Item
                            </Label>
                          </div>
                          <Select
                            value={formValues.itemCode || ""}
                            onValueChange={(value) => handleFieldChange("itemCode", value || undefined)}
                          >
                            <SelectTrigger className="bg-green-950/40 border-green-400/20 text-white h-12 text-base">
                              <SelectValue placeholder="Choose an item" />
                            </SelectTrigger>
                            <SelectContent className="bg-green-950 border-green-400/20">
                              {items.map((item) => (
                                <SelectItem key={item.code} value={item.code} className="text-white hover:bg-green-800">
                                  <div>
                                    <div className="font-medium">{item.code}</div>
                                    <div className="text-sm text-green-300">{item.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Show General Accounts dropdown only if General Accounts type is selected */}
                      {elementTypes.find(t => t.id === formValues.typeId)?.typeElement === 'General Accounts' && (
                        <div className="space-y-3 p-4 bg-purple-950/20 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                            <Label htmlFor="generalAccountsCode" className="text-purple-200 text-base font-medium">
                              Select General Account
                            </Label>
                          </div>
                          <Select
                            value={formValues.generalAccountsCode || ""}
                            onValueChange={(value) => handleFieldChange("generalAccountsCode", value || undefined)}
                          >
                            <SelectTrigger className="bg-purple-950/40 border-purple-400/20 text-white h-12 text-base">
                              <SelectValue placeholder="Choose a general account" />
                            </SelectTrigger>
                            <SelectContent className="bg-purple-950 border-purple-400/20">
                              {generalAccounts.map((account) => (
                                <SelectItem key={account.code} value={account.code} className="text-white hover:bg-purple-800">
                                  <div>
                                    <div className="font-medium">{account.code}</div>
                                    <div className="text-sm text-purple-300">{account.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Information card about the selected element type */}
                      <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500/20 p-2 rounded-lg">
                            <Package className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-blue-200 font-medium mb-1">
                              {elementTypes.find(t => t.id === formValues.typeId)?.typeElement}
                            </h4>
                            <p className="text-blue-300/70 text-sm">
                              {elementTypes.find(t => t.id === formValues.typeId)?.description}
                            </p>
                            <p className="text-blue-400/60 text-xs mt-2">
                              Select the specific {elementTypes.find(t => t.id === formValues.typeId)?.typeElement.toLowerCase()} 
                              that this line item will reference.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Help text when no element type is selected */}
                  {!formValues.typeId && (
                    <div className="p-6 bg-gray-950/30 rounded-lg border border-gray-500/20 text-center">
                      <div className="bg-gray-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-gray-300 font-medium mb-2">Choose an Element Type</h4>
                      <p className="text-gray-400 text-sm">
                        Select an element type above to see the available options for linking this line item 
                        to specific items or general accounts.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Pricing */}
              {step === 3 && (
                <div className="space-y-6">
                  {/* Quantity and Unit Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 p-4 bg-blue-950/20 rounded-lg border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <Label htmlFor="quantity" className="text-blue-200 text-base font-medium">
                          Quantity
                        </Label>
                      </div>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formValues.quantity}
                        onChange={(e) => handleFieldChange("quantity", parseFloat(e.target.value) || 0)}
                        className="bg-blue-950/40 border-blue-400/20 text-white h-12 text-base"
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-green-950/20 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <Label htmlFor="priceHT" className="text-green-200 text-base font-medium">
                          Unit Price (HT)
                        </Label>
                      </div>
                      <Input
                        id="priceHT"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formValues.priceHT}
                        onChange={(e) => handleFieldChange("priceHT", parseFloat(e.target.value) || 0)}
                        className="bg-green-950/40 border-green-400/20 text-white h-12 text-base"
                        placeholder="Enter unit price"
                      />
                    </div>
                  </div>

                  {/* Discount Section */}
                  <div className="space-y-4 p-4 bg-orange-950/20 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                      <Label className="text-orange-200 text-base font-medium">Discount Options</Label>
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
                      <Label htmlFor="useFixedDiscount" className="text-orange-200">
                        Use fixed amount instead of percentage
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {!formValues.useFixedDiscount ? (
                        <div className="space-y-2">
                          <Label htmlFor="discountPercentage" className="text-orange-200">
                            Discount Percentage
                          </Label>
                          <Input
                            id="discountPercentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={formValues.discountPercentage * 100}
                            onChange={(e) => handleFieldChange("discountPercentage", (parseFloat(e.target.value) || 0) / 100)}
                            className="bg-orange-950/40 border-orange-400/20 text-white"
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="discountAmount" className="text-orange-200">
                            Discount Amount
                          </Label>
                          <Input
                            id="discountAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formValues.discountAmount || 0}
                            onChange={(e) => handleFieldChange("discountAmount", parseFloat(e.target.value) || 0)}
                            className="bg-orange-950/40 border-orange-400/20 text-white"
                            placeholder="0.00"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VAT Section */}
                  <div className="space-y-3 p-4 bg-purple-950/20 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <Label htmlFor="vatPercentage" className="text-purple-200 text-base font-medium">
                        VAT Percentage
                      </Label>
                    </div>
                    <Input
                      id="vatPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formValues.vatPercentage * 100}
                      onChange={(e) => handleFieldChange("vatPercentage", (parseFloat(e.target.value) || 0) / 100)}
                      className="bg-purple-950/40 border-purple-400/20 text-white h-12 text-base"
                      placeholder="20"
                    />
                  </div>

                  {/* Live Calculation Preview */}
                  <div className="p-6 bg-gray-950/40 rounded-lg border border-gray-500/20">
                    <h4 className="text-gray-200 font-medium mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-gray-400" />
                      Calculation Preview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-950/30 rounded-lg border border-blue-500/20">
                        <div className="text-blue-300 text-sm font-medium">Amount HT</div>
                        <div className="text-blue-100 text-xl font-bold">
                          {formatPrice(calculateAmounts().amountHT)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-950/30 rounded-lg border border-purple-500/20">
                        <div className="text-purple-300 text-sm font-medium">VAT Amount</div>
                        <div className="text-purple-100 text-xl font-bold">
                          {formatPrice(calculateAmounts().amountVAT)}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-950/30 rounded-lg border border-green-500/20">
                        <div className="text-green-300 text-sm font-medium">Total TTC</div>
                        <div className="text-green-100 text-xl font-bold">
                          {formatPrice(calculateAmounts().amountTTC)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <div className="space-y-4">
                  <h3 className="text-blue-200 font-medium mb-4">Review Line Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div>
                        <span className="text-blue-400">Line Key:</span>
                        <div className="text-white">{formValues.ligneKey}</div>
                      </div>
                      <div>
                        <span className="text-blue-400">Title:</span>
                        <div className="text-white">{formValues.title}</div>
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
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-blue-400">Quantity:</span>
                        <div className="text-white">{formValues.quantity}</div>
                      </div>
                      <div>
                        <span className="text-blue-400">Unit Price (HT):</span>
                        <div className="text-white">{formatPrice(formValues.priceHT)}</div>
                      </div>
                      <div>
                        <span className="text-blue-400">VAT:</span>
                        <div className="text-white">{formatPercentage(formValues.vatPercentage)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Element references */}
                  {(formValues.itemCode || formValues.generalAccountsCode) && (
                    <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-400/20">
                      <h4 className="text-blue-200 font-medium mb-2">Element References</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {formValues.itemCode && (
                          <div>
                            <span className="text-green-400">Item:</span>
                            <div className="text-white">{formValues.itemCode}</div>
                          </div>
                        )}
                        {formValues.generalAccountsCode && (
                          <div>
                            <span className="text-indigo-400">Account:</span>
                            <div className="text-white">{formValues.generalAccountsCode}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Final calculation */}
                  <div className="p-4 bg-green-950/30 rounded-lg border border-green-400/20">
                    <h4 className="text-green-200 font-medium mb-2">Final Calculation</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-green-400 text-sm">Amount HT</div>
                        <div className="text-white font-bold text-lg">{formatPrice(amountHT)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 text-sm">VAT Amount</div>
                        <div className="text-white font-bold text-lg">{formatPrice(amountVAT)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-400 text-sm">Total TTC</div>
                        <div className="text-white font-bold text-xl">{formatPrice(amountTTC)}</div>
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
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
