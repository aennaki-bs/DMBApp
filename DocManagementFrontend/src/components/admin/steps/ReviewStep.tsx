import { UseFormReturn } from "react-hook-form";
import {
  CircleCheck,
  User,
  Building2,
  MapPin,
  AtSign,
  Key,
  Shield,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";
import { useTranslation } from "@/hooks/useTranslation";

interface ReviewStepProps {
  form: UseFormReturn<any>;
  onEditStep?: (stepIndex: number) => void;
  responsibilityCentres?: ResponsibilityCentreSimple[];
}

export function ReviewStep({ form, onEditStep, responsibilityCentres = [] }: ReviewStepProps) {
  const values = form.getValues();
  const { t } = useTranslation();

  // Helper function to get responsibility centre display text
  const getResponsibilityCentreDisplay = () => {
    if (!values.responsibilityCenterId || values.responsibilityCenterId === 0) {
      return t("userManagement.noResponsibilityCentre");
    }
    
    const centre = responsibilityCentres.find(c => c.id === values.responsibilityCenterId);
    if (centre) {
      return `${centre.code} - ${centre.descr}`;
    }
    
    return `Centre ID: ${values.responsibilityCentreId}`;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <CircleCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            {t("userManagement.reviewInformation")}
          </h3>
          <div className="ml-auto text-xs text-blue-400">
            {t("userManagement.clickEditToModify")}
          </div>
        </div>

        <div className="space-y-5">
          {/* User Type */}
          <ReviewSection
            title={t("userManagement.accountType")}
            icon={<User className="h-5 w-5" />}
            items={[
              {
                label: t("userManagement.userType"),
                value:
                  values.userType === "personal"
                    ? t("userManagement.personalUser")
                    : t("userManagement.companyAccount"),
              },
            ]}
            onEdit={() => onEditStep?.(0)}
          />

          {/* Responsibility Centre */}
          <ReviewSection
            title={t("userManagement.responsibilityCentreStep")}
            icon={<Building2 className="h-5 w-5" />}
            items={[
              {
                label: t("userManagement.assignment"),
                value: getResponsibilityCentreDisplay(),
                valueClass: values.responsibilityCenterId && values.responsibilityCenterId !== 0 ? "text-blue-300" : "text-gray-400",
              },
            ]}
            onEdit={() => onEditStep?.(1)}
          />

          {/* Personal/Company Information */}
          <ReviewSection
            title={
              values.userType === "personal"
                ? t("userManagement.personalInformation")
                : t("userManagement.companyInformation")
            }
            icon={
              values.userType === "personal" ? (
                <User className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )
            }
            items={
              values.userType === "personal"
                ? [
                    { label: t("userManagement.firstName"), value: values.firstName },
                    { label: t("userManagement.lastName"), value: values.lastName },
                    { 
                      label: "CIN", 
                      value: values.cin || t("userManagement.notProvided"),
                      valueClass: values.cin ? "text-blue-100" : "text-gray-400"
                    },
                  ]
                : [
                    { label: t("userManagement.companyName"), value: values.companyName },
                    { 
                      label: t("userManagement.registrationNumber"), 
                      value: values.registrationNumber || t("userManagement.notProvided"),
                      valueClass: values.registrationNumber ? "text-blue-100" : "text-gray-400"
                    },
                  ]
            }
            onEdit={() => onEditStep?.(2)}
          />

          {/* Address */}
          <ReviewSection
            title={t("userManagement.addressInformation")}
            icon={<MapPin className="h-5 w-5" />}
            items={[
              { 
                label: t("userManagement.address"), 
                value: values.address || t("userManagement.notProvided"),
                valueClass: values.address ? "text-blue-100" : "text-gray-400"
              },
              { label: t("userManagement.city"), value: values.city },
              { label: t("userManagement.country"), value: values.country },
              { 
                label: t("userManagement.phoneNumber"), 
                value: values.phoneNumber || t("userManagement.notProvided"),
                valueClass: values.phoneNumber ? "text-blue-100" : "text-gray-400"
              },
              ...(values.userType === "company"
                ? [{ 
                    label: t("userManagement.website"), 
                    value: values.webSite || t("userManagement.notProvided"),
                    valueClass: values.webSite ? "text-blue-100" : "text-gray-400"
                  }]
                : values.webSite 
                  ? [{ label: t("userManagement.website"), value: values.webSite }]
                  : []),
            ]}
            onEdit={() => onEditStep?.(3)}
          />

          {/* Username & Email */}
          <ReviewSection
            title={t("userManagement.accountCredentials")}
            icon={<AtSign className="h-5 w-5" />}
            items={[
              { label: t("userManagement.username"), value: values.username },
              { label: t("userManagement.emailAddress"), value: values.email },
            ]}
            onEdit={() => onEditStep?.(4)}
          />

          {/* Password (for security, just show placeholder) */}
          <ReviewSection
            title={t("userManagement.password")}
            icon={<Key className="h-5 w-5" />}
            items={[{ label: t("userManagement.password"), value: "●●●●●●●●" }]}
            onEdit={() => onEditStep?.(5)}
          />

          {/* Role */}
          <ReviewSection
            title={t("userManagement.roleAssignment")}
            icon={<Shield className="h-5 w-5" />}
            items={[
              {
                label: t("userManagement.role"),
                value: values.roleName === "Admin" 
                  ? t("userManagement.roleAdmin")
                  : values.roleName === "FullUser"
                  ? t("userManagement.roleFullUser")
                  : t("userManagement.roleSimpleUser"),
                valueClass:
                  values.roleName === "Admin"
                    ? "text-red-300"
                    : values.roleName === "FullUser"
                    ? "text-emerald-300"
                    : "text-blue-300",
              },
            ]}
            onEdit={() => onEditStep?.(6)}
          />
        </div>
      </div>

      <div className="bg-green-900/30 rounded-lg p-4 text-sm text-green-300 border border-green-800/30 flex items-center gap-3">
        <CircleCheck className="h-5 w-5 text-green-400 flex-shrink-0" />
        <p>
          {t("userManagement.reviewMessage")}
        </p>
      </div>
    </div>
  );
}

// Helper component for review sections
interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  items: {
    label: string;
    value: string;
    valueClass?: string;
  }[];
  onEdit?: () => void;
}

function ReviewSection({ title, icon, items, onEdit }: ReviewSectionProps) {
  const { t } = useTranslation();
  
  return (
    <div className="border border-blue-900/30 rounded-lg p-4 hover:border-blue-800/50 transition-colors group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-blue-400">{icon}</div>
          <h4 className="text-sm font-medium text-blue-200">{title}</h4>
        </div>
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 h-8 px-3"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            {t("userManagement.edit")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
        {items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="text-xs text-blue-400">{item.label}</div>
            <div className={item.valueClass || "text-blue-100"}>
              {item.value || "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
