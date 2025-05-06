
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PasswordStrengthIndicator from '../password/PasswordStrengthIndicator';

interface PasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localErrors: Record<string, string>;
  passwordStrength: number;
}

const PasswordFields: React.FC<PasswordFieldsProps> = ({
  password,
  confirmPassword,
  onChange,
  localErrors,
  passwordStrength
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Determine if fields are valid, have errors, or are empty
  const hasPasswordError = !!localErrors.password;
  const hasConfirmError = !!localErrors.confirmPassword;
  
  const isPasswordValid = password && !hasPasswordError && passwordStrength >= 3;
  const isConfirmValid = confirmPassword && password === confirmPassword && !hasConfirmError;
  
  const isPasswordEmpty = !password;
  const isConfirmEmpty = !confirmPassword;

  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="password">Create new password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create new password"
            className="pl-10 pr-12"
            error={!isPasswordEmpty && hasPasswordError}
            value={password}
            onChange={onChange}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {isPasswordValid && (
            <CheckCircle2 className="absolute right-10 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.password && (
          <p className="text-xs text-red-500">{localErrors.password}</p>
        )}
        <PasswordStrengthIndicator strength={passwordStrength} password={password} />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            className="pl-10 pr-12"
            error={!isConfirmEmpty && hasConfirmError}
            value={confirmPassword}
            onChange={onChange}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {isConfirmValid && (
            <CheckCircle2 className="absolute right-10 top-3 h-4 w-4 text-green-500" />
          )}
        </div>
        {localErrors.confirmPassword && (
          <p className="text-xs text-red-500">{localErrors.confirmPassword}</p>
        )}
      </div>
    </>
  );
};

export default PasswordFields;
