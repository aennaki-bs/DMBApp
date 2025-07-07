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

interface ReviewStepProps {
  form: UseFormReturn<any>;
  onEditStep?: (stepIndex: number) => void;
}

export function ReviewStep({ form, onEditStep }: ReviewStepProps) {
  const values = form.getValues();

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <CircleCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            Review Information
          </h3>
          <div className="ml-auto text-xs text-blue-400">
            Click "Edit" to modify any section
          </div>
        </div>

        <div className="space-y-5">
          {/* User Type */}
          <ReviewSection
            title="Account Type"
            icon={<User className="h-5 w-5" />}
            items={[
              {
                label: "User Type",
                value:
                  values.userType === "simple"
                    ? "Personal User"
                    : "Company Account",
              },
            ]}
            onEdit={() => onEditStep?.(0)}
          />

          {/* Responsibility Centre */}
          <ReviewSection
            title="Responsibility Centre"
            icon={<Building2 className="h-5 w-5" />}
            items={[
              {
                label: "Assignment",
                value: values.responsibilityCenterId && values.responsibilityCenterId !== 0
                  ? `Centre ID: ${values.responsibilityCenterId}` 
                  : "No responsibility centre assigned",
                valueClass: values.responsibilityCenterId && values.responsibilityCenterId !== 0 ? "text-blue-300" : "text-gray-400",
              },
            ]}
            onEdit={() => onEditStep?.(1)}
          />

          {/* Personal/Company Information */}
          <ReviewSection
            title={
              values.userType === "simple"
                ? "Personal Information"
                : "Company Information"
            }
            icon={
              values.userType === "simple" ? (
                <User className="h-5 w-5" />
              ) : (
                <Building2 className="h-5 w-5" />
              )
            }
            items={
              values.userType === "simple"
                ? [
                    { label: "First Name", value: values.firstName },
                    { label: "Last Name", value: values.lastName },
                    ...(values.cin
                      ? [{ label: "CIN", value: values.cin }]
                      : []),
                  ]
                : [{ label: "Company Name", value: values.companyName }]
            }
            onEdit={() => onEditStep?.(2)}
          />

          {/* Address */}
          <ReviewSection
            title="Address Information"
            icon={<MapPin className="h-5 w-5" />}
            items={[
              { label: "Address", value: values.address },
              { label: "City", value: values.city },
              { label: "Country", value: values.country },
              { label: "Phone Number", value: values.phoneNumber },
              ...(values.webSite
                ? [{ label: "Website", value: values.webSite }]
                : []),
            ]}
            onEdit={() => onEditStep?.(3)}
          />

          {/* Username & Email */}
          <ReviewSection
            title="Account Credentials"
            icon={<AtSign className="h-5 w-5" />}
            items={[
              { label: "Username", value: values.username },
              { label: "Email", value: values.email },
            ]}
            onEdit={() => onEditStep?.(4)}
          />

          {/* Password (for security, just show placeholder) */}
          <ReviewSection
            title="Password"
            icon={<Key className="h-5 w-5" />}
            items={[{ label: "Password", value: "●●●●●●●●" }]}
            onEdit={() => onEditStep?.(5)}
          />

          {/* Role */}
          <ReviewSection
            title="User Role"
            icon={<Shield className="h-5 w-5" />}
            items={[
              {
                label: "Role",
                value: values.roleName,
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
          Please review all information carefully before creating the user.
          You can edit any section above if needed, then click "Create User" to proceed.
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
            Edit
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
