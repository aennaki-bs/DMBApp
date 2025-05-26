import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { User, Building2, PenLine, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";

// Update the form data type to include industry
interface FormData {
  userType?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  companyName?: string;
  companyRC?: string;
  industry?: string;
  [key: string]: any;
}

const PersonalInfoForm: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();
  const { userType } = formData;

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Industry options for company accounts
  const industryOptions = [
    { value: "", label: "Select an industry" },
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "retail", label: "Retail" },
    { value: "other", label: "Other" },
  ];

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle field blur
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, e.target.value);
  };

  // Validate a single field
  const validateField = (name: string, value: string) => {
    let error = "";

    // Required fields
    if (
      (userType === "personal" &&
        ["firstName", "lastName"].includes(name) &&
        !value.trim()) ||
      (userType === "company" &&
        ["companyName", "companyRC"].includes(name) &&
        !value.trim())
    ) {
      error = `${name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())} is required`;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (userType === "personal") {
      // Personal account validation
      if (!formData.firstName?.trim()) {
        newErrors.firstName = "First Name is required";
        isValid = false;
      }

      if (!formData.lastName?.trim()) {
        newErrors.lastName = "Last Name is required";
        isValid = false;
      }

      // CIN is optional
    } else {
      // Company account validation
      if (!formData.companyName?.trim()) {
        newErrors.companyName = "Company Name is required";
        isValid = false;
      }

      if (!formData.companyRC?.trim()) {
        newErrors.companyRC = "Registration Number is required";
        isValid = false;
      }

      if (!formData.industry?.trim()) {
        newErrors.industry = "Industry is required";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const requiredFields =
      userType === "personal"
        ? { firstName: true, lastName: true, cin: true }
        : { companyName: true, companyRC: true, industry: true };

    setTouched((prev) => ({ ...prev, ...requiredFields }));

    // Validate all fields
    if (validateForm()) {
      nextStep();
    }
  };

  // Check if field has error
  const hasError = (name: string) => {
    return !!(touched[name] && errors[name]);
  };

  // Render error message
  const renderError = (fieldName: string) => {
    if (hasError(fieldName)) {
      return (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-400 mt-1.5 ml-1"
        >
          {errors[fieldName]}
        </motion.p>
      );
    }
    return null;
  };

  // Form content based on account type
  const renderFormContent = () => {
    if (userType === "personal") {
      return (
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
                <User className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-blue-200">
                Personal Information
              </h3>
            </div>

            <div className="space-y-5">
              {/* First name */}
              <div>
                <FormInput
                  id="firstName"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="First Name"
                  icon={<User className="h-4 w-4" />}
                  error={hasError("firstName")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={!!(touched.firstName && !errors.firstName)}
                  aria-label="First Name"
                  autoComplete="given-name"
                />
                {renderError("firstName")}
              </div>

              {/* Last name */}
              <div>
                <FormInput
                  id="lastName"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Last Name"
                  icon={<User className="h-4 w-4" />}
                  error={hasError("lastName")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={!!(touched.lastName && !errors.lastName)}
                  aria-label="Last Name"
                  autoComplete="family-name"
                />
                {renderError("lastName")}
              </div>

              {/* ID Number (optional) */}
              <div>
                <FormInput
                  id="cin"
                  name="cin"
                  value={formData.cin || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ID Number (optional)"
                  icon={<CreditCard className="h-4 w-4" />}
                  error={hasError("cin")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={!!(touched.cin && formData.cin)}
                  aria-label="ID Number"
                />
                {renderError("cin")}
              </div>
            </div>
          </div>

          {/* Info alert */}
          <div className="bg-blue-900/30 rounded-lg p-4 text-sm text-blue-300 border border-blue-800/30">
            <p className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              This information will be used to set up your account profile in
              our system.
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-medium text-blue-200">
                Company Information
              </h3>
            </div>

            <div className="space-y-5">
              {/* Company name */}
              <div>
                <FormInput
                  id="companyName"
                  name="companyName"
                  value={formData.companyName || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Company Name"
                  icon={<Building2 className="h-4 w-4" />}
                  error={hasError("companyName")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={!!(touched.companyName && !errors.companyName)}
                  aria-label="Company Name"
                  autoComplete="organization"
                />
                {renderError("companyName")}
              </div>

              {/* Registration number */}
              <div>
                <FormInput
                  id="companyRC"
                  name="companyRC"
                  value={formData.companyRC || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Registration Number"
                  icon={<PenLine className="h-4 w-4" />}
                  error={hasError("companyRC")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={!!(touched.companyRC && !errors.companyRC)}
                  aria-label="Registration Number"
                />
                {renderError("companyRC")}
              </div>

              {/* Industry */}
              <div>
                <FormSelect
                  id="industry"
                  name="industry"
                  value={formData.industry || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Industry"
                  icon={<Building2 className="h-4 w-4" />}
                  options={industryOptions}
                  error={hasError("industry")}
                  showLabelAnimation
                  aria-label="Industry"
                />
                {renderError("industry")}
              </div>
            </div>
          </div>

          {/* Info alert */}
          <div className="bg-blue-900/30 rounded-lg p-4 text-sm text-blue-300 border border-blue-800/30">
            <p className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Your company information will be used for invoicing and account
              management.
            </p>
          </div>
        </div>
      );
    }
  };

  // Check if there are any validation errors before showing the form
  useEffect(() => {
    // Clear errors when switching account types
    setErrors({});
    setTouched({});
  }, [userType]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error message for missing fields */}
      {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/30 border border-red-800/30 text-red-300 px-4 py-3 rounded-md text-sm"
        >
          Please fill out all required fields
        </motion.div>
      )}

      {renderFormContent()}

      {/* ERP decoration */}
      <div className="flex justify-center mt-4 opacity-20">
        <svg
          width="120"
          height="20"
          viewBox="0 0 120 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="circuit"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 10h20M10 0v20"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="0.5"
              fill="none"
            />
          </pattern>
          <rect width="120" height="20" fill="url(#circuit)" />
          <circle cx="60" cy="10" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="20" cy="10" r="2" fill="currentColor" fillOpacity="0.6" />
          <circle
            cx="100"
            cy="10"
            r="2"
            fill="currentColor"
            fillOpacity="0.6"
          />
        </svg>
      </div>
    </form>
  );
};

export default PersonalInfoForm;
