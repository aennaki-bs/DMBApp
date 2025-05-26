import { useFormContext } from "react-hook-form";
import { Building2, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";

export function UserTypeStep() {
  const { register, watch, setValue } = useFormContext();
  const userType = watch("userType");

  const handleTypeChange = (value: string) => {
    setValue("userType", value, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-900/30">
        <h3 className="text-lg font-medium text-blue-100 mb-4">
          Select Account Type
        </h3>

        <RadioGroup
          defaultValue={userType}
          value={userType}
          onValueChange={handleTypeChange}
          className="flex flex-col gap-4"
        >
          {/* Personal User Option */}
          <Label
            htmlFor="personal"
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              userType === "personal"
                ? "border-blue-500 bg-blue-500/10"
                : "border-blue-900/50 bg-blue-900/10 hover:border-blue-700/50 hover:bg-blue-900/20"
            }`}
          >
            <RadioGroupItem
              value="personal"
              id="personal"
              className="sr-only"
            />
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors ${
                userType === "personal"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-900/20 text-blue-500/50"
              }`}
            >
              <User className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <div className="font-medium text-blue-100">Personal Account</div>
              <div className="text-sm text-blue-300">
                Individual user account for personal use
              </div>
            </div>
            <div className="w-5 h-5 relative">
              {userType === "personal" && (
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
          </Label>

          {/* Company User Option */}
          <Label
            htmlFor="company"
            className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              userType === "company"
                ? "border-blue-500 bg-blue-500/10"
                : "border-blue-900/50 bg-blue-900/10 hover:border-blue-700/50 hover:bg-blue-900/20"
            }`}
          >
            <RadioGroupItem value="company" id="company" className="sr-only" />
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors ${
                userType === "company"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-blue-900/20 text-blue-500/50"
              }`}
            >
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex-grow">
              <div className="font-medium text-blue-100">Company Account</div>
              <div className="text-sm text-blue-300">
                Business account with additional features
              </div>
            </div>
            <div className="w-5 h-5 relative">
              {userType === "company" && (
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
          </Label>
        </RadioGroup>

        <p className="text-blue-300 text-sm mt-4">
          <strong>Note:</strong> Different account types have specific
          requirements and features.
        </p>
      </div>
    </div>
  );
}
