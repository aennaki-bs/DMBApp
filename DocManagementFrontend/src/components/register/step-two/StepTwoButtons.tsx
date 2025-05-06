
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowRight } from 'lucide-react';

interface StepTwoButtonsProps {
  onBack: () => void;
  onNext: () => void;
  isLoading: boolean;
}

const StepTwoButtons: React.FC<StepTwoButtonsProps> = ({
  onBack,
  onNext,
  isLoading
}) => {
  return (
    <div className="flex gap-2 pt-2">
      <Button
        type="button"
        className="flex-1"
        variant="outline"
        onClick={onBack}
        disabled={isLoading}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Button
        type="button"
        className="flex-1 bg-docuBlue hover:bg-docuBlue-700"
        onClick={onNext}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">Validating...</span>
        ) : (
          <span className="flex items-center">
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        )}
      </Button>
    </div>
  );
};

export default StepTwoButtons;
