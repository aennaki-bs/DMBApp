import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface FormActionsProps {
  step: number;
  totalSteps?: number;
  isEditMode: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  isNextDisabled: boolean;
  isValidating: boolean;
}

export const FormActions = ({
  step,
  totalSteps = 2,
  isEditMode,
  onNext,
  onPrev,
  onSubmit,
  onCancel,
  isNextDisabled,
  isValidating,
}: FormActionsProps) => {
  const isFirstStep = step === 1;
  const isLastStep = step === totalSteps;
  const isReviewStep = (totalSteps > 2) && (step === totalSteps - 1);

  return (
    <div className="flex justify-between gap-2 mt-4">
      <Button
        type="button"
        variant="outline"
        onClick={isFirstStep ? onCancel : onPrev}
        className="h-7 text-xs bg-transparent border-blue-800/50 hover:bg-blue-900/30 text-gray-300"
        size="sm"
      >
        {isFirstStep ? 'Cancel' : (
          <>
            <ArrowLeft className="mr-1 h-2.5 w-2.5" />
            Back
          </>
        )}
      </Button>

      <Button
        type="button"
        onClick={isLastStep || isEditMode ? onSubmit : onNext}
        disabled={isNextDisabled || isValidating}
        className="h-7 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white"
        size="sm"
      >
        {isValidating ? (
          <>
            <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
            Validating...
          </>
        ) : isLastStep ? (
          <>
            <Save className="mr-1 h-2.5 w-2.5" />
            {isEditMode ? 'Update Type' : 'Create Type'}
          </>
        ) : isReviewStep ? (
          'Review'
        ) : (
          'Continue'
        )}
      </Button>
    </div>
  );
};
