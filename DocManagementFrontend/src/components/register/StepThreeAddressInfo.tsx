import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { motion } from "framer-motion";
import { FormInput } from "./FormInput";
import { FormSelect } from "./FormSelect";
import { MapPin, Phone, Globe } from "lucide-react";

// Update the form data type to include address fields
interface FormData {
  userType?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
  website?: string;
  [key: string]: any;
}

const AddressStep: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isPersonal = formData.userType === "personal";

  // Country options
  const countries = [
    { value: "", label: "Select a country" },
    { value: "USA", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "CA", label: "Canada" },
    { value: "AU", label: "Australia" },
    { value: "FR", label: "France" },
    { value: "DE", label: "Germany" },
    { value: "ES", label: "Spain" },
    { value: "IT", label: "Italy" },
    { value: "JP", label: "Japan" },
    { value: "CN", label: "China" },
    { value: "IN", label: "India" },
    { value: "BR", label: "Brazil" },
    { value: "RU", label: "Russia" },
    // Add more countries as needed
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

    // Required fields validation
    if (
      ["address", "city", "country", "phoneNumber"].includes(name) &&
      !value.trim()
    ) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Phone number validation
    if (name === "phoneNumber" && value.trim()) {
      const phonePattern =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phonePattern.test(value)) {
        error = "Please enter a valid phone number";
      }
    }

    // Website validation (optional field)
    if (name === "website" && value.trim()) {
      try {
        new URL(value.startsWith("http") ? value : `https://${value}`);
      } catch {
        error = "Please enter a valid website URL";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Define required fields
    const requiredFields = ["address", "city", "country", "phoneNumber"];

    requiredFields.forEach((field) => {
      const value = (formData as FormData)[field] || "";
      if (!value.toString().trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        isValid = false;
      }
    });

    // Validate phone number format
    if ((formData as FormData).phoneNumber) {
      const phonePattern =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phonePattern.test((formData as FormData).phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
        isValid = false;
      }
    }

    // Validate website if provided
    if ((formData as FormData).website) {
      try {
        new URL(
          (formData as FormData).website!.startsWith("http")
            ? (formData as FormData).website!
            : `https://${(formData as FormData).website!}`
        );
      } catch {
        newErrors.website = "Please enter a valid website URL";
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
    const touchedFields = {
      address: true,
      city: true,
      state: true,
      zipCode: true,
      country: true,
      phoneNumber: true,
      website: true,
    };

    setTouched((prev) => ({ ...prev, ...touchedFields }));

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Address Information */}
        <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-base font-medium text-blue-200">
              Address Information
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <FormInput
                id="address"
                name="address"
                value={(formData as FormData).address || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Address"
                icon={<MapPin className="h-4 w-4" />}
                error={hasError("address")}
                showLabelAnimation
                showSuccessIndicator
                isSuccess={!!(touched.address && !errors.address)}
                aria-label="Address"
              />
              {renderError("address")}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  id="city"
                  name="city"
                  value={(formData as FormData).city || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="City"
                  icon={<MapPin className="h-4 w-4" />}
                  error={hasError("city")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={!!(touched.city && !errors.city)}
                  aria-label="City"
                />
                {renderError("city")}
              </div>

              <div>
                <FormSelect
                  id="country"
                  name="country"
                  value={(formData as FormData).country || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Country"
                  icon={<MapPin className="h-4 w-4" />}
                  error={hasError("country")}
                  showLabelAnimation
                  options={countries}
                  aria-label="Country"
                />
                {renderError("country")}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  id="state"
                  name="state"
                  value={(formData as FormData).state || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="State/Province (optional)"
                  icon={<MapPin className="h-4 w-4" />}
                  error={hasError("state")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={
                    !!(
                      touched.state &&
                      !errors.state &&
                      (formData as FormData).state
                    )
                  }
                  aria-label="State/Province"
                />
                {renderError("state")}
              </div>

              <div>
                <FormInput
                  id="zipCode"
                  name="zipCode"
                  value={(formData as FormData).zipCode || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Zip/Postal Code (optional)"
                  icon={<MapPin className="h-4 w-4" />}
                  error={hasError("zipCode")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={
                    !!(
                      touched.zipCode &&
                      !errors.zipCode &&
                      (formData as FormData).zipCode
                    )
                  }
                  aria-label="Zip/Postal Code"
                />
                {renderError("zipCode")}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
              <Phone className="h-5 w-5" />
            </div>
            <h3 className="text-base font-medium text-blue-200">
              Contact Details
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <FormInput
                id="phoneNumber"
                name="phoneNumber"
                value={(formData as FormData).phoneNumber || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Phone Number"
                icon={<Phone className="h-4 w-4" />}
                error={hasError("phoneNumber")}
                showLabelAnimation
                showSuccessIndicator
                isSuccess={!!(touched.phoneNumber && !errors.phoneNumber)}
                aria-label="Phone Number"
              />
              {renderError("phoneNumber")}
            </div>

            {!isPersonal && (
              <div>
                <FormInput
                  id="website"
                  name="website"
                  value={(formData as FormData).website || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Website (optional)"
                  icon={<Globe className="h-4 w-4" />}
                  error={hasError("website")}
                  showLabelAnimation
                  showSuccessIndicator
                  isSuccess={
                    !!(
                      touched.website &&
                      !errors.website &&
                      (formData as FormData).website
                    )
                  }
                  aria-label="Website"
                />
                {renderError("website")}
              </div>
            )}
          </div>
        </div>

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
            Please provide your contact information for account verification and
            communication.
          </p>
        </div>

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
            <circle
              cx="60"
              cy="10"
              r="3"
              fill="currentColor"
              fillOpacity="0.8"
            />
            <circle
              cx="20"
              cy="10"
              r="2"
              fill="currentColor"
              fillOpacity="0.6"
            />
            <circle
              cx="100"
              cy="10"
              r="2"
              fill="currentColor"
              fillOpacity="0.6"
            />
          </svg>
        </div>
      </div>
    </form>
  );
};

export default AddressStep;
