import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, ChevronRight, X, FileType } from "lucide-react";
import { Form } from "@/components/ui/form";
import documentService from "@/services/documentService";
import { DocumentType } from "@/models/document";
import { TypeNameStep } from "./steps/TypeNameStep";
import { TypeCodeStep } from "./steps/TypeCodeStep";
import { TypeDetailsStep } from "./steps/TypeDetailsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { StepIndicator } from "./steps/StepIndicator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const typeSchema = z.object({
  typeName: z.string().min(2, "Type name must be at least 2 characters."),
  typeKey: z
    .string()
    .min(2, "Type code must be at least 2 characters.")
    .max(3, "Type code must be at most 3 characters.")
    .optional(),
  typeAttr: z.string().optional(),
});

type DocumentTypeFormProps = {
  documentType?: DocumentType | null;
  isEditMode?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
};

export const DocumentTypeForm = ({
  documentType,
  isEditMode = false,
  onSuccess,
  onCancel,
}: DocumentTypeFormProps) => {
  const [step, setStep] = useState(1);
  const [isTypeNameValid, setIsTypeNameValid] = useState<boolean | null>(null);
  const [isTypeCodeValid, setIsTypeCodeValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [skipTypeCode, setSkipTypeCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof typeSchema>>({
    resolver: zodResolver(typeSchema),
    defaultValues: {
      typeName: documentType?.typeName || "",
      typeKey: documentType?.typeKey || "",
      typeAttr: documentType?.typeAttr || "",
    },
  });

  useEffect(() => {
    if (documentType && isEditMode) {
      form.reset({
        typeName: documentType.typeName || "",
        typeKey: documentType.typeKey || "",
        typeAttr: documentType.typeAttr || "",
      });

      if (isEditMode) {
        // In edit mode, go to the details step directly
        setStep(3);
      }
    }
  }, [documentType, isEditMode, form]);

  const validateTypeName = async (typeName: string) => {
    if (isEditMode && typeName === documentType?.typeName) {
      return true;
    }

    if (typeName.length < 2) return false;

    setIsValidating(true);
    try {
      const exists = await documentService.validateTypeName(typeName);
      setIsTypeNameValid(!exists);
      return !exists;
    } catch (error) {
      console.error("Error validating type name:", error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const validateTypeCode = async (typeKey: string) => {
    if (isEditMode && typeKey === documentType?.typeKey) {
      return true;
    }

    if (!typeKey || typeKey.length < 2 || typeKey.length > 3) return false;

    setIsValidating(true);
    try {
      const isValid = await documentService.validateTypeCode(typeKey);
      setIsTypeCodeValid(isValid);
      return isValid;
    } catch (error) {
      console.error("Error validating type code:", error);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const generateTypeCode = async () => {
    const typeName = form.getValues("typeName");
    if (typeName) {
      setIsValidating(true);
      try {
        const code = await documentService.generateTypeCode(typeName);
        form.setValue("typeKey", code);
        setIsTypeCodeValid(true);
      } catch (error) {
        console.error("Error generating type code:", error);
      } finally {
        setIsValidating(false);
      }
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      const typeName = form.getValues("typeName");
      const isValid = await validateTypeName(typeName);

      if (isValid) {
        // Generate type code if not provided
        if (!skipTypeCode && !form.getValues("typeKey")) {
          await generateTypeCode();
        }
        setStep(2);
      } else {
        form.setError("typeName", {
          type: "manual",
          message: "This type name already exists.",
        });
      }
    } else if (step === 2) {
      if (skipTypeCode) {
        // Skip type code validation if user opted to skip
        form.setValue("typeKey", "");
        setStep(3);
      } else {
        const typeKey = form.getValues("typeKey");
        if (!typeKey || typeKey.trim() === "") {
          // If empty, move to next step and let backend generate
          setStep(3);
        } else {
          const isValid = await validateTypeCode(typeKey);

          if (isValid) {
            setStep(3);
          } else {
            form.setError("typeKey", {
              type: "manual",
              message: "This type code is invalid or already exists.",
            });
          }
        }
      }
    } else if (step === 3) {
      // Move to review
      setStep(4);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCancel = () => {
    setStep(1);
    form.reset();
    onCancel();
  };

  const onTypeNameChange = () => {
    setIsTypeNameValid(null);
    // Clear the error when user changes the name
    form.clearErrors("typeName");
  };

  const onTypeCodeChange = () => {
    setIsTypeCodeValid(null);
    // Clear the error when user changes the code
    form.clearErrors("typeKey");
  };

  const onSkipTypeCodeChange = (skip: boolean) => {
    setSkipTypeCode(skip);
    if (skip) {
      // If skipping, clear any type code errors
      form.clearErrors("typeKey");
    }
  };

  const onSubmit = async (data: z.infer<typeof typeSchema>) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      if (isEditMode && documentType?.id) {
        await documentService.updateDocumentType(documentType.id, {
          typeName: data.typeName,
          typeKey: skipTypeCode ? undefined : data.typeKey,
          typeAttr: data.typeAttr || undefined,
          documentCounter: documentType.documentCounter,
        });
        toast.success("Document type updated successfully");
      } else {
        await documentService.createDocumentType({
          typeName: data.typeName,
          typeKey: skipTypeCode ? undefined : data.typeKey,
          typeAttr: data.typeAttr || undefined,
        });
        toast.success("Document type created successfully");
      }
      form.reset();
      setStep(1);
      onSuccess();
    } catch (error: any) {
      console.error(
        isEditMode
          ? "Failed to update document type:"
          : "Failed to create document type:",
        error
      );

      // Extract specific error message if available
      let errorMessage = isEditMode
        ? "Failed to update document type"
        : "Failed to create document type";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.errors) {
          // Handle validation errors array
          if (Array.isArray(error.response.data.errors)) {
            errorMessage = error.response.data.errors.join(". ");
          } else if (typeof error.response.data.errors === "object") {
            // Handle validation errors object
            errorMessage = Object.values(error.response.data.errors)
              .flat()
              .join(". ");
          }
        }
      } else if (error.message) {
        // If no response data but there's an error message
        errorMessage = error.message;
      }

      toast.error(
        `${isEditMode ? "Update" : "Creation"} failed: ${errorMessage}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    if (isEditMode) return "Edit Document Type";

    switch (step) {
      case 1:
        return "Type Name";
      case 2:
        return "Type Code";
      case 3:
        return "Type Details";
      case 4:
        return "Review";
      default:
        return "Document Type";
    }
  };

  const getStepDescription = () => {
    if (isEditMode) return "Update document type details";

    switch (step) {
      case 1:
        return "Create a unique name for this document type";
      case 2:
        return "Provide a unique 2-3 character code (optional)";
      case 3:
        return "Add additional description for this document type";
      case 4:
        return "Review your document type details before creation";
      default:
        return "";
    }
  };

  // Separate form for review step to ensure proper submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form.getValues());
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={handleCancel}
    >
      <motion.div
        className="w-full max-w-2xl mx-auto bg-[#1a2251] rounded-lg shadow-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-center border-b border-blue-900/30">
          <div className="flex items-center">
            <FileType className="h-6 w-6 text-blue-400 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-white">
                Create Document Type
              </h2>
              <p className="text-sm text-blue-300 mt-1">
                Create a new document type for your organization
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isEditMode && <StepIndicator currentStep={step} totalSteps={4} />}

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white">{getStepTitle()}</h3>
            <p className="text-sm text-blue-300 mt-1">{getStepDescription()}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {step < 4 ? (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {step === 1 && (
                      <TypeNameStep
                        control={form.control}
                        isTypeNameValid={isTypeNameValid}
                        isValidating={isValidating}
                        onTypeNameChange={onTypeNameChange}
                      />
                    )}

                    {step === 2 && (
                      <TypeCodeStep
                        control={form.control}
                        isTypeCodeValid={isTypeCodeValid}
                        isValidating={isValidating}
                        onTypeCodeChange={onTypeCodeChange}
                        onGenerateCode={generateTypeCode}
                        skipTypeCode={skipTypeCode}
                        onSkipChange={onSkipTypeCodeChange}
                      />
                    )}

                    {step === 3 && <TypeDetailsStep control={form.control} />}
                  </form>
                </Form>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <ReviewStep
                    data={{
                      typeName: form.getValues("typeName"),
                      typeKey: skipTypeCode
                        ? "(Will be generated automatically)"
                        : form.getValues("typeKey") ||
                          "(Will be generated automatically)",
                      typeAttr: form.getValues("typeAttr"),
                    }}
                  />
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-blue-900/30 flex justify-between">
          {step === 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-5 py-2 bg-transparent border-blue-800/50 hover:bg-blue-900/30 text-blue-300"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              className="px-5 py-2 bg-transparent border-blue-800/50 hover:bg-blue-900/30 text-blue-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}

          <Button
            type="button"
            onClick={step === 4 ? handleReviewSubmit : nextStep}
            disabled={
              isValidating ||
              (step === 1 &&
                (!form.getValues("typeName") ||
                  form.getValues("typeName").length < 2)) ||
              (step === 2 &&
                !skipTypeCode &&
                form.getValues("typeKey") &&
                (form.getValues("typeKey").length < 2 ||
                  form.getValues("typeKey").length > 3))
            }
            className={`px-5 py-2 ${
              isValidating
                ? "bg-blue-800 text-blue-100"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : step === 4 ? (
              isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Type"
              )
            ) : (
              <>
                {step === 3 ? "Review" : "Next"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentTypeForm;
