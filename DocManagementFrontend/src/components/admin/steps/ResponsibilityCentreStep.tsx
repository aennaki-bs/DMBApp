import { UseFormReturn } from "react-hook-form";
import { Building2, Info } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { ResponsibilityCentreSelect } from "@/components/responsibility-centre/ResponsibilityCentreSelect";
import { useTranslation } from "@/hooks/useTranslation";

interface ResponsibilityCentreStepProps {
  form: UseFormReturn<any>;
}

export function ResponsibilityCentreStep({ form }: ResponsibilityCentreStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            {t("userManagement.responsibilityCentreAssignment")}
          </h3>
        </div>

        <div className="space-y-5">
          <FormField
            control={form.control}
            name="responsibilityCenterId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {t("userManagement.responsibilityCentre")}
                  <span className="text-xs text-blue-400 font-normal">({t("userManagement.optional")})</span>
                </FormLabel>
                <FormControl>
                  <ResponsibilityCentreSelect
                    value={field.value === 0 ? undefined : field.value}
                    onValueChange={(value) => field.onChange(value || 0)}
                    placeholder={t("userManagement.selectResponsibilityCentre")}
                    label=""
                    required={false}
                    className="w-full"
                  />
                </FormControl>
                {/* <FormDescription className="text-blue-400/80 text-sm">
                  Assign the user to a specific responsibility centre. This determines their access scope and organizational context. You can leave this empty if no specific assignment is needed.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* <div className="bg-blue-900/30 rounded-lg p-4 text-sm text-blue-300 border border-blue-800/30 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium mb-1">About Responsibility Centres</p>
          <p>
            Responsibility centres help organize users by department, team, or functional area. 
            Users assigned to a responsibility centre will have access to documents and workflows 
            specific to that centre. If no centre is selected, the user will have general access 
            based on their role permissions.
          </p>
        </div>
      </div> */}
    </div>
  );
} 