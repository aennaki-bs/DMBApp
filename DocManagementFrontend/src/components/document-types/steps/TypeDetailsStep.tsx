
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";

interface TypeDetailsStepProps {
  control: Control<any>;
}

export const TypeDetailsStep = ({ control }: TypeDetailsStepProps) => {
  return (
    <>
      <FormField
        control={control}
        name="typeName"
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel className="text-xs text-blue-100">Type Name*</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="Enter document type name" 
                className="h-8 text-xs bg-[#0A0E2E] border-blue-900/40 focus:border-blue-500"
              />
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    
      <FormField
        control={control}
        name="typeAttr"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-blue-100">Type Description (Optional)</FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="Enter description (optional)" 
                className="h-8 text-xs bg-[#0A0E2E] border-blue-900/40 focus:border-blue-500"
              />
            </FormControl>
            <FormDescription className="text-xs text-blue-300/70">
              Additional description for this document type
            </FormDescription>
            <FormMessage className="text-xs" />
          </FormItem>
        )}
      />
    </>
  );
};
