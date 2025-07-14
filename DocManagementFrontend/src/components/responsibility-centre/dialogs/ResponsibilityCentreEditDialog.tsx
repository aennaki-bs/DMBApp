import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { Building2, Save, X, Loader2 } from "lucide-react";

interface ResponsibilityCentreEditDialogProps {
  centre: ResponsibilityCentre | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ResponsibilityCentreEditDialog({
  centre,
  open,
  onOpenChange,
  onSuccess,
}: ResponsibilityCentreEditDialogProps) {
  const [formData, setFormData] = useState({
    code: "",
    descr: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (centre) {
      setFormData({
        code: centre.code,
        descr: centre.descr,
        isActive: centre.isActive,
      });
    }
  }, [centre]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!centre) return;

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
      await responsibilityCentreService.updateResponsibilityCentre(centre.id, {
        code: formData.code.trim(),
        descr: formData.descr.trim(),
        isActive: formData.isActive,
      });
      
      toast.success("Centre updated successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating centre:", error);
      toast.error("Failed to update centre. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Edit Responsibility Centre
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
              placeholder="Enter centre code"
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
                {formData.isActive ? "Centre is active" : "Centre is inactive"}
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
                <Save className="h-4 w-4" />
              )}
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 