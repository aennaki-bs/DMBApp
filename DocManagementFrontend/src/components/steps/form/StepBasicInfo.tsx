import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStepForm } from "./StepFormProvider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Edit3, Sparkles } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  descriptif: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const StepBasicInfo = () => {
  const { formData, setFormData, registerStepForm } = useStepForm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formData.title || "",
      descriptif: formData.descriptif || "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(1, {
      validate: async () => {
        const result = await form.trigger();
        return result;
      },
      getValues: () => form.getValues(),
    });
  }, [registerStepForm, form]);

  // Update the parent form data when form values change
  const handleChange = (field: keyof FormValues, value: string) => {
    form.setValue(field, value);
    setFormData({ [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-xl mx-auto"
    >
      <Card className="border border-slate-800/50 bg-gradient-to-br from-slate-900/80 via-slate-800/40 to-slate-900/80 backdrop-blur-sm shadow-xl">
        {/* Compact Header */}
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30"
            >
              <FileText className="h-3.5 w-3.5 text-blue-400" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-white">Step Information</h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-blue-400/60" />
                Define the basic details for your workflow step
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Form {...form}>
            <form className="space-y-4">
              {/* Step Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                      <Edit3 className="h-3 w-3 text-blue-400" />
                      Step Title
                      <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <Input
                          placeholder="Enter a descriptive title for this step..."
                          {...field}
                          onChange={(e) => handleChange("title", e.target.value)}
                          className="h-9 bg-slate-800/60 border-slate-700/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white placeholder:text-slate-500 rounded-lg transition-all duration-200 hover:bg-slate-800/80"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                    {field.value && field.value.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"
                      >
                        ✓ Title looks good
                      </motion.div>
                    )}
                  </FormItem>
                )}
              />

              {/* Step Description Field */}
              <FormField
                control={form.control}
                name="descriptif"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-slate-300 text-sm font-medium flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-blue-400" />
                      Description
                      <span className="text-xs text-slate-500">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <motion.div
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      >
                        <Textarea
                          placeholder="Provide a detailed description of what happens in this step..."
                          {...field}
                          rows={3}
                          onChange={(e) => handleChange("descriptif", e.target.value)}
                          className="bg-slate-800/60 border-slate-700/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 text-white placeholder:text-slate-500 rounded-lg resize-none transition-all duration-200 hover:bg-slate-800/80 min-h-[70px]"
                        />
                      </motion.div>
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">
                        Help users understand the purpose of this step
                      </span>
                      {field.value && (
                        <span className="text-blue-400">
                          {field.value.length} characters
                        </span>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </form>
          </Form>

        </CardContent>
      </Card>
    </motion.div>
  );
};
