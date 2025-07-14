import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { Building2, Plus, X, Loader2 } from "lucide-react";

interface ResponsibilityCentreCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ResponsibilityCentreCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: ResponsibilityCentreCreateDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    descr: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.code.trim()) {
      toast.error("Code is required");
      return;
    }

    if (!formData.descr.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsLoading(true);
    
    try {
      await responsibilityCentreService.createResponsibilityCentre({
        code: formData.code.trim(),
        descr: formData.descr.trim(),
      });
      
      toast.success("Centre created successfully");
      
      // Reset form
      setFormData({
        code: "",
        descr: "",
        isActive: true,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating centre:", error);
      toast.error("Failed to create centre. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Reset form on close
      setFormData({
        code: "",
        descr: "",
        isActive: true,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Create Responsibility Centre
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-foreground">
              Code *
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value)}
              placeholder="Enter centre code (e.g., SALES, IT, HR)"
              className="bg-background/50 border-primary/20 focus:border-primary/40"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descr" className="text-sm font-medium text-foreground">
              Description *
            </Label>
            <Textarea
              id="descr"
              value={formData.descr}
              onChange={(e) => handleInputChange("descr", e.target.value)}
              placeholder="Enter centre description"
              className="bg-background/50 border-primary/20 focus:border-primary/40 min-h-[80px]"
              disabled={isLoading}
              required
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
            <div className="space-y-1">
              <Label htmlFor="isActive" className="text-sm font-medium text-foreground">
                Status
              </Label>
              <p className="text-xs text-muted-foreground">
                Centre will be created as {formData.isActive ? "active" : "inactive"}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isLoading ? "Creating..." : "Create Centre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 