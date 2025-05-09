import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import circuitService from "@/services/circuitService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { AlertCircle, PlusCircle, AlertTriangle, Check } from "lucide-react";

const formSchema = z.object({
  circuitId: z.string().min(1, "Please select a circuit"),
});

type FormValues = z.infer<typeof formSchema>;

interface CircuitValidation {
  circuitId: number;
  circuitTitle: string;
  hasSteps: boolean;
  totalSteps: number;
  allStepsHaveStatuses: boolean;
  isValid: boolean;
  stepsWithoutStatuses: {
    stepId: number;
    stepTitle: string;
    order: number;
  }[];
}

interface AssignCircuitDialogProps {
  documentId: number;
  documentTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AssignCircuitDialog({
  documentId,
  documentTitle,
  open,
  onOpenChange,
  onSuccess,
}: AssignCircuitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(
    null
  );
  const [selectedCircuit, setSelectedCircuit] = useState<any | null>(null);

  const { data: circuits, isLoading: isCircuitsLoading } = useQuery({
    queryKey: ["circuits"],
    queryFn: circuitService.getAllCircuits,
    enabled: open,
  });

  // Filter circuits to only include those that have steps
  const circuitsWithSteps = circuits?.filter(
    (circuit) => circuit.steps && circuit.steps.length > 0
  );

  const noCircuitsAvailable =
    !isCircuitsLoading &&
    (!circuitsWithSteps || circuitsWithSteps.length === 0);

  // Get circuit validation data - DISABLED since endpoint doesn't exist
  const { data: circuitValidation, isLoading: isValidationLoading } =
    useQuery<CircuitValidation>({
      queryKey: ["circuit-validation", selectedCircuitId],
      queryFn: async () => {
        // Return a default "valid" validation to bypass the 404 error
        return {
          circuitId: parseInt(selectedCircuitId || "0"),
          circuitTitle: "",
          hasSteps: true,
          totalSteps: 0,
          allStepsHaveStatuses: true,
          isValid: true,
          stepsWithoutStatuses: []
        };
      },
      enabled: !!selectedCircuitId && open,
    });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      circuitId: "",
    },
  });

  const handleFormSubmit = async (values: FormValues) => {
    const circuitId = parseInt(values.circuitId);
    const circuit = circuits?.find((c) => c.id === circuitId);

    if (circuit) {
      setSelectedCircuitId(circuitId.toString());
      setSelectedCircuit(circuit);

      // Basic validation
      if (!circuit.steps || circuit.steps.length === 0) {
        toast.error("Selected circuit has no steps. Please add steps to the circuit first.");
        return;
      }

      if (!circuit.statuses || circuit.statuses.length === 0) {
        toast.error("Selected circuit has no statuses. Please add statuses to the circuit first.");
        return;
      }

      // Check if there's an initial status
      const hasInitialStatus = circuit.statuses.some(status => status.isInitial);
      if (!hasInitialStatus) {
        toast.error("Selected circuit has no initial status. At least one status must be marked as initial.");
        return;
      }

      // Skip validation check since the endpoint doesn't exist
      // Just proceed to confirmation
      setShowConfirmation(true);
    }
  };

  const confirmAssignment = async () => {
    if (!selectedCircuitId) return;

    setIsSubmitting(true);
    try {
      const circuitId = parseInt(selectedCircuitId);
      
      console.log(`Assigning document ${documentId} to circuit ${circuitId}`);

      // Always activate the circuit when assigning a document
      if (selectedCircuit && !selectedCircuit.isActive) {
        console.log(`Activating circuit ${circuitId} before assignment`);
        await circuitService.updateCircuit(circuitId, {
          ...selectedCircuit,
          isActive: true,
        });
      }

      // Check if the circuit has steps before assigning
      if (!selectedCircuit?.steps || selectedCircuit.steps.length === 0) {
        toast.error("The selected circuit must have at least one step");
        return;
      }

      // Assign document to circuit
      await circuitService.assignDocumentToCircuit({
        documentId,
        circuitId: circuitId
      });

      toast.success("Document assigned to circuit successfully");
      form.reset();
      setShowConfirmation(false);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error assigning document to circuit:", error);
      
      // Show detailed error information for debugging
      if (error.response) {
        console.error("Error response details:", {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      }
      
      // Display more specific error message based on error type
      let errorMessage = "Failed to assign document to circuit";
      
      if (error.response?.data && typeof error.response.data === 'string') {
        // Check for specific error conditions
        if (error.response.data.includes("FK_DocumentCircuitHistory_Steps_StepId")) {
          errorMessage = "Database constraint error: Step not found. Please add valid steps to this circuit first.";
        } else if (error.response.data.includes("no initial status defined")) {
          errorMessage = "Circuit validation failed: No initial status defined. Please set an initial status for this circuit.";
        } else if (error.response.data.includes("while saving the entity changes")) {
          errorMessage = "Database error while saving. The circuit may not be properly configured with steps and statuses.";
        } else {
          errorMessage = error.response.data;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Different content based on state
  const renderDialogContent = () => {
    if (showConfirmation) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Confirm Circuit Assignment</DialogTitle>
            <DialogDescription>
              Please confirm that you want to assign this document to the
              selected circuit
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 bg-blue-900/20 rounded-md border border-blue-800/50">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Check className="h-5 w-5 mr-2 text-green-400" />
              Assignment Details
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="text-blue-400">Document:</span>{" "}
                <span className="text-white">{documentTitle}</span>
              </p>
              <p>
                <span className="text-blue-400">Circuit:</span>{" "}
                <span className="text-white">
                  {selectedCircuit?.title} ({selectedCircuit?.circuitKey})
                </span>
              </p>
              {circuitValidation && (
                <p>
                  <span className="text-blue-400">Steps:</span>{" "}
                  <span className="text-white">
                    {circuitValidation.totalSteps}
                  </span>
                </p>
              )}
            </div>
            <div className="mt-4 text-sm text-yellow-300">
              <p className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  This action will assign the document to the circuit workflow.
                  The document will follow the steps defined in this circuit.
                </span>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="button"
              onClick={confirmAssignment}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (noCircuitsAvailable) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Assign to Circuit</DialogTitle>
            <DialogDescription>
              Select a circuit for document: {documentTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md bg-blue-900/20 p-4 border border-blue-800/50">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-300">
                  No circuits available
                </h3>
                <div className="mt-2 text-sm text-blue-200">
                  <p>
                    There are no circuits with steps available for assignment.
                    You need to create a circuit with at least one step before
                    you can assign documents.
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                    asChild
                  >
                    <Link to="/circuits">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Manage Circuits
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Assign to Circuit</DialogTitle>
          <DialogDescription>
            Select a circuit for document: {documentTitle}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="circuitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Circuit</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCircuitId(value);
                    }}
                    value={field.value}
                    disabled={isCircuitsLoading || isValidationLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a circuit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {circuitsWithSteps?.map((circuit) => (
                        <SelectItem
                          key={circuit.id}
                          value={circuit.id.toString()}
                        >
                          {circuit.circuitKey} - {circuit.title}
                          {!circuit.isActive && " (Inactive)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  isCircuitsLoading ||
                  isValidationLoading ||
                  !selectedCircuitId
                }
              >
                {isSubmitting ? "Checking..." : "Next"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // Reset state when dialog is closed
        if (!newOpen) {
          setShowConfirmation(false);
          setSelectedCircuitId(null);
          setSelectedCircuit(null);
          setIsSubmitting(false);
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        {renderDialogContent()}
      </DialogContent>
    </Dialog>
  );
}
