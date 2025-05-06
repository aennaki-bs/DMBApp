
import React, { useState } from 'react';
import { useMultiStepForm } from '@/context/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';
import { FormError } from '@/components/ui/form-error';

const StepFourAdminKey = () => {
  const { formData, setFormData, prevStep, nextStep, stepValidation } = useMultiStepForm();
  const [showAdminField, setShowAdminField] = useState<boolean>(!!formData.adminSecretKey);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAdminField(e.target.checked);
    if (!e.target.checked) {
      setFormData({ adminSecretKey: '' });
    }
  };

  const handleNext = () => {
    // Only validate if checkbox is checked (user wants admin access)
    if (showAdminField && !formData.adminSecretKey) {
      // Display validation error for empty admin key
      setFormData({ 
        validationError: "Admin key is required when admin access is selected" 
      });
      return;
    }
    
    // Clear any validation errors and proceed
    setFormData({ validationError: undefined });
    nextStep();
  };

  return (
    <div className="space-y-6">
      {/* Error will now be handled by the parent RegisterForm component */}
      
      <div className="text-center mb-6">
        <div className="bg-amber-600/20 p-3 rounded-full inline-flex mb-3">
          <Shield className="h-6 w-6 text-amber-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">Admin Access (Optional)</h3>
        <p className="text-sm text-gray-500">
          Enable admin access if you have administrative privileges.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <input
          type="checkbox"
          id="user-admin-checkbox"
          checked={showAdminField}
          onChange={handleCheckbox}
          className="form-checkbox h-4 w-4 accent-blue-600"
        />
        <Label htmlFor="user-admin-checkbox" className="text-sm font-medium text-white">
          User admin
        </Label>
      </div>

      {showAdminField && (
        <div className="space-y-2">
          <Label htmlFor="adminSecretKey" className="text-sm font-medium">
            Admin Key
          </Label>
          <Input
            id="adminSecretKey"
            name="adminSecretKey"
            type="password"
            placeholder="Enter admin secret key"
            value={formData.adminSecretKey || ""}
            onChange={handleChange}
            className="bg-black/5 border-blue-900/20 h-11"
          />
        </div>
      )}

      <div className="flex gap-3 pt-6">
        <Button
          type="button"
          className="flex-1"
          variant="outline"
          onClick={prevStep}
        >
          Back
        </Button>
        <Button
          type="button"
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0"
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepFourAdminKey;
