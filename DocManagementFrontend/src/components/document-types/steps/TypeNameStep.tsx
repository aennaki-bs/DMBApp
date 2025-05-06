
import { Control } from 'react-hook-form';
import { Check, Loader2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";

interface TypeNameStepProps {
  control: Control<any>;
  isTypeNameValid: boolean | null;
  isValidating: boolean;
  onTypeNameChange: () => void;
}

export const TypeNameStep = ({ 
  control, 
  isTypeNameValid, 
  isValidating,
  onTypeNameChange 
}: TypeNameStepProps) => {
  return (
    <FormField
      control={control}
      name="typeName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-xs text-blue-100">Type Name*</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                {...field} 
                placeholder="Enter document type name" 
                className="h-8 text-xs bg-[#0A0E2E] border-blue-900/40 focus:border-blue-500 pr-7"
                onChange={(e) => {
                  field.onChange(e);
                  onTypeNameChange();
                }}
              />
              {isValidating && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                </div>
              )}
              {isTypeNameValid === true && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Check className="h-3.5 w-3.5 text-green-500" />
                </div>
              )}
            </div>
          </FormControl>
          <FormDescription className="text-xs text-blue-300/70 mt-0.5">
            This name must be unique and at least 2 characters long
          </FormDescription>
          {isTypeNameValid === false && (
            <p className="text-xs text-red-500 flex items-center mt-0.5">
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 text-center mr-1.5 flex items-center justify-center text-xs">!</span>
              This type name already exists
            </p>
          )}
          {isTypeNameValid === true && (
            <p className="text-xs text-green-500 flex items-center mt-0.5">
              <span className="inline-block w-3.5 h-3.5 rounded-full bg-green-500/20 text-green-400 text-center mr-1.5 flex items-center justify-center text-xs">✓</span>
              Type name is available
            </p>
          )}
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};
