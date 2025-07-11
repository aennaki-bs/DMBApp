import { useEffect, useState, useCallback } from "react";
import { useStepForm } from "./StepFormProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight, RefreshCw } from "lucide-react";
import api from "@/services/api/core";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import stepService from "@/services/stepService";
import { Badge } from "@/components/ui/badge";

// Define the status interface
interface Status {
  statusId: number;
  statusKey: string;
  title: string;
  description?: string;
  isRequired: boolean;
  isInitial: boolean;
  isFinal: boolean;
  isFlexible: boolean;
  circuitId: number;
  transitionInfo?: string;
}

const formSchema = z.object({
  currentStatusId: z.string().min(1, "Current status is required"),
  nextStatusId: z.string().min(1, "Next status is required"),
});

type FormValues = z.infer<typeof formSchema>;

export const StepStatusSelection = () => {
  const { formData, setFormData, registerStepForm } = useStepForm();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [nextStatusOptions, setNextStatusOptions] = useState<Status[]>([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentStatusId: formData.currentStatusId?.toString() || "",
      nextStatusId: formData.nextStatusId?.toString() || "",
    },
    mode: "onChange",
  });

  // Define fetchStatuses with useCallback to avoid dependency cycle
  const fetchStatuses = useCallback(async () => {
    if (!formData.circuitId) return;

    setIsLoadingStatuses(true);
    setFetchError(null);

    try {
      const response = await api.get(`/Circuit/${formData.circuitId}/statuses`);

      if (response.data && Array.isArray(response.data)) {
        setStatuses(response.data);
      } else {
        console.error("Invalid response format:", response.data);
        setFetchError("Received invalid status data from server");
      }
    } catch (error: any) {
      console.error("Error fetching statuses:", error);
      const errorMessage =
        error?.response?.status === 404
          ? "Status data not found for this circuit."
          : "Failed to load statuses. Please try again.";
      setFetchError(errorMessage);
    } finally {
      setIsLoadingStatuses(false);
    }
  }, [formData.circuitId]);

  // Register this form with the parent provider for validation
  useEffect(() => {
    registerStepForm(2, {
      validate: async () => {
        const result = await form.trigger();

        if (result && formData.currentStatusId && formData.nextStatusId) {
          setIsCheckingDuplicate(true);
          try {
            const exists = await stepService.checkStepExists(
              formData.circuitId,
              formData.currentStatusId,
              formData.nextStatusId
            );

            if (exists) {
              form.setError("nextStatusId", {
                type: "manual",
                message: "A step with these status transitions already exists",
              });
              setIsCheckingDuplicate(false);
              return false;
            }
          } catch (error) {
            console.error("Error checking step existence:", error);
          }
          setIsCheckingDuplicate(false);
        }

        return result;
      },
      getValues: () => form.getValues(),
    });
  }, [registerStepForm, form, formData]);

  // Fetch statuses when component mounts or circuitId changes
  useEffect(() => {
    if (formData.circuitId) {
      fetchStatuses();
    }
  }, [formData.circuitId, fetchStatuses]);

  // Update next status options when current status changes
  useEffect(() => {
    if (formData.currentStatusId) {
      const filteredStatuses = statuses.filter(
        (status) => status.statusId !== formData.currentStatusId
      );
      setNextStatusOptions(filteredStatuses);
    } else {
      setNextStatusOptions([]);
    }
  }, [formData.currentStatusId, statuses]);

  const handleCurrentStatusChange = (value: string) => {
    const numericValue = parseInt(value, 10);
    form.setValue("currentStatusId", value);
    setFormData({ currentStatusId: numericValue });

    // Clear next status when current status changes
    form.setValue("nextStatusId", "");
    setFormData({ nextStatusId: undefined });
  };

  const handleNextStatusChange = (value: string) => {
    const numericValue = parseInt(value, 10);
    form.setValue("nextStatusId", value);
    setFormData({ nextStatusId: numericValue });
  };

  const getStatusById = (statusId?: number): Status | undefined => {
    if (!statusId) return undefined;
    return statuses.find((status) => status.statusId === statusId);
  };

  const renderStatusBadges = (status?: Status) => {
    if (!status) return null;

    return (
      <div className="flex gap-1.5 mt-1">
        {status.isInitial && (
          <Badge
            variant="default"
            className="px-1.5 py-0.5 bg-green-900/30 text-green-400 border-green-500/30"
          >
            Initial
          </Badge>
        )}
        {status.isFinal && (
          <Badge
            variant="destructive"
            className="px-1.5 py-0.5 bg-red-900/30 text-red-400 border-red-500/30"
          >
            Final
          </Badge>
        )}
        {status.isRequired && !status.isInitial && !status.isFinal && (
          <Badge
            variant="secondary"
            className="px-1.5 py-0.5 bg-blue-900/30 text-blue-400 border-blue-500/30"
          >
            Required
          </Badge>
        )}
      </div>
    );
  };

  const renderStatusOption = (status: Status) => (
    <option key={status.statusId} value={status.statusId.toString()}>
      {status.title}
      {status.isInitial ? " (Initial)" : ""}
      {status.isFinal ? " (Final)" : ""}
      {status.isRequired && !status.isInitial && !status.isFinal
        ? " (Required)"
        : ""}
    </option>
  );

  if (fetchError) {
    return (
      <Card className="border border-red-900/30 bg-gradient-to-b from-[#330a0a] to-[#41150d] shadow-md rounded-lg">
        <CardContent className="p-3">
          <div className="p-4 text-center">
            <p className="text-red-300 mb-2">{fetchError}</p>
            <button
              className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-900/50 rounded text-blue-300 text-sm flex items-center justify-center mx-auto"
              onClick={fetchStatuses}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md rounded-lg">
      <CardContent className="p-3">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="currentStatusId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-300 text-xs font-medium">
                    Current Status
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleCurrentStatusChange(e.target.value);
                      }}
                      disabled={isLoadingStatuses}
                      className="w-full bg-[#0d1541]/70 border border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md h-8 text-xs px-3 py-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        Select current status
                      </option>
                      {isLoadingStatuses ? (
                        <option disabled>Loading statuses...</option>
                      ) : statuses.length === 0 ? (
                        <option disabled>No statuses available</option>
                      ) : (
                        statuses.map(renderStatusOption)
                      )}
                    </select>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-center py-1">
              <ArrowRight className="h-4 w-4 text-blue-500" />
            </div>

            <FormField
              control={form.control}
              name="nextStatusId"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-gray-300 text-xs font-medium">
                    Next Status
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNextStatusChange(e.target.value);
                      }}
                      disabled={
                        isLoadingStatuses ||
                        !formData.currentStatusId ||
                        isCheckingDuplicate
                      }
                      className="w-full bg-[#0d1541]/70 border border-blue-900/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white rounded-md h-8 text-xs px-3 py-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>
                        Select next status
                      </option>
                      {isLoadingStatuses ? (
                        <option disabled>Loading statuses...</option>
                      ) : !formData.currentStatusId ? (
                        <option disabled>Select current status first</option>
                      ) : nextStatusOptions.length === 0 ? (
                        <option disabled>No available next statuses</option>
                      ) : (
                        nextStatusOptions.map(renderStatusOption)
                      )}
                    </select>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {isCheckingDuplicate && (
              <div className="flex items-center justify-center text-xs text-blue-400">
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Checking for duplicate steps...
              </div>
            )}

            {/* Status transition visualization */}
            {formData.currentStatusId && formData.nextStatusId && (
              <div className="mt-3 p-2 bg-blue-900/20 border border-blue-900/30 rounded-md">
                <Label className="text-xs text-gray-400 mb-1 block">
                  Status Transition:
                </Label>
                <div className="flex items-center justify-between text-xs">
                  <div className="px-2 py-1 bg-blue-900/30 rounded text-blue-300 flex-1">
                    <div className="truncate">
                      {getStatusById(formData.currentStatusId)?.title ||
                        "Current"}
                    </div>
                    {renderStatusBadges(
                      getStatusById(formData.currentStatusId)
                    )}
                  </div>
                  <ArrowRight className="h-3 w-3 text-blue-500 mx-2 flex-shrink-0" />
                  <div className="px-2 py-1 bg-blue-900/30 rounded text-blue-300 flex-1">
                    <div className="truncate">
                      {getStatusById(formData.nextStatusId)?.title || "Next"}
                    </div>
                    {renderStatusBadges(getStatusById(formData.nextStatusId))}
                  </div>
                </div>
                {getStatusById(formData.currentStatusId)?.description ||
                getStatusById(formData.nextStatusId)?.description ? (
                  <div className="mt-2 text-xs text-gray-400">
                    {getStatusById(formData.currentStatusId)?.description && (
                      <div className="mb-1">
                        <span className="text-blue-400">Current: </span>
                        {getStatusById(formData.currentStatusId)?.description}
                      </div>
                    )}
                    {getStatusById(formData.nextStatusId)?.description && (
                      <div>
                        <span className="text-blue-400">Next: </span>
                        {getStatusById(formData.nextStatusId)?.description}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
