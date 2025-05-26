import { useFormContext } from "react-hook-form";
import {
  CheckCircle,
  User,
  Building2,
  Mail,
  MapPin,
  Phone,
  Fingerprint,
  Shield,
  Globe,
  Hash,
  Pencil,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ReviewStepProps {
  onNavigateToStep: (step: number) => void;
}

export function ReviewStep({ onNavigateToStep }: ReviewStepProps) {
  const { watch } = useFormContext();

  // Get all form values
  const values = watch();
  const userType = values.userType;

  // Role colors
  const roleColors = {
    Admin: "bg-red-500/10 text-red-300 border-red-500/30",
    FullUser: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    SimpleUser: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  };

  // Edit button component that navigates to a specific step
  const EditButton = ({ step }: { step: number }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onNavigateToStep(step)}
      className="h-7 w-7 p-0 rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-900/50"
    >
      <Pencil className="h-3.5 w-3.5" />
    </Button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-900/30">
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="h-10 w-10 text-blue-400" />
          </motion.div>
        </div>

        <h3 className="text-lg font-medium text-blue-100 mb-4 text-center">
          Review User Information
        </h3>

        {/* Account Type */}
        <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-900/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-blue-400 flex items-center">
              {userType === "personal" ? (
                <User className="h-4 w-4 mr-1.5" />
              ) : (
                <Building2 className="h-4 w-4 mr-1.5" />
              )}
              Account Type
            </h4>
            <EditButton step={0} />
          </div>
          <p className="text-blue-100">
            {userType === "personal" ? "Personal Account" : "Company Account"}
          </p>
        </div>

        {/* User Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Basic Info */}
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-900/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm text-blue-400 flex items-center">
                <User className="h-4 w-4 mr-1.5" />
                Personal Information
              </h4>
              <EditButton step={1} />
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-blue-400">First Name</div>
                <div className="text-blue-100">{values.firstName}</div>
              </div>
              <div>
                <div className="text-xs text-blue-400">Last Name</div>
                <div className="text-blue-100">{values.lastName}</div>
              </div>
            </div>
          </div>

          {/* Account-specific info */}
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-900/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm text-blue-400 flex items-center">
                {userType === "personal" ? (
                  <Fingerprint className="h-4 w-4 mr-1.5" />
                ) : (
                  <Building2 className="h-4 w-4 mr-1.5" />
                )}
                {userType === "personal"
                  ? "Personal Details"
                  : "Company Details"}
              </h4>
              <EditButton step={1} />
            </div>
            {userType === "personal" ? (
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-blue-400">Personal ID/CIN</div>
                  <div className="text-blue-100">{values.cin || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-400">Phone Number</div>
                  <div className="text-blue-100">
                    {values.personalPhone || "—"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-blue-400">Company Name</div>
                  <div className="text-blue-100">
                    {values.companyName || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-blue-400">
                    Registration Number
                  </div>
                  <div className="text-blue-100">{values.companyRC || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-400">Company Phone</div>
                  <div className="text-blue-100">
                    {values.companyPhone || "—"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-900/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-blue-400 flex items-center">
              <MapPin className="h-4 w-4 mr-1.5" />
              Address Information
            </h4>
            <EditButton step={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <div className="text-xs text-blue-400">Address</div>
              <div className="text-blue-100">{values.address}</div>
            </div>
            <div>
              <div className="text-xs text-blue-400">City</div>
              <div className="text-blue-100">{values.city}</div>
            </div>
            <div>
              <div className="text-xs text-blue-400">Country</div>
              <div className="text-blue-100">{values.country}</div>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Email & Username */}
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-900/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm text-blue-400 flex items-center">
                <Mail className="h-4 w-4 mr-1.5" />
                Account Credentials
              </h4>
              <EditButton step={3} />
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-xs text-blue-400">Email</div>
                <div className="text-blue-100">{values.email}</div>
              </div>
              <div>
                <div className="text-xs text-blue-400">Username</div>
                <div className="text-blue-100">{values.username}</div>
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-900/50">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm text-blue-400 flex items-center">
                <Shield className="h-4 w-4 mr-1.5" />
                User Role
              </h4>
              <EditButton step={5} />
            </div>
            <div>
              <Badge
                className={`px-2 py-1 ${roleColors[values.roleName]} border`}
              >
                {values.roleName}
              </Badge>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-900/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm text-blue-400 flex items-center">
              <Lock className="h-4 w-4 mr-1.5" />
              Password
            </h4>
            <EditButton step={4} />
          </div>
          <div>
            <div className="text-xs text-blue-400">Password</div>
            <div className="text-blue-100">••••••••</div>
          </div>
        </div>

        {/* Additional Company Info (if applicable) */}
        {userType === "company" &&
          (values.companyEmail || values.companyWebsite) && (
            <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-900/50">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm text-blue-400 flex items-center">
                  <Globe className="h-4 w-4 mr-1.5" />
                  Additional Company Information
                </h4>
                <EditButton step={1} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {values.companyEmail && (
                  <div>
                    <div className="text-xs text-blue-400">Company Email</div>
                    <div className="text-blue-100">{values.companyEmail}</div>
                  </div>
                )}
                {values.companyWebsite && (
                  <div>
                    <div className="text-xs text-blue-400">Company Website</div>
                    <div className="text-blue-100">{values.companyWebsite}</div>
                  </div>
                )}
              </div>
            </div>
          )}

        <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 mt-6">
          <p className="text-center text-green-200 text-sm">
            Please confirm all information is correct before creating the user
            account. Click the edit icons{" "}
            <Pencil className="h-3 w-3 inline-block mx-1" /> to modify any
            section.
          </p>
        </div>
      </div>
    </div>
  );
}
