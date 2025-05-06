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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { Badge } from "@/components/ui/badge";
import { FileText, Info, PencilLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const SubTypeBasicInfo = () => {
  const { formData, updateForm, errors } = useSubTypeForm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: formData.name || "",
      description: formData.description || "",
    },
  });

  const handleChange = (field: keyof FormValues, value: string) => {
    form.setValue(field, value);
    updateForm({ [field]: value });
  };

  const nameValue = form.watch("name");
  const descValue = form.watch("description");

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
            Basic Information
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
                          Name <span className="text-red-400 ml-0.5">*</span>
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 font-normal text-blue-300/70 border-blue-900/50"
                        >
                          Required
                        </Badge>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Input
                            placeholder="Enter subtype name"
                            {...field}
                            onChange={(e) =>
                              handleChange("name", e.target.value)
                            }
                            className="h-9 pl-8 bg-[#0a1033] border-blue-900/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 text-white rounded-md group-hover:border-blue-700/60 transition-all text-xs"
                          />
                          <FileText className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500/70 group-hover:text-blue-400/80 transition-colors" />
                        </div>
                      </FormControl>
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex-grow"
                  >
                    <FormItem className="space-y-1 h-full flex flex-col">
                      <div className="flex items-center justify-between flex-shrink-0">
                        <FormLabel className="text-blue-300 text-xs font-medium">
                          Description
                        </FormLabel>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 font-normal text-blue-300/70 border-blue-900/50"
                        >
                          Optional
                        </Badge>
                      </div>
                      <FormControl className="flex-grow">
                        <div className="relative group h-full">
                          <Textarea
                            placeholder="Enter subtype description"
                            {...field}
                            rows={1}
                            onChange={(e) =>
                              handleChange("description", e.target.value)
                            }
                            className="pl-8 pt-2 bg-[#0a1033] border-blue-900/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 text-white rounded-md resize-none h-full min-h-[40px] text-xs group-hover:border-blue-700/60 transition-all"
                          />
                          <PencilLine className="absolute left-2.5 top-2.5 transform h-4 w-4 text-blue-500/70 group-hover:text-blue-400/80 transition-colors" />
                        </div>
                      </FormControl>
                      <AnimatePresence>
                        {descValue && descValue.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[10px] text-green-400/70 flex items-center flex-shrink-0"
                          >
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
                            Description added
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormItem>
                  </motion.div>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
