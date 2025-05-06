
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2 } from 'lucide-react';

interface EmailFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localErrors: Record<string, string>;
  validationErrors: Record<string, string>;
}

const EmailField: React.FC<EmailFieldProps> = ({
  value,
  onChange,
  localErrors,
  validationErrors
}) => {
  const hasError = !!(localErrors.email || validationErrors.email);
  const isValid = value && !hasError;
  
  return (
    <div className="space-y-1">
      <Label htmlFor="email">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          className="pl-10 pr-10"
          error={value && hasError}
          value={value}
          onChange={onChange}
        />
        {isValid && (
          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
        )}
      </div>
      {localErrors.email && (
        <p className="text-xs text-red-500">{localErrors.email}</p>
      )}
      {validationErrors.email && (
        <p className="text-xs text-red-500">{validationErrors.email}</p>
      )}
    </div>
  );
};

export default EmailField;
