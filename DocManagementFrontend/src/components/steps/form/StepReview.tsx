import React, { useEffect, useState } from 'react';
import { useStepForm } from './StepFormProvider';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Info, Users, ArrowRight } from 'lucide-react';
import api from '@/services/api';
import adminService from '@/services/adminService';
import approvalService from '@/services/approvalService';

interface StatusInfo {
  id: number;
  title: string;
  name?: string;
}

interface UserInfo {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface GroupInfo {
  id: number;
  name: string;
}

const StepReview: React.FC = () => {
  const { formData } = useStepForm();
  
  // State for fetched data
  const [currentStatus, setCurrentStatus] = useState<StatusInfo | null>(null);
  const [nextStatus, setNextStatus] = useState<StatusInfo | null>(null);
  const [approverUser, setApproverUser] = useState<UserInfo | null>(null);
  const [approverGroup, setApproverGroup] = useState<GroupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch status information and user/group information
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch status information
        const statusPromises = [];
        
        if (formData.currentStatusId) {
          statusPromises.push(
            api.get(`/Status/${formData.currentStatusId}`)
              .then(response => ({ type: 'current', data: response.data }))
              .catch(() => ({ type: 'current', data: null }))
          );
        }
        
        if (formData.nextStatusId) {
          statusPromises.push(
            api.get(`/Status/${formData.nextStatusId}`)
              .then(response => ({ type: 'next', data: response.data }))
              .catch(() => ({ type: 'next', data: null }))
          );
        }

        // Execute status fetches
        const statusResults = await Promise.all(statusPromises);
        
        statusResults.forEach(result => {
          if (result.type === 'current' && result.data) {
            setCurrentStatus(result.data);
          } else if (result.type === 'next' && result.data) {
            setNextStatus(result.data);
          }
        });

        // Fetch approval information
        if (formData.requiresApproval) {
          if (formData.approvalType === 'user' && formData.approvalUserId) {
            try {
              // Try to get from approvators first (which has both userId and username)
              const approvators = await approvalService.getAllApprovators();
              const approvator = approvators.find(a => a.userId === formData.approvalUserId);
              
              if (approvator) {
                setApproverUser({
                  id: approvator.userId,
                  username: approvator.username
                });
              } else {
                // Fallback to admin service
                const user = await adminService.getUserById(formData.approvalUserId);
                setApproverUser({
                  id: user.id,
                  username: user.username,
                  firstName: user.firstName,
                  lastName: user.lastName
                });
              }
            } catch (error) {
              console.error('Error fetching user information:', error);
              // Set fallback with just the ID
              setApproverUser({
                id: formData.approvalUserId,
                username: `User ID: ${formData.approvalUserId}`
              });
            }
          } else if (formData.approvalType === 'group' && formData.approvalGroupId) {
            try {
              const group = await approvalService.getApprovalGroup(formData.approvalGroupId);
              setApproverGroup({
                id: group.id,
                name: group.name
              });
            } catch (error) {
              console.error('Error fetching group information:', error);
              // Set fallback with just the ID
              setApproverGroup({
                id: formData.approvalGroupId,
                name: `Group ID: ${formData.approvalGroupId}`
              });
            }
          }
        }

      } catch (error) {
        console.error('Error fetching step review data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [formData.currentStatusId, formData.nextStatusId, formData.approvalUserId, formData.approvalGroupId, formData.requiresApproval, formData.approvalType]);

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
              <p className="text-xs text-slate-400 mt-1">
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : currentStatus ? (
                  currentStatus.title || currentStatus.name
                ) : (
                  'Status not found'
                )}
              </p>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 mx-2" />

            <div className="text-center">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-2 py-1">
                Next Status
              </Badge>
              <p className="text-xs text-slate-400 mt-1">
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : nextStatus ? (
                  nextStatus.title || nextStatus.name
                ) : (
                  'Status not found'
                )}
              </p>
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
                        {isLoading ? (
                          <span className="animate-pulse">Loading group...</span>
                        ) : approverGroup ? (
                          `Group: ${approverGroup.name}`
                        ) : (
                          `Group ID: ${formData.approvalGroupId}`
                        )}
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
                        {isLoading ? (
                          <span className="animate-pulse">Loading user...</span>
                        ) : approverUser ? (
                          `Approver: ${approverUser.username}${
                            approverUser.firstName && approverUser.lastName 
                              ? ` (${approverUser.firstName} ${approverUser.lastName})` 
                              : ''
                          }`
                        ) : (
                          `User ID: ${formData.approvalUserId}`
                        )}
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
