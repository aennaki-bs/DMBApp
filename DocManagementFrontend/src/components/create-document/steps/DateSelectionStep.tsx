import { SubType } from "@/models/subtype";
import { Calendar, Info, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CustomDateTimeSelector } from "@/components/document/CustomDateTimeSelector";

interface DateSelectionStepProps {
  docDate: string;
  comptableDate: string | null;
  dateError: string | null;
  comptableDateError: string | null;
  onDateChange: (date: Date | undefined) => void;
  onComptableDateChange: (date: Date | undefined) => void;
  selectedSubType?: SubType | null;
}

export const DateSelectionStep = ({
  docDate,
  comptableDate,
  dateError,
  comptableDateError,
  onDateChange,
  onComptableDateChange,
  selectedSubType,
}: DateSelectionStepProps) => {
  const [dateObj, setDateObj] = useState<Date>(() => {
    try {
      return new Date(docDate);
    } catch (e) {
      console.error("Error parsing docDate:", e);
      return new Date();
    }
  });

  const [comptableDateObj, setComptableDateObj] = useState<Date | undefined>(
    () => {
      if (!comptableDate) return undefined;
      try {
        return new Date(comptableDate);
      } catch (e) {
        console.error("Error parsing comptableDate:", e);
        return undefined;
      }
    }
  );

  // Update dateObj when docDate changes
  useEffect(() => {
    try {
      setDateObj(new Date(docDate));
    } catch (e) {
      console.error("Error updating dateObj:", e);
    }
  }, [docDate]);

  // Update comptableDateObj when comptableDate changes
  useEffect(() => {
    if (!comptableDate) {
      setComptableDateObj(undefined);
      return;
    }

    try {
      setComptableDateObj(new Date(comptableDate));
    } catch (e) {
      console.error("Error updating comptableDateObj:", e);
    }
  }, [comptableDate]);

  // Calculate if the selected date is within the valid range
  const isDateValid = (() => {
    if (!selectedSubType) return true;

    try {
      // Create dates and normalize them to avoid timezone issues
      const selectedDate = new Date(docDate);
      const startDate = new Date(selectedSubType.startDate);
      const endDate = new Date(selectedSubType.endDate);

      // Reset time components for accurate date comparison
      selectedDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      console.log("Date validation check:", {
        selectedDate,
        startDate,
        endDate,
        isValid: selectedDate >= startDate && selectedDate <= endDate,
      });

      // Compare dates directly
      return selectedDate >= startDate && selectedDate <= endDate;
    } catch (error) {
      console.error("Date validation error:", error);
      return false;
    }
  })();

  const handleDateChange = (date: Date | undefined) => {
    console.log("DateSelectionStep received date change:", date);
    onDateChange(date);
  };

  const handleComptableDateChange = (date: Date | undefined) => {
    console.log("DateSelectionStep received comptable date change:", date);
    onComptableDateChange(date);
  };

  return (
    <div className="space-y-6">
      {/* Document Date Selection */}
      <CustomDateTimeSelector
        date={dateObj}
        onChange={handleDateChange}
        error={dateError}
        label="Document Date"
        description="The document date determines when this document is considered effective."
        icon={<Calendar className="h-5 w-5" />}
        iconColor="text-blue-400"
        minDate={
          selectedSubType ? new Date(selectedSubType.startDate) : undefined
        }
        maxDate={
          selectedSubType ? new Date(selectedSubType.endDate) : undefined
        }
      />

      {/* Accounting Date Selection */}
      <CustomDateTimeSelector
        date={comptableDateObj}
        onChange={handleComptableDateChange}
        error={comptableDateError}
        label="Accounting Date"
        description="The accounting date is used for financial reporting purposes and may differ from the document date."
        icon={<Calculator className="h-5 w-5" />}
        iconColor="text-green-400"
        isOptional={true}
      />

      {/* Valid Date Range Information */}
      {selectedSubType && (
        <Card
          className={`bg-opacity-20 border ${
            isDateValid
              ? "bg-blue-900/20 border-blue-800"
              : "bg-amber-900/20 border-amber-800"
          }`}
        >
          <CardContent className="p-3.5 space-y-2">
            <div className="flex items-start gap-3">
              <Info
                className={`h-5 w-5 mt-0.5 ${
                  isDateValid ? "text-blue-400" : "text-amber-400"
                }`}
              />
              <div>
                <h4
                  className={`text-sm font-medium ${
                    isDateValid ? "text-blue-400" : "text-amber-400"
                  }`}
                >
                  Valid Date Range for {selectedSubType.name}
                </h4>
                <p className="text-sm text-gray-300 mt-1">
                  Documents of this subtype must have a date between:
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-white font-medium">
                      {format(
                        new Date(selectedSubType.startDate),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-gray-400">to</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-white font-medium">
                      {format(
                        new Date(selectedSubType.endDate),
                        "MMMM d, yyyy"
                      )}
                    </span>
                  </div>
                </div>

                {!isDateValid && (
                  <p className="text-amber-400 text-sm mt-3 font-medium">
                    The selected date is outside the valid range.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
