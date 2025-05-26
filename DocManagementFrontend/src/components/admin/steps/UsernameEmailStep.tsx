import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { AtSign, User, Check, Loader2, AlertCircle } from "lucide-react";

interface UsernameEmailStepProps {
  form: UseFormReturn<any>;
  usernameAvailable: boolean | null;
  emailAvailable: boolean | null;
  usernameChecking: boolean;
  emailChecking: boolean;
}

export function UsernameEmailStep({
  form,
  usernameAvailable,
  emailAvailable,
  usernameChecking,
  emailChecking,
}: UsernameEmailStepProps) {
  // Helper function to render availability indicator
  const renderAvailabilityIndicator = (
    isChecking: boolean,
    isAvailable: boolean | null,
    fieldName: string
  ) => {
    if (isChecking) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (isAvailable === true) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
          <Check className="h-4 w-4" />
        </div>
      );
    }

    if (isAvailable === false) {
      return (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400">
          <AlertCircle className="h-4 w-4" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">Username</h3>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">
                  Choose a username
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="username"
                      {...field}
                      className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                    {renderAvailabilityIndicator(
                      usernameChecking,
                      usernameAvailable,
                      "username"
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
                {usernameAvailable && (
                  <p className="text-xs text-green-400 mt-1">
                    Username is available
                  </p>
                )}
              </FormItem>
            )}
          />

          <p className="text-xs text-blue-400 mt-1">
            Username must be at least 3 characters and unique in the system.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <AtSign className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">Email Address</h3>
        </div>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400">
                      <AtSign className="h-4 w-4" />
                    </div>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                      className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                    {renderAvailabilityIndicator(
                      emailChecking,
                      emailAvailable,
                      "email"
                    )}
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
                {emailAvailable && (
                  <p className="text-xs text-green-400 mt-1">
                    Email is available
                  </p>
                )}
              </FormItem>
            )}
          />

          <p className="text-xs text-blue-400 mt-1">
            A verification email will be sent to this address.
          </p>
        </div>
      </div>
    </div>
  );
}
