
import React, { useState } from 'react';
import { useMultiStepForm } from '@/context/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const StepThreePersonalAddress: React.FC = () => {
  const { formData, setFormData, nextStep, prevStep } = useMultiStepForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  // No validation - fields are all optional
  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-white mb-1" htmlFor="personalAddress">
          Address
        </label>
        <Input
          id="personalAddress"
          name="personalAddress"
          value={formData.personalAddress || ''}
          onChange={handleChange}
          placeholder="Enter your address (optional)"
        />
      </div>
      <div>
        <label className="block text-white mb-1" htmlFor="city">
          City
        </label>
        <Input
          id="city"
          name="city"
          value={formData.city || ''}
          onChange={handleChange}
          placeholder="Your city (optional)"
        />
      </div>
      <div>
        <label className="block text-white mb-1" htmlFor="country">
          Country
        </label>
        <Input
          id="country"
          name="country"
          value={formData.country || ''}
          onChange={handleChange}
          placeholder="Your country (optional)"
        />
      </div>
      <div className="flex gap-4 pt-2">
        <Button type="button" variant="secondary" onClick={prevStep} className="flex-1">
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1 bg-docuBlue hover:bg-docuBlue-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepThreePersonalAddress;
