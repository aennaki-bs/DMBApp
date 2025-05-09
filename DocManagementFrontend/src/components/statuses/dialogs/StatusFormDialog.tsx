import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';
import { DocumentStatus } from '@/models/documentCircuit';
import { Textarea } from '@/components/ui/textarea';

interface StatusFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  status?: DocumentStatus | null;
  circuitId?: number;
  stepId?: number;
}

export function StatusFormDialog({
  open,
  onOpenChange,
  onSuccess,
  status,
  circuitId,
  stepId,
}: StatusFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [isInitial, setIsInitial] = useState(false);
  const [isFinal, setIsFinal] = useState(false);
  const [isFlexible, setIsFlexible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state when dialog opens or status changes
  useEffect(() => {
    if (open) {
      if (status) {
        // Editing existing status - populate form with status data
        setTitle(status.title || '');
        setDescription(status.description || '');
        setIsRequired(status.isRequired || false);
        setIsInitial(status.isInitial || false);
        setIsFinal(status.isFinal || false);
        setIsFlexible(status.isFlexible || false);
      } else {
        // Creating new status - reset form
        setTitle('');
        setDescription('');
        setIsRequired(false);
        setIsInitial(false);
        setIsFinal(false);
        setIsFlexible(false);
      }
    }
  }, [open, status]);

  // Reset form when dialog closes
  const handleDialogChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      // Reset form state when dialog closes
      setTitle('');
      setDescription('');
      setIsRequired(false);
      setIsInitial(false);
      setIsFinal(false);
      setIsFlexible(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const statusData = {
        title,
        description,
        isRequired,
        isInitial,
        isFinal,
        isFlexible
      };

      if (status) {
        // Update existing status using new endpoint
        await api.put(`/Status/${status.statusId}`, statusData);
        toast.success('Status updated successfully');
      } else if (circuitId) {
        // Create new circuit status
        await api.post(`/Status/circuit/${circuitId}`, statusData);
        toast.success('Status created successfully');
      } else if (stepId) {
        // Create new step status
        await api.post(`/Status/step/${stepId}`, statusData);
        toast.success('Status created successfully');
      } else {
        toast.error('Missing circuit or step ID');
        return;
      }
      
      // Call onSuccess and close the dialog
      onSuccess();
      handleDialogChange(false);
      
    } catch (error) {
      console.error('Error submitting status:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {status ? 'Edit Status' : 'Create New Status'}
          </DialogTitle>
          <DialogDescription>
            {status
              ? "Update the status details"
              : circuitId
              ? 'Add a new status to this circuit'
              : 'Add a new status to this step'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter status title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter status description"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRequired"
                checked={isRequired}
                onCheckedChange={(checked) => setIsRequired(!!checked)}
              />
              <Label htmlFor="isRequired" className="cursor-pointer">
                This status is required
              </Label>
            </div>

            {circuitId && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isInitial"
                    checked={isInitial}
                    onCheckedChange={(checked) => {
                      setIsInitial(!!checked);
                      if (checked) {
                        setIsFinal(false);
                      }
                    }}
                  />
                  <Label htmlFor="isInitial" className="cursor-pointer">
                    Initial status
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFinal"
                    checked={isFinal}
                    onCheckedChange={(checked) => {
                      setIsFinal(!!checked);
                      if (checked) {
                        setIsInitial(false);
                      }
                    }}
                  />
                  <Label htmlFor="isFinal" className="cursor-pointer">
                    Final status
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFlexible"
                    checked={isFlexible}
                    onCheckedChange={(checked) => setIsFlexible(!!checked)}
                  />
                  <Label htmlFor="isFlexible" className="cursor-pointer">
                    Flexible status (can be used in any step)
                  </Label>
                </div>
              </>
            )}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : status ? 'Update Status' : 'Create Status'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
