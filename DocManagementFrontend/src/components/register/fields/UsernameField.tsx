
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, CheckCircle2 } from 'lucide-react';

interface UsernameFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localErrors: Record<string, string>;
  validationErrors: Record<string, string>;
}

const UsernameField: React.FC<UsernameFieldProps> = ({
  value,
  onChange,
  localErrors,
  validationErrors
}) => {
  const hasError = !!(localErrors.username || validationErrors.username);
  const isValid = value && !hasError;
  
  return (
    <div className="space-y-1">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          id="username"
          name="username"
          placeholder="Choose a unique username"
          className="pl-10 pr-10"
          error={value && hasError}
          value={value}
          onChange={onChange}
        />
        {isValid && (
          <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-500" />
        )}
      </div>
      {localErrors.username && (
        <p className="text-xs text-red-500">{localErrors.username}</p>
      )}
      {validationErrors.username && (
        <p className="text-xs text-red-500">{validationErrors.username}</p>
      )}
    </div>
  );
};

export default UsernameField;
