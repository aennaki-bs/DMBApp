import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PersonalUserFields from "./personal/PersonalUserFields";
import CompanyUserFields from "./company/CompanyUserFields";
import {
  validatePersonalUserInfo,
  validateCompanyInfo,
} from "./utils/validation";

const StepOneUserInfo = () => {
  const { formData, setFormData, nextStep, prevStep } = useMultiStepForm();
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  // Track which fields have been interacted with
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    cin: false,
    personalPhone: false,
    companyName: false,
    companyRC: false,
    companyAddress: false,
    companyPhone: false,
    companyEmail: false,
  });

  // Validate on data change but only show errors for touched fields
  useEffect(() => {
    const errors =
      formData.userType === "personal"
        ? validatePersonalUserInfo(formData)
        : validateCompanyInfo(formData);

    setLocalErrors(errors);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  const validateStep = (showToast = true) => {
    let errors: Record<string, string> = {};

    if (formData.userType === "personal") {
      errors = validatePersonalUserInfo(formData);
    } else {
      errors = validateCompanyInfo(formData);
    }

    // Set all fields as touched when the user tries to proceed
    const allFieldsTouched: Record<string, boolean> = {};
    Object.keys(touchedFields).forEach((key) => {
      allFieldsTouched[key] = true;
    });
    setTouchedFields(allFieldsTouched);

    setLocalErrors(errors);

    if (showToast && Object.keys(errors).length > 0) {
      toast.error("Please fill all required fields");
    }

    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(true)) {
      return;
    }

    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  // Filter errors to only show for touched fields
  const visibleErrors: Record<string, string> = {};
  Object.keys(localErrors).forEach((key) => {
    if (touchedFields[key]) {
      visibleErrors[key] = localErrors[key];
    }
  });

  return (
    <div className="space-y-5">
      <div>
        {/* Personal User Fields */}
        {formData.userType === "personal" && (
          <PersonalUserFields
            formData={formData}
            localErrors={visibleErrors}
            handleChange={handleChange}
          />
        )}

        {/* Company Fields */}
        {formData.userType === "company" && (
          <CompanyUserFields
            formData={formData}
            localErrors={visibleErrors}
            handleChange={handleChange}
          />
        )}
      </div>

      <div className="pt-2 flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="w-1/3 border-gray-700 hover:bg-gray-800"
          onClick={handleBack}
        >
          Back
        </Button>
        <Button
          type="button"
          className="w-2/3 bg-docuBlue hover:bg-docuBlue-700"
          onClick={handleNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default StepOneUserInfo;
