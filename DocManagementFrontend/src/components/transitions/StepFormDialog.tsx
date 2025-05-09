import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';
import { DocumentStatus } from '@/models/documentCircuit';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Define Step interface to match backend
interface Step {
  id: number;
  stepKey: string;
  circuitId: number;
  title: string;
  descriptif: string;
  currentStatusId: number;
  currentStatusTitle: string;
  nextStatusId: number;
  nextStatusTitle: string;
}

interface StepFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  step?: Step | null;
  circuitId: number;
  statusOptions: DocumentStatus[];
}

export function StepFormDialog({
  open,
  onOpenChange,
  onSuccess,
  step,
  circuitId,
  statusOptions,
}: StepFormDialogProps) {
  const [currentStatusId, setCurrentStatusId] = useState<string>('');
  const [nextStatusId, setNextStatusId] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nextStatusOptions, setNextStatusOptions] = useState<DocumentStatus[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter next status options excluding the current status and ensuring at least
  // one status is always available for selection
  useEffect(() => {
    if (currentStatusId) {
      const filtered = statusOptions.filter(status => 
        status.statusId.toString() !== currentStatusId
      );
      setNextStatusOptions(filtered);
    } else {
      setNextStatusOptions(statusOptions);
    }
  }, [currentStatusId, statusOptions]);

  // Generate default title and description when statuses are selected only if they're empty
  useEffect(() => {
    if (currentStatusId && nextStatusId && !step) {
      const currentStatus = statusOptions.find(s => s.statusId.toString() === currentStatusId);
      const nextStatus = statusOptions.find(s => s.statusId.toString() === nextStatusId);
      if (currentStatus && nextStatus) {
        // Only set defaults if the fields are empty
        if (!title) {
          setTitle(`Step from ${currentStatus.title} to ${nextStatus.title}`);
        }
        if (!description) {
          setDescription(`Step between ${currentStatus.title} and ${nextStatus.title}`);
        }
      }
    }
  }, [currentStatusId, nextStatusId, statusOptions, step, title, description]);

  // Reset form state when dialog opens or step changes
  useEffect(() => {
    if (open) {
      if (step) {
        // Editing existing step - populate form
        setCurrentStatusId(step.currentStatusId.toString());
        setNextStatusId(step.nextStatusId.toString());
        setTitle(step.title);
        setDescription(step.descriptif);
      } else {
        // Creating new step - reset form
        setCurrentStatusId('');
        setNextStatusId('');
        setTitle('');
        setDescription('');
      }
      setError(null);
    }
  }, [open, step]);

  // Reset form when dialog closes
  const handleDialogChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form state when dialog closes
      setCurrentStatusId('');
      setNextStatusId('');
      setTitle('');
      setDescription('');
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentStatusId || !nextStatusId) {
      toast.error('Please select both current and next status');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a title for the step');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const stepData = {
        title: title.trim(),
        descriptif: description.trim(),
        currentStatusId: parseInt(currentStatusId, 10),
        nextStatusId: parseInt(nextStatusId, 10)
      };

      if (step) {
        // Update existing step
        await api.put(`/Circuit/steps/${step.id}`, stepData);
        toast.success('Step updated successfully');
      } else {
        // Create new step
        await api.post(`/Circuit/${circuitId}/steps`, stepData);
        toast.success('Step created successfully');
      }
      
      // Call onSuccess and close the dialog
      onSuccess();
      handleDialogChange(false);
      
    } catch (error: any) {
      console.error('Error submitting step:', error);
      setError(
        error.response?.data || 
        'An error occurred while saving the step. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = step ? 'Edit Step' : 'Create New Step';
  const dialogDescription = step
    ? "Update the step details"
    : 'Define a new step for this circuit';

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-2 mb-2 text-sm rounded-md bg-red-50 text-red-700 border border-red-200">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Step Title</Label>
              <Input 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this step"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Step Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for this step"
                rows={3}
              />
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="currentStatusId">Current Status</Label>
              <Select
                value={currentStatusId}
                onValueChange={setCurrentStatusId}
              >
                <SelectTrigger id="currentStatusId">
                  <SelectValue placeholder="Select current status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem 
                      key={status.statusId} 
                      value={status.statusId.toString()}
                    >
                      {status.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center py-2">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                    className="text-blue-500">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nextStatusId">Next Status</Label>
              <Select
                value={nextStatusId}
                onValueChange={setNextStatusId}
                disabled={!currentStatusId || nextStatusOptions.length === 0}
              >
                <SelectTrigger id="nextStatusId">
                  <SelectValue placeholder="Select next status" />
                </SelectTrigger>
                <SelectContent>
                  {nextStatusOptions.map((status) => (
                    <SelectItem 
                      key={status.statusId} 
                      value={status.statusId.toString()}
                    >
                      {status.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {nextStatusOptions.length === 0 && currentStatusId && (
                <p className="text-sm text-red-500">
                  No other statuses available for transition. Please create more statuses first.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !currentStatusId || !nextStatusId || !title.trim()}
            >
              {isSubmitting ? 'Saving...' : step ? 'Update Step' : 'Create Step'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 