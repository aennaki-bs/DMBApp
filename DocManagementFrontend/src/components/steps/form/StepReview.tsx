
import { useStepForm } from './StepFormProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Info } from 'lucide-react';

export const StepReview = () => {
  const { formData, isEditMode } = useStepForm();

  return (
    <div className="space-y-3">
      <Card className="border border-blue-900/30 bg-gradient-to-b from-[#0a1033] to-[#0d1541] shadow-md overflow-hidden rounded-lg">
        <CardContent className="p-3">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-medium text-blue-400 mb-1.5 flex items-center">
                <Info className="h-3 w-3 mr-1 text-blue-500" /> 
                Review Step Information
              </h3>
              
              <div className="rounded-lg bg-[#0d1541]/70 p-2 border border-blue-900/30 mb-2 space-y-2">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-blue-300">Title</div>
                  <div className="text-white text-xs bg-[#131d5a]/70 p-1.5 rounded-md border border-blue-900/20">
                    {formData.title}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs font-medium text-blue-300">Description</div>
                  <div className="text-gray-300 text-xs whitespace-pre-wrap bg-[#131d5a]/70 p-1.5 rounded-md border border-blue-900/20 min-h-[40px] max-h-[80px] overflow-y-auto">
                    {formData.descriptif || 'No description provided'}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[#0d1541]/70 p-2 border border-blue-900/30">
              <div className="text-xs font-medium text-blue-300 mb-1">Step Type</div>
              <div className="flex items-center">
                {formData.isFinalStep ? (
                  <Badge className="bg-green-600 hover:bg-green-700 px-1.5 py-0.5 text-xs">Final Step</Badge>
                ) : (
                  <Badge variant="outline" className="text-gray-300 border-gray-600 px-1.5 py-0.5 text-xs">
                    Regular Step
                  </Badge>
                )}
              </div>
            </div>

            <div className="bg-blue-900/20 rounded-lg p-2 border border-blue-500/30 flex items-start">
              <CheckCircle className="h-3 w-3 text-blue-400 mt-0.5 mr-1 flex-shrink-0" />
              <p className="text-xs text-blue-300">
                {isEditMode
                  ? "Review the information above before updating this step."
                  : "Please review the information above before creating this step."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
