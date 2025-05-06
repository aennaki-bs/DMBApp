
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";

interface StepNavigationProps {
  step: number;
  isSubmitting: boolean;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const StepNavigation = ({
  step,
  isSubmitting,
  onPrevStep,
  onNextStep,
  onSubmit,
  onCancel
}: StepNavigationProps) => {
  return (
    <div className="flex justify-between pt-6">
      <Button 
        variant="outline" 
        className="border-gray-700 hover:bg-gray-800" 
        onClick={step === 1 ? onCancel : onPrevStep}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {step === 1 ? 'Cancel' : 'Back'}
      </Button>
      {step === 5 ? (
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-5 w-5" />
          {isSubmitting ? 'Creating...' : 'Create Document'}
        </Button>
      ) : (
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={onNextStep}>
          Next Step
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
