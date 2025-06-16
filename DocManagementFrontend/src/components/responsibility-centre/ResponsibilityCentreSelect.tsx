import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import { toast } from "sonner";

interface ResponsibilityCentreSelectProps {
  value?: number;
  onValueChange: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  // Optional external data - when provided, component won't fetch its own data
  externalCentres?: ResponsibilityCentreSimple[];
  externalIsLoading?: boolean;
}

export const ResponsibilityCentreSelect = ({
  value,
  onValueChange,
  label = "Responsibility Centre",
  placeholder = "Select a responsibility centre",
  required = false,
  disabled = false,
  className = "",
  externalCentres,
  externalIsLoading,
}: ResponsibilityCentreSelectProps) => {
  const [internalCentres, setInternalCentres] = useState<
    ResponsibilityCentreSimple[]
  >([]);
  const [internalIsLoading, setInternalIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Use external data if provided, otherwise use internal data
  const centres =
    externalCentres !== undefined ? externalCentres : internalCentres;
  const isLoading =
    externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;

  console.log("ResponsibilityCentreSelect: Rendering with:", {
    externalCentres,
    externalIsLoading,
    internalCentres,
    internalIsLoading,
    finalCentres: centres,
    finalIsLoading: isLoading,
    centresLength: centres.length,
  });

  const fetchCentres = async () => {
    // Don't fetch if external data is provided
    if (externalCentres !== undefined) {
      console.log(
        "ResponsibilityCentreSelect: Using external data, skipping fetch"
      );
      return;
    }

    try {
      setInternalIsLoading(true);
      setHasError(false);

      console.log(
        "ResponsibilityCentreSelect: Fetching responsibility centres..."
      );
      // Use the getSimple method which has better error handling
      const data = await responsibilityCentreService.getSimple();

      console.log("ResponsibilityCentreSelect: Fetched centres:", data);
      console.log(
        "ResponsibilityCentreSelect: Number of centres:",
        data?.length || 0
      );

      // Log each centre to see the structure
      if (data && data.length > 0) {
        data.forEach((centre, index) => {
          console.log(`ResponsibilityCentreSelect: Centre ${index}:`, centre);
        });
      }

      // Always set the centres, even if empty - empty array is a valid response
      setInternalCentres(data || []);
    } catch (error) {
      console.error(
        "ResponsibilityCentreSelect: Failed to fetch responsibility centres:",
        error
      );
      setHasError(true);

      // Don't show toast error during registration as it's optional
      if (window.location.pathname !== "/register") {
        toast.error("Failed to load responsibility centres", {
          description:
            "There was a problem connecting to the server. You can try again.",
          duration: 4000,
        });
      }
    } finally {
      setInternalIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if external data is not provided
    if (externalCentres === undefined) {
      fetchCentres();
    }
  }, [retryCount, externalCentres]); // Re-run when retry count changes or external data changes

  // Debug effect to track centres state changes
  useEffect(() => {
    console.log("ResponsibilityCentreSelect: centres state changed:", centres);
    console.log("ResponsibilityCentreSelect: centres length:", centres.length);
  }, [centres]);

  // Debug effect to track loading state changes
  useEffect(() => {
    console.log(
      "ResponsibilityCentreSelect: isLoading state changed:",
      isLoading
    );
  }, [isLoading]);

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "none") {
      onValueChange(undefined);
    } else {
      onValueChange(parseInt(selectedValue));
    }
  };

  if (hasError) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label className="text-sm font-medium">
            <Building2 className="h-4 w-4 inline mr-2" />
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="flex flex-col space-y-3 p-3 border border-amber-600 bg-amber-900/20 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-300">
              Unable to load responsibility centres. Please try again or contact
              administration.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="bg-amber-900/30 border-amber-700 text-amber-200 hover:bg-amber-800/50"
            onClick={handleRetry}
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Debug info - can be removed later */}
      <div className="text-xs text-gray-400 p-2 bg-gray-800 rounded">
        Debug: centres.length = {centres.length}, isLoading ={" "}
        {isLoading.toString()}, hasError = {hasError.toString()}
        {centres.length > 0 && (
          <div>
            Centres: {centres.map((c) => `${c.code}(${c.id})`).join(", ")}
          </div>
        )}
      </div>

      {label && (
        <Label
          htmlFor="responsibility-centre-select"
          className="text-sm font-medium"
        >
          <Building2 className="h-4 w-4 inline mr-2" />
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {/* Working native HTML select */}
      <select
        id="responsibility-centre-select"
        value={value || ""}
        onChange={(e) => handleValueChange(e.target.value)}
        className="w-full p-3 border rounded-md bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={disabled || isLoading}
      >
        <option value="">
          {isLoading ? "Loading centres..." : placeholder}
        </option>
        {!required && <option value="none">No responsibility centre</option>}
        {centres.map((centre) => (
          <option key={centre.id} value={centre.id.toString()}>
            {centre.code} {centre.descr ? `- ${centre.descr}` : ""}
          </option>
        ))}
        {centres.length === 0 && !isLoading && (
          <option value="" disabled>
            No centres available
          </option>
        )}
      </select>
    </div>
  );
};
