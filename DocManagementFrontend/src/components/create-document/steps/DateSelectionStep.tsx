import { Label } from "@/components/ui/label";
import { DatePickerInput } from "@/components/document/DatePickerInput";
import { SubType } from "@/models/subtype";

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
  selectedSubType 
}: DateSelectionStepProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="docDate" className="text-sm font-medium text-gray-200">Document Date*</Label>
      
      {selectedSubType && (
        <div className="text-sm text-blue-400 mb-2">
          <p>The selected date must be within the range for the subtype:</p>
          <p className="font-semibold">
            {new Date(selectedSubType.startDate).toLocaleDateString()} - {new Date(selectedSubType.endDate).toLocaleDateString()}
          </p>
        </div>
      )}
      
      <DatePickerInput 
        date={new Date(docDate)} 
        onDateChange={onDateChange}
        error={!!dateError}
      />
      {dateError && (
        <p className="text-sm text-red-500">{dateError}</p>
      )}
    </div>
  );
};
