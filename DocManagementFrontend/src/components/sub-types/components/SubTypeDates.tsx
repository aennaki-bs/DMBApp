import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubTypeForm } from "./SubTypeFormProvider";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CalendarDays, Info, Power } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  startDate: z.union([z.string().min(1, "Start date is required"), z.date()]),
  endDate: z.union([z.string().min(1, "End date is required"), z.date()]),
  isActive: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export const SubTypeDates = () => {
  const { formData, updateForm, errors } = useSubTypeForm();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: formData.startDate
        ? formData.startDate instanceof Date
          ? formData.startDate.toISOString().split("T")[0]
          : formData.startDate
        : new Date().toISOString().split("T")[0],
      endDate: formData.endDate
        ? formData.endDate instanceof Date
          ? formData.endDate.toISOString().split("T")[0]
          : formData.endDate
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            .toISOString()
            .split("T")[0],
      isActive: formData.isActive ?? true,
    },
  });

  // Convert dates to strings if needed
  const getDateString = (dateValue: Date | string | undefined): string => {
    if (!dateValue) return "";
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split("T")[0];
    }
    return dateValue;
  };

  const handleChange = (field: keyof FormValues, value: any) => {
    form.setValue(field, value);
    updateForm({ [field]: value });
  };

  const startDateValue = form.watch("startDate");
  const endDateValue = form.watch("endDate");
  const isActiveValue = form.watch("isActive");

  // Calculate duration between dates
  const calculateDuration = () => {
    if (!startDateValue || !endDateValue) return null;

    const start = new Date(startDateValue);
    const end = new Date(endDateValue);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    // Check if end date is before start date
    if (end < start)
      return { valid: false, message: "End date must be after start date" };

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Calculate months and years
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    // Handle edge case where day of month affects month calculation
    if (end.getDate() < start.getDate()) {
      months--;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    let durationText = "";
    if (years > 0) {
      durationText += `${years} year${years > 1 ? "s" : ""}`;
      if (remainingMonths > 0)
        durationText += ` ${remainingMonths} month${
          remainingMonths > 1 ? "s" : ""
        }`;
    } else if (months > 0) {
      durationText += `${months} month${months > 1 ? "s" : ""}`;
    } else {
      durationText += `${diffDays} day${diffDays > 1 ? "s" : ""}`;
    }

    return { valid: true, days: diffDays, text: durationText };
  };

  const duration = calculateDuration();

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
            <CalendarClock className="h-4 w-4 mr-2 text-blue-400" />
            Date Range and Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 flex-grow">
          <Form {...form}>
            <form className="space-y-3 h-full flex flex-col">
              <div className="bg-blue-900/10 rounded-md p-3 border border-blue-900/20 flex-shrink-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-blue-300 text-xs font-medium flex items-center">
                              Start Date{" "}
                              <span className="text-red-400 ml-0.5">*</span>
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
                                type="date"
                                {...field}
                                value={
                                  typeof field.value === "string"
                                    ? field.value
                                    : getDateString(field.value)
                                }
                                onChange={(e) =>
                                  handleChange("startDate", e.target.value)
                                }
                                className="h-9 pl-8 bg-[#0a1033] border-blue-900/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 text-white rounded-md text-xs group-hover:border-blue-700/60 transition-all"
                              />
                              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/70 group-hover:text-blue-400/80 transition-colors" />
                            </div>
                          </FormControl>
                          <AnimatePresence>
                            {errors.startDate && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-400 text-[10px] flex items-center"
                              >
                                <Info className="h-3 w-3 mr-1" />
                                {errors.startDate}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-blue-300 text-xs font-medium flex items-center">
                              End Date{" "}
                              <span className="text-red-400 ml-0.5">*</span>
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
                                type="date"
                                {...field}
                                value={
                                  typeof field.value === "string"
                                    ? field.value
                                    : getDateString(field.value)
                                }
                                onChange={(e) =>
                                  handleChange("endDate", e.target.value)
                                }
                                className="h-9 pl-8 bg-[#0a1033] border-blue-900/50 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 text-white rounded-md text-xs group-hover:border-blue-700/60 transition-all"
                              />
                              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500/70 group-hover:text-blue-400/80 transition-colors" />
                            </div>
                          </FormControl>
                          <AnimatePresence>
                            {errors.endDate && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-red-400 text-[10px] flex items-center"
                              >
                                <Info className="h-3 w-3 mr-1" />
                                {errors.endDate}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </FormItem>
                      )}
                    />
                  </motion.div>
                </div>

                {/* Duration indicator */}
                <AnimatePresence>
                  {duration && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-2 text-xs ${
                        duration.valid
                          ? "text-blue-300/80"
                          : "text-amber-400/80"
                      } p-2 rounded bg-blue-900/20 border border-blue-900/30 flex items-center`}
                    >
                      <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                      {duration.valid ? (
                        <span>
                          Duration:{" "}
                          <span className="text-blue-300">{duration.text}</span>
                        </span>
                      ) : (
                        <span className="text-amber-400">
                          {duration.message}
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-shrink-0"
              >
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="bg-blue-900/10 rounded-md p-3 border border-blue-900/20">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <FormLabel className="text-blue-300 text-xs font-medium flex items-center">
                            <Power className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                            Status
                          </FormLabel>
                          <p className="text-[10px] text-blue-300/70">
                            {field.value
                              ? "This subtype will be available for selection"
                              : "This subtype will be hidden from selection"}
                          </p>
                        </div>
                        <FormControl>
                          <div className="flex flex-col items-end space-y-1">
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) =>
                                handleChange("isActive", checked)
                              }
                              className="data-[state=checked]:bg-blue-500 h-5 w-9"
                            />
                            <span
                              className={`text-[10px] font-medium ${
                                field.value ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              {field.value ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
