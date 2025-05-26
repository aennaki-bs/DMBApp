import React, { useState, useEffect } from "react";
import { useMultiStepForm } from "@/context/form";
import { AtSign, User, Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { FormInput } from "./FormInput";

const UsernameEmailForm: React.FC = () => {
  const { formData, setFormData, nextStep, validateUsername, validateEmail } =
    useMultiStepForm();
  const { stepValidation } = useMultiStepForm();

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isChecking, setIsChecking] = useState({
    username: false,
    email: false,
  });

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle field blur
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const isValid = validateField(name, value);

    // If the field is valid, check with the API
    if (isValid && value) {
      if (name === "username" && value.length >= 3) {
        setIsChecking((prev) => ({ ...prev, username: true }));
        // API call to validate username
        await validateUsername();
        setIsChecking((prev) => ({ ...prev, username: false }));
      } else if (name === "email" && value.includes("@")) {
        setIsChecking((prev) => ({ ...prev, email: true }));
        // API call to validate email
        await validateEmail();
        setIsChecking((prev) => ({ ...prev, email: false }));
      }
    }
  };

  // Update local errors from context when API validation completes
  useEffect(() => {
    if (stepValidation.errors.username) {
      setErrors((prev) => ({
        ...prev,
        username: stepValidation.errors.username,
      }));
    }
    if (stepValidation.errors.email) {
      setErrors((prev) => ({ ...prev, email: stepValidation.errors.email }));
    }
  }, [stepValidation.errors.username, stepValidation.errors.email]);

  // Validate a single field
  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else if (name === "username" && value.length < 3) {
      error = "Username must be at least 3 characters";
    } else if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Please enter a valid email address";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = async () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate username
    if (!formData.username?.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    // Validate email
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    setErrors(newErrors);

    // If client validation passes, perform API validation
    if (isValid) {
      setIsChecking({ username: true, email: true });

      // Check both username and email availability
      const [usernameValid, emailValid] = await Promise.all([
        validateUsername(),
        validateEmail(),
      ]);

      setIsChecking({ username: false, email: false });

      // If either validation fails, update errors from the context
      if (!usernameValid || !emailValid) {
        if (stepValidation.errors.username) {
          newErrors.username = stepValidation.errors.username;
        }
        if (stepValidation.errors.email) {
          newErrors.email = stepValidation.errors.email;
        }
        setErrors(newErrors);
        return false;
      }

      return usernameValid && emailValid;
    }

    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      username: true,
      email: true,
    });

    // Validate all fields
    const isValid = await validateForm();
    if (isValid) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-base font-medium text-blue-200">
            Account Information
          </h3>
        </div>

        <div className="space-y-5">
          <div>
            <FormInput
              id="username"
              name="username"
              value={formData.username || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Username"
              icon={<User className="h-4 w-4" />}
              error={hasError("username")}
              showLabelAnimation
              showSuccessIndicator
              isSuccess={!!(touched.username && !errors.username)}
              isLoading={isChecking.username}
              autoComplete="username"
              aria-label="Username"
            />
            {renderError("username")}
          </div>

          <div>
            <FormInput
              id="email"
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Email Address"
              icon={<AtSign className="h-4 w-4" />}
              error={hasError("email")}
              showLabelAnimation
              showSuccessIndicator
              isSuccess={!!(touched.email && !errors.email)}
              isLoading={isChecking.email}
              autoComplete="email"
              aria-label="Email Address"
            />
            {renderError("email")}
          </div>
        </div>
      </div>

      {/* Info message */}
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
          Your username will be used to log in, and your email will be used for
          account verification.
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

export default UsernameEmailForm;
