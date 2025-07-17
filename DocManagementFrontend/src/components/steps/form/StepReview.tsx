import React from 'react';
import { useStepForm } from './StepFormProvider';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Info, Users, ArrowRight } from 'lucide-react';

const StepReview: React.FC = () => {
  const { formData } = useStepForm();

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center mb-2">
          <CheckCircle2 className="w-5 h-5 text-green-400 mr-2" />
          <h3 className="text-lg font-semibold text-slate-100">
            Review & Confirm
          </h3>
        </div>
        <p className="text-sm text-slate-400">
          Review your step configuration before creating
        </p>
      </div>

      {/* Scrollable Content Container */}
      <div className="h-60 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-slate-600/50 hover:scrollbar-thumb-slate-500/50">
        {/* Step Information */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center mb-2">
            <Info className="w-4 h-4 text-blue-400 mr-2" />
            <h4 className="font-medium text-slate-200">Step Information</h4>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-xs text-slate-400">Title</span>
              <p className="text-sm text-slate-200 font-medium">
                {formData.title || 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400">Description</span>
              <p className="text-sm text-slate-300 leading-relaxed max-h-16 overflow-y-auto">
                {formData.descriptif || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Transition */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center mb-2">
            <ArrowRight className="w-4 h-4 text-purple-400 mr-2" />
            <h4 className="font-medium text-slate-200">Status Transition</h4>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-center">
              <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-1">
                Current Status
              </Badge>
              <p className="text-xs text-slate-400 mt-1">Initial</p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 mx-2" />

            <div className="text-center">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-1">
                Next Status
              </Badge>
              <p className="text-xs text-slate-400 mt-1">Target</p>
            </div>
          </div>
        </div>

        {/* Approval Requirements */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <div className="flex items-center mb-2">
            <Users className="w-4 h-4 text-amber-400 mr-2" />
            <h4 className="font-medium text-slate-200">Approval Requirements</h4>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Requires Approval</span>
              <Badge variant={formData.requiresApproval ? "default" : "secondary"} className="text-xs">
                {formData.requiresApproval ? 'Yes' : 'No'}
              </Badge>
            </div>

            {formData.requiresApproval && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Approval Type</span>
                  <Badge variant="outline" className="text-xs">
                    {formData.approvalType === 'group' ? 'Group Approval' : 'Individual Approval'}
                  </Badge>
                </div>

                {formData.approvalType === 'group' && formData.approvalGroupId && (
                  <div className="bg-slate-700/30 rounded-md p-2 mt-2">
                    <div className="flex items-center mb-1">
                      <Users className="w-3 h-3 text-blue-400 mr-1" />
                      <span className="text-xs font-medium text-slate-300">
                        Group Approval Selected
                      </span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Group
                      </Badge>
                    </div>

                    <div className="mt-1">
                      <span className="text-xs text-slate-400">
                        Group ID: {formData.approvalGroupId}
                      </span>
                    </div>
                  </div>
                )}

                {formData.approvalType === 'user' && formData.approvalUserId && (
                  <div className="bg-slate-700/30 rounded-md p-2 mt-2">
                    <div className="flex items-center mb-1">
                      <Users className="w-3 h-3 text-blue-400 mr-1" />
                      <span className="text-xs font-medium text-slate-300">
                        Individual Approver Selected
                      </span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        User
                      </Badge>
                    </div>

                    <div className="mt-1">
                      <span className="text-xs text-slate-400">
                        User ID: {formData.approvalUserId}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepReview;
