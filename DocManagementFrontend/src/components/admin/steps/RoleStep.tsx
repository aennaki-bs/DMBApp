import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Shield, UserCog, Users, User } from "lucide-react";
import { motion } from "framer-motion";

interface RoleStepProps {
  form: UseFormReturn<any>;
}

export function RoleStep({ form }: RoleStepProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            Role Assignment
          </h3>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="roleName"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel className="text-blue-200">
                  Select user role
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-3">
                    {/* Admin Role */}
                    <RoleOption
                      id="Admin"
                      title="Admin"
                      description="Full system access with all privileges"
                      icon={<UserCog className="h-5 w-5" />}
                      color="bg-red-900/20 border-red-800/30 hover:bg-red-900/30"
                      activeColor="border-red-500 bg-red-900/30"
                      iconColor="bg-red-900/40 text-red-400"
                      activeIconColor="bg-red-600 text-red-100"
                      textColor="text-red-300"
                      field={field}
                    />

                    {/* Full User Role */}
                    <RoleOption
                      id="FullUser"
                      title="Full User"
                      description="Extended access with document management capabilities"
                      icon={<Users className="h-5 w-5" />}
                      color="bg-emerald-900/20 border-emerald-800/30 hover:bg-emerald-900/30"
                      activeColor="border-emerald-500 bg-emerald-900/30"
                      iconColor="bg-emerald-900/40 text-emerald-400"
                      activeIconColor="bg-emerald-600 text-emerald-100"
                      textColor="text-emerald-300"
                      field={field}
                    />

                    {/* Simple User Role */}
                    <RoleOption
                      id="SimpleUser"
                      title="Simple User"
                      description="Basic access with limited permissions"
                      icon={<User className="h-5 w-5" />}
                      color="bg-blue-900/20 border-blue-800/30 hover:bg-blue-900/30"
                      activeColor="border-blue-500 bg-blue-900/30"
                      iconColor="bg-blue-900/40 text-blue-400"
                      activeIconColor="bg-blue-600 text-blue-100"
                      textColor="text-blue-300"
                      field={field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="bg-blue-900/30 rounded-lg p-4 text-sm text-blue-300 border border-blue-800/30">
        <p className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          The role determines what actions and resources the user can access.
        </p>
      </div>
    </div>
  );
}

// Helper component for role options
interface RoleOptionProps {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  iconColor: string;
  activeIconColor: string;
  textColor: string;
  field: {
    value: string;
    onChange: (value: string) => void;
  };
}

function RoleOption({
  id,
  title,
  description,
  icon,
  color,
  activeColor,
  iconColor,
  activeIconColor,
  textColor,
  field,
}: RoleOptionProps) {
  const isActive = field.value === id;

  return (
    <div
      className={`group cursor-pointer border rounded-xl p-4 transition-all ${
        isActive ? activeColor : color
      }`}
      onClick={() => field.onChange(id)}
    >
      <div className="flex items-start gap-3">
        <div
          className={`rounded-full p-2 transition-all ${
            isActive ? activeIconColor : iconColor
          }`}
        >
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className={`text-base font-medium ${textColor}`}>{title}</h3>
          <p className="text-sm text-blue-300">{description}</p>

          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className={`text-xs ${textColor} mt-2 border-t border-blue-700/30 pt-2`}
            >
              <ul className="list-disc list-inside space-y-1">
                {id === "Admin" && (
                  <>
                    <li>User management</li>
                    <li>System configuration</li>
                    <li>Full access to all features</li>
                  </>
                )}
                {id === "FullUser" && (
                  <>
                    <li>Document creation and management</li>
                    <li>Workflow approval capabilities</li>
                    <li>Reporting access</li>
                  </>
                )}
                {id === "SimpleUser" && (
                  <>
                    <li>View and edit own documents</li>
                    <li>Basic workflow participation</li>
                    <li>Limited feature access</li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
