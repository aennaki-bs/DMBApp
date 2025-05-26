import { useFormContext } from "react-hook-form";
import { MapPin, Building, Globe } from "lucide-react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function AddressStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="bg-blue-900/20 p-6 rounded-lg border border-blue-900/30">
        <h3 className="text-lg font-medium text-blue-100 mb-4">
          Address Information
        </h3>

        <div className="space-y-4">
          {/* Street Address */}
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-blue-200">Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <Input
                      placeholder="123 Main Street, Apt 4B"
                      {...field}
                      className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City */}
            <FormField
              control={control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">City</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="New York"
                        {...field}
                        className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-300" />
                </FormItem>
              )}
            />

            {/* Country */}
            <FormField
              control={control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-200">Country</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                      <Input
                        placeholder="United States"
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
        </div>

        <p className="text-blue-300 text-sm mt-4">
          <strong>Note:</strong> Please provide accurate address information for
          verification purposes.
        </p>
      </div>
    </div>
  );
}
