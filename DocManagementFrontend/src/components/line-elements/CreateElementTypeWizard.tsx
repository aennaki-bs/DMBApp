import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Loader2,
  Tag,
  Package,
  Calculator,
  FileText,
  Database,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Import services and types
import lineElementsService from "@/services/lineElementsService";
import {
  Item,
  GeneralAccounts,
  CreateLignesElementTypeRequest,
} from "@/models/lineElements";

// Validation schemas for each step - FIXED: Only uppercase letters and underscores
const step1Schema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less")
    .regex(/^[A-Z_]+$/, "Code must contain only uppercase letters and underscores"),
});

const step2Schema = z.object({
  typeElement: z.enum(["Item", "General Accounts"], {
    required_error: "Please select a type element",
  }),
});

const step3Schema = z.object({
  description: z
    .string()
    .max(255, "Description must be 255 characters or less")
    .optional()
    .transform((val) => val?.trim() || ""),
});

// Combined schema for final validation - CONSISTENT regex pattern: only uppercase and underscores
const finalSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less")
    .regex(/^[A-Z_]+$/, "Code must contain only uppercase letters and underscores"),
  typeElement: z.enum(["Item", "General Accounts"]),
  description: z
    .string()
    .max(255, "Description must be 255 characters or less")
    .optional()
    .transform((val) => val?.trim() || ""),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;
type FinalData = z.infer<typeof finalSchema>;

interface CreateElementTypeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  availableItems: Item[];
  availableGeneralAccounts: GeneralAccounts[];
}

const CreateElementTypeWizard = ({
  open,
  onOpenChange,
  onSuccess,
  availableItems,
  availableGeneralAccounts,
}: CreateElementTypeWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBasicCodeFormat, setHasBasicCodeFormat] = useState(false);
  const [validationTimer, setValidationTimer] = useState<NodeJS.Timeout | null>(null);

  // Form data for each step
  const [wizardData, setWizardData] = useState<Partial<FinalData>>({});

  // Forms for each step - FIXED: Remove zodResolver to allow free typing
  const step1Form = useForm<Step1Data>({
    // Don't use zodResolver here - it causes real-time validation interference
    defaultValues: { code: "" },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { description: "" },
  });

  // Reset wizard when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setIsCodeValid(false);
      setIsValidatingCode(false);
      setHasBasicCodeFormat(false);
      setWizardData({});
      step1Form.reset();
      step2Form.reset();
      step3Form.reset();
      // Clear any pending validation timer
      if (validationTimer) {
        clearTimeout(validationTimer);
        setValidationTimer(null);
      }
    }
  }, [open, step1Form, step2Form, step3Form, validationTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimer) {
        clearTimeout(validationTimer);
      }
    };
  }, [validationTimer]);









  // Handle step navigation
  const handleNextStep = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        // Simple validation for step 1
        const currentCode = step1Form.getValues().code;

        if (!currentCode || !currentCode.trim()) {
          step1Form.setError("code", {
            type: "manual",
            message: "Code is required",
          });
          return;
        }

        // Auto-fix the code by converting to uppercase and removing invalid chars
        const fixedCode = currentCode.toUpperCase().replace(/[^A-Z_]/g, '');

        if (fixedCode.length === 0) {
          step1Form.setError("code", {
            type: "manual",
            message: "Please enter a valid code with letters",
          });
          return;
        }

        if (fixedCode.length > 50) {
          step1Form.setError("code", {
            type: "manual",
            message: "Code must be 50 characters or less",
          });
          return;
        }

        // Allow underscores anywhere - user requested only A-Z and _ validation

        // Set the fixed code and clear errors
        step1Form.setValue("code", fixedCode);
        step1Form.clearErrors("code");

        // Check uniqueness
        try {
          const existingTypes = await lineElementsService.elementTypes.getAll();
          const codeExists = existingTypes.some(
            (type) => type.code.toLowerCase() === fixedCode.toLowerCase()
          );

          if (codeExists) {
            step1Form.setError("code", {
              type: "manual",
              message: "This code already exists. Please choose a different code.",
            });
            return;
          }

          // Success - proceed to next step
          const data = { code: fixedCode };
          setWizardData((prev) => ({ ...prev, ...data }));
          setCurrentStep(2);
        } catch (error) {
          console.error("Error validating code uniqueness:", error);
          toast.error("Failed to validate code. Please try again.");
        }
        break;
      case 2:
        isValid = await step2Form.trigger();
        if (isValid) {
          const data = step2Form.getValues();
          setWizardData((prev) => ({ ...prev, ...data }));
          setCurrentStep(3);
        }
        break;
      case 3:
        isValid = await step3Form.trigger();
        if (isValid) {
          const data = step3Form.getValues();
          setWizardData((prev) => ({ ...prev, ...data }));
          setCurrentStep(4);
        }
        break;
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit the form
  const handleSubmit = async () => {
    if (
      !wizardData.code ||
      !wizardData.typeElement
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const createRequest: CreateLignesElementTypeRequest = {
        code: wizardData.code,
        typeElement: wizardData.typeElement,
        description:
          wizardData.description && wizardData.description.trim()
            ? wizardData.description.trim()
            : `${wizardData.typeElement} element type`,
        tableName: wizardData.typeElement === "Item" ? "Items" : "General Accounts",
      };

      await lineElementsService.elementTypes.create(createRequest);
      toast.success("Element type created successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create element type:", error);
      toast.error("Failed to create element type");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Code Validation", icon: Tag },
    { number: 2, title: "Type Selection", icon: Database },
    { number: 3, title: "Basic Information", icon: FileText },
    { number: 4, title: "Review & Submit", icon: Eye },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0a1033] border-blue-900/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-white flex items-center">
            <Tag className="mr-3 h-6 w-6 text-blue-400" />
            Create New Element Type
          </DialogTitle>
          <DialogDescription className="text-blue-300">
            Follow the steps to create a new line element type with proper
            associations
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6 px-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep > step.number
                  ? "bg-green-600 border-green-600 text-white"
                  : currentStep === step.number
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-blue-900/50 text-blue-400 bg-[#111633]"
                  }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${currentStep >= step.number ? "text-white" : "text-blue-400"
                    }`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-4 h-4 w-4 text-blue-600" />
              )}
            </div>
          ))}
        </div>

        <Separator className="bg-blue-900/30 mb-6" />

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* Step 1: Code Validation */}
          {currentStep === 1 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-blue-400" />
                  Step 1: Unique Code Validation
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Enter a unique code for the element type. This code will be
                  used to identify the element type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...step1Form}>
                  <FormField
                    control={step1Form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Element Type Code *
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter unique code (e.g., ITEMOFFICE)"
                              {...field}
                              className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 pr-10"
                              autoComplete="off"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck="false"
                              onChange={(e) => {
                                // Allow free typing but validate immediately
                                const value = e.target.value;
                                field.onChange(value);

                                // Reset validation states
                                setIsCodeValid(false);
                                setHasBasicCodeFormat(false);

                                // Clear any pending validation timers
                                if (validationTimer) {
                                  clearTimeout(validationTimer);
                                  setValidationTimer(null);
                                }

                                // IMMEDIATE VALIDATION: Check if value contains only A-Z and _
                                if (value.trim().length > 0) {
                                  // Check for invalid characters (anything other than A-Z and _)
                                  if (!/^[A-Z_]*$/.test(value)) {
                                    setHasBasicCodeFormat(false);
                                    setIsCodeValid(false);
                                    step1Form.setError("code", {
                                      type: "manual",
                                      message: "⚠️ Only UPPERCASE LETTERS (A-Z) and UNDERSCORES (_) are allowed!"
                                    });
                                  } else if (/^[A-Z_]+$/.test(value)) {
                                    // Valid format - only A-Z and _
                                    setHasBasicCodeFormat(true);
                                    setIsCodeValid(true);
                                    step1Form.clearErrors("code");
                                  } else {
                                    // Clear errors if empty or partially valid
                                    step1Form.clearErrors("code");
                                  }
                                } else {
                                  // Clear errors if empty
                                  step1Form.clearErrors("code");
                                }
                              }}
                              onBlur={() => {
                                // Final validation on blur
                                const code = field.value;
                                if (code && code.trim().length > 0) {
                                  // Check basic format - must be only A-Z and _
                                  if (/^[A-Z_]+$/.test(code)) {
                                    setHasBasicCodeFormat(true);
                                    setIsCodeValid(true);
                                    step1Form.clearErrors("code");
                                  } else {
                                    setHasBasicCodeFormat(false);
                                    setIsCodeValid(false);
                                    step1Form.setError("code", {
                                      type: "manual",
                                      message: "❌ Code must contain ONLY UPPERCASE LETTERS (A-Z) and UNDERSCORES (_)"
                                    });
                                  }
                                }
                              }}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isValidatingCode && (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                              )}
                              {!isValidatingCode && isCodeValid && (
                                <Check className="h-4 w-4 text-green-400" />
                              )}
                              {!isValidatingCode &&
                                !isCodeValid &&
                                field.value && (
                                  <AlertTriangle className="h-4 w-4 text-red-400" />
                                )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                        {isCodeValid && (
                          <p className="text-sm text-green-400 flex items-center">
                            <Check className="mr-1 h-3 w-3" />
                            Code is available and valid
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </Form>

                <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-300 mb-2">
                    ✅ Code Rules - ONLY THESE CHARACTERS ALLOWED:
                  </h4>
                  <ul className="text-xs text-blue-400 space-y-1">
                    <li>✅ <strong>UPPERCASE LETTERS:</strong> A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</li>
                    <li>✅ <strong>UNDERSCORES:</strong> _</li>
                    <li>❌ <strong>NOT ALLOWED:</strong> lowercase letters, numbers (0-9), special characters (!@#$%)</li>
                    <li>⚠️ <strong>ERROR SHOWS IMMEDIATELY</strong> if you type invalid characters</li>
                    <li>📏 Must be 1-50 characters long</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Type Selection */}
          {currentStep === 2 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Database className="mr-2 h-5 w-5 text-blue-400" />
                  Step 2: Type Element Selection
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Choose whether this element type will reference Items or
                  General Accounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...step2Form}>
                  <FormField
                    control={step2Form.control}
                    name="typeElement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Type Element *
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-4">
                            <Card
                              className={`cursor-pointer transition-all border-2 ${field.value === "Item"
                                ? "border-emerald-500 bg-emerald-900/20"
                                : "border-blue-900/30 bg-[#111633] hover:border-blue-700/50"
                                }`}
                              onClick={() => field.onChange("Item")}
                            >
                              <CardContent className="p-4 text-center">
                                <Package
                                  className={`h-8 w-8 mx-auto mb-2 ${field.value === "Item"
                                    ? "text-emerald-400"
                                    : "text-blue-400"
                                    }`}
                                />
                                <h3 className="font-medium text-white">
                                  Items
                                </h3>
                                <p className="text-xs text-blue-300 mt-1">
                                  Physical items and products
                                </p>
                                {field.value === "Item" && (
                                  <Check className="h-4 w-4 text-emerald-400 mx-auto mt-2" />
                                )}
                              </CardContent>
                            </Card>

                            <Card
                              className={`cursor-pointer transition-all border-2 ${field.value === "General Accounts"
                                ? "border-violet-500 bg-violet-900/20"
                                : "border-blue-900/30 bg-[#111633] hover:border-blue-700/50"
                                }`}
                              onClick={() => field.onChange("General Accounts")}
                            >
                              <CardContent className="p-4 text-center">
                                <Calculator
                                  className={`h-8 w-8 mx-auto mb-2 ${field.value === "General Accounts"
                                    ? "text-violet-400"
                                    : "text-blue-400"
                                    }`}
                                />
                                <h3 className="font-medium text-white">
                                  General Accounts
                                </h3>
                                <p className="text-xs text-blue-300 mt-1">
                                  Accounting codes and accounts
                                </p>
                                {field.value === "General Accounts" && (
                                  <Check className="h-4 w-4 text-violet-400 mx-auto mt-2" />
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Basic Information */}
          {currentStep === 3 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-400" />
                  Step 3: Basic Information
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Provide an optional description for the element type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Form {...step3Form}>
                  <FormField
                    control={step3Form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-300">
                          Description (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a brief description"
                            {...field}
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </Form>

                <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-amber-300 mb-2">
                    Information:
                  </h4>
                  <ul className="text-xs text-amber-400 space-y-1">
                    <li>
                      • Description is optional - if left empty, a description
                      will be auto-generated
                    </li>
                    <li>
                      • Auto-generated format: "[Type Element] element type"
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <Card className="bg-[#0f1642] border-blue-900/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-400" />
                  Step 4: Review & Submit
                </CardTitle>
                <CardDescription className="text-blue-300">
                  Review the information and submit to create the element type.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-blue-300 text-sm">Code</Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        <p className="text-white font-mono">
                          {wizardData.code}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-blue-300 text-sm">
                        Type Element
                      </Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        <Badge
                          className={`${wizardData.typeElement === "Item"
                            ? "bg-emerald-900/30 text-emerald-300 border-emerald-500/30"
                            : "bg-violet-900/30 text-violet-300 border-violet-500/30"
                            }`}
                        >
                          {wizardData.typeElement === "Item" ? (
                            <Package className="h-3 w-3 mr-1" />
                          ) : (
                            <Calculator className="h-3 w-3 mr-1" />
                          )}
                          {wizardData.typeElement}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-blue-300 text-sm">
                        Description
                      </Label>
                      <div className="bg-[#111633] border border-blue-900/50 rounded-md p-2">
                        <p className="text-white">
                          {wizardData.description &&
                            wizardData.description.trim()
                            ? wizardData.description
                            : `${wizardData.typeElement} element type`}
                        </p>
                        {(!wizardData.description ||
                          !wizardData.description.trim()) && (
                            <p className="text-xs text-amber-400 mt-1">
                              * Auto-generated description (no custom description
                              provided)
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-blue-900/30" />

                <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-green-300 mb-2 flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Ready to Submit
                  </h4>
                  <p className="text-xs text-green-400">
                    All required information has been provided. Click "Create
                    Element Type" to submit.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog Footer with Navigation */}
        <DialogFooter className="flex justify-between items-center pt-6 border-t border-blue-900/30">
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20"
            >
              Cancel
            </Button>

            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousStep}
                className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>

          <div className="text-sm text-blue-400">
            Step {currentStep} of {steps.length}
          </div>

          <div>
            {currentStep < 4 ? (
              <Button
                onClick={handleNextStep}
                disabled={currentStep === 1 && (!step1Form.getValues().code || step1Form.getValues().code.trim().length === 0)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create Element Type
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateElementTypeWizard;
