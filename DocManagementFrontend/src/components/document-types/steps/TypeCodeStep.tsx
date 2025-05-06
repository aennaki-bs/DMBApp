import { Control } from 'react-hook-form';
import { Check, Loader2 } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TypeCodeStepProps {
  control: Control<any>;
  isTypeCodeValid: boolean | null;
  isValidating: boolean;
  onTypeCodeChange: () => void;
  onGenerateCode: () => void;
  skipTypeCode: boolean;
  onSkipChange: (skip: boolean) => void;
}

export const TypeCodeStep = ({ 
  control, 
  isTypeCodeValid, 
  isValidating,
  onTypeCodeChange,
  onGenerateCode,
  skipTypeCode,
  onSkipChange
}: TypeCodeStepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox 
          id="manual-code"
          checked={!skipTypeCode}
          onCheckedChange={(checked) => onSkipChange(!checked)}
          className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
        <label
          htmlFor="manual-code"
          className="text-sm text-blue-200 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Generate code manually
        </label>
      </div>

      {!skipTypeCode ? (
        <FormField
          control={control}
          name="typeKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-blue-100">Type Code*</FormLabel>
              <FormControl>
                <div className="relative flex">
                  <Input 
                    {...field} 
                    placeholder="Enter document type code" 
                    className="h-8 text-xs bg-[#0A0E2E] border-blue-900/40 focus:border-blue-500 pr-7"
                    onChange={(e) => {
                      field.onChange(e);
                      onTypeCodeChange();
                    }}
                    maxLength={3}
                  />
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={onGenerateCode}
                    className="ml-2 h-8 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    Generate
                  </Button>
                  {isValidating && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                    </div>
                  )}
                  {isTypeCodeValid === true && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-xs text-blue-300/70 mt-0.5">
                The code must be unique and 2-3 characters long
              </FormDescription>
              {isTypeCodeValid === false && (
                <p className="text-xs text-red-500 flex items-center mt-0.5">
                  <span className="inline-block w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 text-center mr-1.5 flex items-center justify-center text-xs">!</span>
                  This type code already exists or is invalid
                </p>
              )}
              {isTypeCodeValid === true && (
                <p className="text-xs text-green-500 flex items-center mt-0.5">
                  <span className="inline-block w-3.5 h-3.5 rounded-full bg-green-500/20 text-green-400 text-center mr-1.5 flex items-center justify-center text-xs">✓</span>
                  Type code is available
                </p>
              )}
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      ) : (
        <div className="text-center text-sm text-blue-300 p-4 bg-blue-900/20 rounded-md border border-blue-900/30">
          <Check className="h-4 w-4 text-green-500 mx-auto mb-2" />
          Type code will be automatically generated on the server
        </div>
      )}
    </div>
  );
}; 