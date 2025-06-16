import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { useTranslation } from "@/hooks/useTranslation";

interface CreateResponsibilityCentreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateResponsibilityCentreDialog({
  open,
  onOpenChange,
}: CreateResponsibilityCentreDialogProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    code: "",
    descr: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.descr.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      await responsibilityCentreService.createResponsibilityCentre({
        code: formData.code.trim(),
        descr: formData.descr.trim(),
      });

      toast.success("Responsibility centre created successfully");
      setFormData({ code: "", descr: "" });
      onOpenChange(false);
      // Refresh will be handled by the parent component
      window.location.reload();
    } catch (error) {
      console.error("Failed to create responsibility centre:", error);
      toast.error("Failed to create responsibility centre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ code: "", descr: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Responsibility Centre</DialogTitle>
          <DialogDescription>
            Add a new responsibility centre to the system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code: e.target.value }))
              }
              placeholder="Enter centre code"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descr">Description *</Label>
            <Input
              id="descr"
              value={formData.descr}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, descr: e.target.value }))
              }
              placeholder="Enter centre description"
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Centre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
