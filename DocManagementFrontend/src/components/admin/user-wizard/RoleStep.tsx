import { useFormContext } from "react-hook-form";
import { ShieldCheck, ShieldAlert, Shield, Info } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";

export function RoleStep() {
  const { control, watch, setValue } = useFormContext();
  const roleName = watch("roleName");

  const handleRoleChange = (value: string) => {
    setValue("roleName", value, { shouldValidate: true });
  };

  const roleInfo = {
    Admin: {
      description:
        "Full access to all features and settings including user management",
      permissions: [
        "Manage users",
        "Manage roles",
        "Access all documents",
        "System settings",
        "Run all operations",
      ],
      icon: <ShieldAlert className="h-5 w-5" />,
      color: "red",
    },
    FullUser: {
      description: "Create and manage documents with extended permissions",
      permissions: [
        "Create documents",
        "Edit documents",
        "Delete own documents",
        "View document details",
        "Access reports",
      ],
      icon: <ShieldCheck className="h-5 w-5" />,
      color: "emerald",
    },
    SimpleUser: {
      description: "Basic access with limited permissions",
      permissions: [
        "View assigned documents",
        "Basic document operations",
        "Personal profile management",
        "Limited reporting",
      ],
      icon: <Shield className="h-5 w-5" />,
      color: "blue",
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-900/30">
        <h3 className="text-lg font-medium text-blue-100 mb-4">
          User Role & Permissions
        </h3>

        <FormField
          control={control}
          name="roleName"
          render={({ field }) => (
            <FormItem className="space-y-5">
              <FormControl>
                <RadioGroup
                  onValueChange={handleRoleChange}
                  defaultValue={field.value}
                  value={field.value}
                  className="flex flex-col gap-4"
                >
                  {/* Admin Role */}
                  <label
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      roleName === "Admin"
                        ? "border-red-500/70 bg-red-900/10"
                        : "border-blue-900/50 bg-blue-900/10 hover:border-blue-700/50 hover:bg-blue-900/20"
                    }`}
                  >
                    <RadioGroupItem
                      value="Admin"
                      id="admin"
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center mr-4 transition-colors ${
                        roleName === "Admin"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-900/20 text-blue-500/50"
                      }`}
                    >
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="flex-grow">
                      <div
                        className={`font-medium ${
                          roleName === "Admin"
                            ? "text-red-300"
                            : "text-blue-100"
                        }`}
                      >
                        Administrator
                      </div>
                      <div className="text-sm text-blue-300 mb-2">
                        {roleInfo.Admin.description}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {roleInfo.Admin.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className={`text-xs px-2 py-1 rounded-full ${
                              roleName === "Admin"
                                ? "bg-red-500/10 text-red-300 border border-red-500/30"
                                : "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                            }`}
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="w-5 h-5 relative">
                      {roleName === "Admin" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        </motion.div>
                      )}
                    </div>
                  </label>

                  {/* Full User Role */}
                  <label
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      roleName === "FullUser"
                        ? "border-emerald-500/70 bg-emerald-900/10"
                        : "border-blue-900/50 bg-blue-900/10 hover:border-blue-700/50 hover:bg-blue-900/20"
                    }`}
                  >
                    <RadioGroupItem
                      value="FullUser"
                      id="fullUser"
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center mr-4 transition-colors ${
                        roleName === "FullUser"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-blue-900/20 text-blue-500/50"
                      }`}
                    >
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-grow">
                      <div
                        className={`font-medium ${
                          roleName === "FullUser"
                            ? "text-emerald-300"
                            : "text-blue-100"
                        }`}
                      >
                        Full User
                      </div>
                      <div className="text-sm text-blue-300 mb-2">
                        {roleInfo.FullUser.description}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {roleInfo.FullUser.permissions.map(
                          (permission, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                roleName === "FullUser"
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                                  : "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                              }`}
                            >
                              {permission}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="w-5 h-5 relative">
                      {roleName === "FullUser" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        </motion.div>
                      )}
                    </div>
                  </label>

                  {/* Simple User Role */}
                  <label
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      roleName === "SimpleUser"
                        ? "border-blue-500/70 bg-blue-900/10"
                        : "border-blue-900/50 bg-blue-900/10 hover:border-blue-700/50 hover:bg-blue-900/20"
                    }`}
                  >
                    <RadioGroupItem
                      value="SimpleUser"
                      id="simpleUser"
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center mr-4 transition-colors ${
                        roleName === "SimpleUser"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-blue-900/20 text-blue-500/50"
                      }`}
                    >
                      <Shield className="h-6 w-6" />
                    </div>
                    <div className="flex-grow">
                      <div
                        className={`font-medium ${
                          roleName === "SimpleUser"
                            ? "text-blue-300"
                            : "text-blue-100"
                        }`}
                      >
                        Simple User
                      </div>
                      <div className="text-sm text-blue-300 mb-2">
                        {roleInfo.SimpleUser.description}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {roleInfo.SimpleUser.permissions.map(
                          (permission, index) => (
                            <span
                              key={index}
                              className={`text-xs px-2 py-1 rounded-full ${
                                roleName === "SimpleUser"
                                  ? "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                                  : "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                              }`}
                            >
                              {permission}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="w-5 h-5 relative">
                      {roleName === "SimpleUser" && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute inset-0 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        </motion.div>
                      )}
                    </div>
                  </label>
                </RadioGroup>
              </FormControl>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />

        <div className="flex items-start gap-2 mt-4 bg-blue-900/30 p-3 rounded-md border border-blue-900/50">
          <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            User roles determine the level of access and permissions within the
            system. Choose carefully as some role permissions cannot be changed
            later without admin intervention.
          </p>
        </div>
      </div>
    </div>
  );
}
