import { useState } from "react";
import {
  Plus,
  FileText,
  Ban,
  Check,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Document, CreateLigneRequest } from "@/models/document";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import documentService from "@/services/documentService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

interface CreateLigneDialogProps {
  document: Document;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 1 | 2 | 3;

interface FormValues {
  title: string;
  article: string;
  prix: number;
}

const CreateLigneDialog = ({
  document,
  isOpen,
  onOpenChange,
}: CreateLigneDialogProps) => {
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    title: "",
    article: "",
    prix: 0,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});

  const queryClient = useQueryClient();

  const resetForm = () => {
    setFormValues({
      title: "",
      article: "",
      prix: 0,
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

  const handleNext = () => {
    if (step === 1) {
      if (!formValues.title || formValues.title.trim().length < 3) {
        setErrors({ ...errors, title: "Title must be at least 3 characters" });
        return;
      }
    } else if (step === 2) {
      if (!formValues.article || formValues.article.trim().length < 3) {
        setErrors({
          ...errors,
          article: "Description must be at least 3 characters",
        });
        return;
      }
    }

    setStep((prev) => (prev + 1) as Step);
  };

  const handleBack = () => {
    setStep((prev) => (prev - 1) as Step);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const newLigne: CreateLigneRequest = {
        documentId: document.id,
        title: formValues.title,
        article: formValues.article,
        prix: formValues.prix,
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] p-0 bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden">
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

        {/* Step indicators */}
        <div className="px-6 pt-6">
          <div className="flex justify-between mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-blue-900/50 text-blue-300"
                }`}
              >
                1
              </div>
              <span className={step >= 1 ? "text-blue-100" : "text-blue-400"}>
                Title
              </span>
            </div>
            <div className="flex-1 mx-2 mt-4">
              <div
                className={`h-0.5 ${
                  step >= 2 ? "bg-blue-600" : "bg-blue-900/50"
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-blue-900/50 text-blue-300"
                }`}
              >
                2
              </div>
              <span className={step >= 2 ? "text-blue-100" : "text-blue-400"}>
                Description
              </span>
            </div>
            <div className="flex-1 mx-2 mt-4">
              <div
                className={`h-0.5 ${
                  step >= 3 ? "bg-blue-600" : "bg-blue-900/50"
                }`}
              ></div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-blue-900/50 text-blue-300"
                }`}
              >
                3
              </div>
              <span className={step >= 3 ? "text-blue-100" : "text-blue-400"}>
                Price
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-blue-200">
                      Title<span className="text-red-400">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formValues.title}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      placeholder="Enter line title"
                      className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handleClose}
                      className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
                    >
                      <Ban className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Next <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="article" className="text-blue-200">
                      Article Description<span className="text-red-400">*</span>
                    </Label>
                    <Textarea
                      id="article"
                      value={formValues.article}
                      onChange={(e) =>
                        handleFieldChange("article", e.target.value)
                      }
                      placeholder="Enter article description"
                      rows={4}
                      className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
                    />
                    {errors.article && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.article}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      Next <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prix" className="text-blue-200">
                      Price (MAD)<span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="prix"
                        type="number"
                        value={formValues.prix}
                        onChange={(e) =>
                          handleFieldChange("prix", Number(e.target.value))
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400 pl-12"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none bg-blue-900/30 border-r border-blue-400/20 text-blue-300 font-medium rounded-l-md">
                        MAD
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
                    <h3 className="text-blue-200 font-medium mb-2">Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-blue-400">Title:</span>
                      <span className="text-white">{formValues.title}</span>
                      <span className="text-blue-400">Description:</span>
                      <span className="text-white">
                        {formValues.article.length > 50
                          ? `${formValues.article.substring(0, 50)}...`
                          : formValues.article}
                      </span>
                      <span className="text-blue-400">Price:</span>
                      <span className="text-white font-medium">
                        {formatPrice(formValues.prix)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Creating...</span>
                        </div>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" /> Create Line
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLigneDialog;
