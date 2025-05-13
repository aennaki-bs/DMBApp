import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/document/DatePickerInput";
import { SubType } from "@/models/subtype";
import { Calendar, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format, isWithinInterval, parseISO } from "date-fns";
import { useEffect, useState } from "react";

interface DateSelectionStepProps {
  docDate: string;
  dateError: string | null;
  onDateChange: (date: Date | undefined) => void;
  selectedSubType?: SubType | null;
}

export const DateSelectionStep = ({
  docDate,
  dateError,
  onDateChange,
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

  // Update dateObj when docDate changes
  useEffect(() => {
    try {
      setDateObj(new Date(docDate));
    } catch (e) {
      console.error("Error updating dateObj:", e);
    }
  }, [docDate]);

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

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label
          htmlFor="docDate"
          className="text-sm font-medium text-gray-200 flex items-center gap-2"
        >
          <Calendar className="h-4 w-4 text-blue-400" />
          Document Date*
        </Label>

        <DatePickerInput
          date={dateObj}
          onDateChange={handleDateChange}
          error={!!dateError}
          minDate={
            selectedSubType ? new Date(selectedSubType.startDate) : undefined
          }
          maxDate={
            selectedSubType ? new Date(selectedSubType.endDate) : undefined
          }
        />

        {dateError && <p className="text-sm text-red-500">{dateError}</p>}
      </div>

      {selectedSubType && (
        <Card
          className={`bg-opacity-20 border ${
            isDateValid
              ? "bg-blue-900 border-blue-800"
              : "bg-amber-900 border-amber-800"
          }`}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-2">
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
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

      <div className="text-sm text-gray-400">
        <p>
          The document date determines when this document is considered
          effective.
        </p>
      </div>
    </div>
  );
};
