
import React from 'react';
import UsernameField from '../fields/UsernameField';
import EmailField from '../fields/EmailField';
import PasswordFields from '../fields/PasswordFields';

interface StepTwoFormFieldsProps {
  formData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  localErrors: Record<string, string>;
  validationErrors: Record<string, string>;
  passwordStrength: number;
}

const StepTwoFormFields: React.FC<StepTwoFormFieldsProps> = ({
  formData,
  onChange,
  localErrors,
  validationErrors,
  passwordStrength
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 mb-2">
      <UsernameField
        value={formData.username}
        onChange={onChange}
        localErrors={localErrors}
        validationErrors={validationErrors}
      />
      
      <EmailField
        value={formData.email}
        onChange={onChange}
        localErrors={localErrors}
        validationErrors={validationErrors}
      />
      
      <PasswordFields
        password={formData.password}
        confirmPassword={formData.confirmPassword}
        onChange={onChange}
        localErrors={localErrors}
        passwordStrength={passwordStrength}
      />
    </div>
  );
};

export default StepTwoFormFields;
