import { useFormContext } from "react-hook-form";
import {
  Building2,
  User,
  Phone,
  Fingerprint,
  Globe,
  Mail,
  Hash,
} from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AccountDetailsStepProps {
  userType: "personal" | "company";
}

export function AccountDetailsStep({ userType }: AccountDetailsStepProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      {/* Common fields for both account types */}
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-900/30">
        <h3 className="text-lg font-medium text-blue-100 mb-4">
          {userType === "personal"
            ? "Personal Information"
            : "Company Information"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* First Name */}
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">First Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      placeholder="John"
                      {...field}
                      className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          {/* Last Name */}
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">Last Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      placeholder="Doe"
                      {...field}
                      className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
        </div>

        {/* Dynamic fields based on user type */}
        {userType === "personal" ? (
          <div className="space-y-4">
            {/* Personal ID/CIN */}
            <FormField
              control={control}
              name="cin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">
                    Personal ID/CIN
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Fingerprint className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="ID12345678"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Personal Phone */}
            <FormField
              control={control}
              name="personalPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="+1 (123) 456-7890"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Company Name */}
            <FormField
              control={control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Company Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="Acme Corporation"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Company Registration Number */}
            <FormField
              control={control}
              name="companyRC"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">
                    Registration Number (RC)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="RC123456789"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Company Phone */}
            <FormField
              control={control}
              name="companyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Company Phone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="+1 (123) 456-7890"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Company Email */}
            <FormField
              control={control}
              name="companyEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Company Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="info@company.com"
                        type="email"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Company Website */}
            <FormField
              control={control}
              name="companyWebsite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">
                    Company Website
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="https://company.com"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
}
