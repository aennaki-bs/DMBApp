import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResponsibilityCentre } from "@/models/responsibilityCentre";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, FileText, CheckCircle2, XCircle, Calendar } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ResponsibilityCentreDetailsDialogProps {
  centre: ResponsibilityCentre | null;
  open: boolean;
  onClose: () => void;
}

export function ResponsibilityCentreDetailsDialog({
  centre,
  open,
  onClose,
}: ResponsibilityCentreDetailsDialogProps) {
  const { t } = useTranslation();

  if (!centre) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-background/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Responsibility Centre Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Centre Code
              </div>
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {centre.code}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Description
              </div>
              <div className="text-slate-800 dark:text-slate-200">
                {centre.descr || "No description provided"}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Status
              </div>
              <Badge 
                variant={centre.isActive ? "default" : "secondary"}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  centre.isActive 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {centre.isActive ? (
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                {centre.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          {/* Statistics */}
          <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              Statistics
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Users</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {centre.usersCount || 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Documents</div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {centre.documentsCount || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
              Timestamps
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">Created:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatDate(centre.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">Updated:</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {formatDate(centre.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 