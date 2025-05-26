import { useFormContext } from "react-hook-form";
import { Mail, User, Lock, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CredentialsStepProps {
  // For email/username step
  isEmailAvailable?: boolean | null;
  isUsernameAvailable?: boolean | null;
  isCheckingEmail?: boolean;
  isCheckingUsername?: boolean;

  // For password step
  isPassword?: boolean;
  showPassword?: boolean;
  togglePasswordVisibility?: () => void;
}

export function CredentialsStep({
  isEmailAvailable,
  isUsernameAvailable,
  isCheckingEmail,
  isCheckingUsername,
  isPassword = false,
  showPassword,
  togglePasswordVisibility,
}: CredentialsStepProps) {
  const { control, watch } = useFormContext();

  // For password strength indicator
  const password = watch("password", "");

  // Calculate password strength
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, text: "", color: "bg-gray-200" };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthText = [
      "Very Weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Very Strong",
    ][strength];

    const colors = [
      "bg-red-500",
      "bg-red-400",
      "bg-yellow-400",
      "bg-yellow-300",
      "bg-green-400",
      "bg-green-500",
    ];

    return {
      strength: (strength / 5) * 100,
      text: strengthText,
      color: colors[strength],
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-900/30">
        {isPassword ? (
          <>
            <h3 className="text-lg font-medium text-blue-100 mb-4">
              Create Password
            </h3>
            <div className="space-y-4">
              {/* Password */}
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 pr-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />

                    {/* Password strength indicator */}
                    <div className="mt-3">
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="text-blue-300">
                          Password Strength:
                        </span>
                        <span className="text-blue-300">
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-blue-900/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${passwordStrength.strength}%` }}
                        ></motion.div>
                      </div>

                      {/* Password requirements */}
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-blue-300">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[A-Z]/.test(password)
                                ? "bg-green-500"
                                : "bg-blue-900/50"
                            }`}
                          ></div>
                          <span>Uppercase letter</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-300">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[a-z]/.test(password)
                                ? "bg-green-500"
                                : "bg-blue-900/50"
                            }`}
                          ></div>
                          <span>Lowercase letter</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-300">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[0-9]/.test(password)
                                ? "bg-green-500"
                                : "bg-blue-900/50"
                            }`}
                          ></div>
                          <span>Number</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-300">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              /[^A-Za-z0-9]/.test(password)
                                ? "bg-green-500"
                                : "bg-blue-900/50"
                            }`}
                          ></div>
                          <span>Special character</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-blue-300">
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              password.length >= 8
                                ? "bg-green-500"
                                : "bg-blue-900/50"
                            }`}
                          ></div>
                          <span>8+ characters</span>
                        </div>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="pl-10 pr-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                    <FormDescription className="text-xs text-blue-400 mt-1">
                      Please enter your password again to confirm.
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-blue-100 mb-4">
              Account Credentials
            </h3>
            <div className="space-y-4">
              {/* Email */}
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <Input
                          placeholder="user@example.com"
                          type="email"
                          {...field}
                          className={`pl-10 pr-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50 ${
                            isEmailAvailable === false
                              ? "border-red-500"
                              : isEmailAvailable === true
                              ? "border-green-500"
                              : ""
                          }`}
                        />
                        {isCheckingEmail && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                          </div>
                        )}
                        {!isCheckingEmail && isEmailAvailable !== null && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {isEmailAvailable ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                    {isEmailAvailable === false && (
                      <p className="text-red-400 text-xs mt-1">
                        This email is already in use. Please choose another.
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <Input
                          placeholder="username"
                          {...field}
                          className={`pl-10 pr-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50 ${
                            isUsernameAvailable === false
                              ? "border-red-500"
                              : isUsernameAvailable === true
                              ? "border-green-500"
                              : ""
                          }`}
                        />
                        {isCheckingUsername && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                          </div>
                        )}
                        {!isCheckingUsername &&
                          isUsernameAvailable !== null && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {isUsernameAvailable ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                    {isUsernameAvailable === false && (
                      <p className="text-red-400 text-xs mt-1">
                        This username is already taken. Please choose another.
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <p className="text-blue-300 text-sm mt-4">
              <strong>Note:</strong> Email will be used for verification and
              account recovery.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
