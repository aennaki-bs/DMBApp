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

  // Get circuit validation data
  const { data: circuitValidation, isLoading: isValidationLoading } =
    useQuery<CircuitValidation>({
      queryKey: ["circuit-validation", selectedCircuitId],
      queryFn: async () => {
        if (!selectedCircuitId) return null;
        return await circuitService.validateCircuit(
          parseInt(selectedCircuitId)
        );
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

      // If the circuit is not valid or steps don't have statuses, show an error
      if (circuitValidation && !circuitValidation.allStepsHaveStatuses) {
        toast.error(
          "Selected circuit has steps without statuses. Please add statuses to the steps first."
        );
        return;
      }

      // Show confirmation dialog
      setShowConfirmation(true);
    }
  };

  const confirmAssignment = async () => {
    if (!selectedCircuitId) return;

    setIsSubmitting(true);
    try {
      const circuitId = parseInt(selectedCircuitId);

      // Always activate the circuit when assigning a document
      if (selectedCircuit && !selectedCircuit.isActive) {
        await circuitService.updateCircuit(circuitId, {
          ...selectedCircuit,
          isActive: true,
        });
      }

      // Assign document to circuit
      await circuitService.assignDocumentToCircuit({
        documentId,
        circuitId: circuitId,
      });

      toast.success("Document assigned to circuit successfully");
      form.reset();
      setShowConfirmation(false);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to assign document to circuit");
      console.error(error);
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

            {selectedCircuitId &&
              circuitValidation &&
              !circuitValidation.allStepsHaveStatuses &&
              !isValidationLoading && (
                <div className="rounded-md bg-yellow-900/20 p-3 border border-yellow-800/50">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                    <div className="ml-3">
                      <p className="text-sm text-yellow-300">
                        This circuit has steps without statuses. You need to add
                        statuses to the steps before assigning documents.
                      </p>
                      {circuitValidation.stepsWithoutStatuses?.length > 0 && (
                        <div className="mt-2 text-xs text-yellow-300/70">
                          <p>Missing statuses for:</p>
                          <ul className="list-disc pl-5 mt-1">
                            {circuitValidation.stepsWithoutStatuses.map(
                              (step) => (
                                <li key={step.stepId}>
                                  {step.stepTitle} (Step {step.order})
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                          asChild
                        >
                          <Link to={`/circuits/${selectedCircuitId}/steps`}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Manage Steps
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
