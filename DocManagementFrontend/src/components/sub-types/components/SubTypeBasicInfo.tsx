import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { Badge } from "@/components/ui/badge";
import { FileText, Info, PencilLine, Lightbulb, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Code must be at least 2 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export const SubTypeBasicInfo = () => {
  const { formData, updateForm, errors } = useSubTypeForm();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: formData.name || "",
    },
  });

  const handleChange = (field: keyof FormValues, value: string) => {
    form.setValue(field, value);
    updateForm({ [field]: value });
  };

  const nameValue = form.watch("name");

  // Generate code suggestions based on dates
  const generateCodeSuggestions = () => {
    const suggestions = [];
    const currentDate = new Date();
    const startDate = formData.startDate
      ? new Date(formData.startDate)
      : currentDate;

    // Get year and month
    const year = startDate.getFullYear().toString().slice(-2);
    const month = (startDate.getMonth() + 1).toString().padStart(2, "0");

    // Generate suggestions
    suggestions.push(`STR-${year}${month}`); // STR-YYMM
    suggestions.push(`STN-${year}-${month}`); // STN-YY-MM
    suggestions.push(`TYN-${year}`); // TYN-YY

    return suggestions;
  };

  const suggestions = generateCodeSuggestions();

  const applySuggestion = (suggestion: string) => {
    handleChange("name", suggestion);
    setShowSuggestions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-lg rounded-lg overflow-hidden h-full flex flex-col">
        <CardHeader className="bg-blue-900/20 p-2 border-b border-blue-900/30 flex-shrink-0">
          <CardTitle className="text-sm text-blue-300 flex items-center">
            <PencilLine className="h-4 w-4 mr-2 text-blue-400" />
            Enter Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 flex-grow">
          <Form {...form}>
            <form className="space-y-3 h-full flex flex-col">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex-shrink-0"
                  >
                    <FormItem className="space-y-1">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-blue-300 text-xs font-medium flex items-center">
                          Code <span className="text-red-400 ml-0.5">*</span>
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 font-normal text-blue-300/70 border-blue-900/50"
                        >
                          Required
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative group flex-1">
                          <FormControl>
                            <Input
                              placeholder="Enter strain code"
                              {...field}
                              onChange={(e) =>
                                handleChange("name", e.target.value)
                              }
                              className="h-9 pl-8 bg-[#0a1033] border-blue-900/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 text-white rounded-md group-hover:border-blue-700/60 transition-all text-xs"
                            />
                          </FormControl>
                          <FileText className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500/70 group-hover:text-blue-400/80 transition-colors" />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSuggestions(!showSuggestions)}
                          className="h-9 px-2 bg-blue-900/30 border-blue-900/40 hover:bg-blue-800/40 text-blue-300"
                          title="Show code suggestions"
                        >
                          <Lightbulb className="h-4 w-4" />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-900/30 rounded-md p-2 border border-blue-900/40 mt-2"
                          >
                            <div className="text-xs text-blue-300 mb-2 flex items-center">
                              <Lightbulb className="h-3.5 w-3.5 mr-1.5 text-amber-400/80" />
                              <span>
                                Suggested codes based on selected dates:
                              </span>
                            </div>
                            <div className="space-y-2">
                              {suggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-blue-900/40 p-2 rounded-md hover:bg-blue-800/40 transition-colors cursor-pointer"
                                  onClick={() => applySuggestion(suggestion)}
                                >
                                  <span className="text-sm text-white font-medium">
                                    {suggestion}
                                  </span>
                                  <div className="flex items-center text-blue-400 text-xs">
                                    <Copy className="h-3 w-3 mr-1" />
                                    Apply
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-[10px] text-blue-400/70 mt-2">
                              Choose a code that is meaningful and relates to
                              your document strain's purpose and date range.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {errors.name && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-red-400 text-[10px] flex items-center"
                          >
                            <Info className="h-3 w-3 mr-1" />
                            {errors.name}
                          </motion.p>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {nameValue && nameValue.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] text-blue-400/60"
                          >
                            {nameValue.length < 2 ? (
                              <span className="flex items-center text-amber-400/80">
                                <Info className="h-3 w-3 mr-1" /> At least 2
                                characters required
                              </span>
                            ) : (
                              <span className="flex items-center text-green-400/80">
                                <svg
                                  className="h-3 w-3 mr-1"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                Looks good!
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  </motion.div>
                )}
              />

              <div className="mt-2 bg-blue-900/20 p-2 rounded-md border border-blue-900/30">
                <p className="text-xs text-blue-300/90">
                  <Info className="h-3.5 w-3.5 inline-block mr-1 text-blue-400/80" />
                  Enter a meaningful code that identifies this strain. Consider
                  using a format that includes information about the document
                  type and date range (e.g., TYN-23 for Type Year Number).
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
