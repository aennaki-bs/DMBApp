import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Check, X, Shield } from "lucide-react";
import { FormInput } from "./FormInput";

// Password component with strength meter
const PasswordForm: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();

  // Form state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password requirements
  const passwordRequirements = [
    {
      id: "length",
      label: "At least 8 characters long",
      test: (pass: string) => pass.length >= 8,
    },
    {
      id: "lowercase",
      label: "Contains lowercase letter",
      test: (pass: string) => /[a-z]/.test(pass),
    },
    {
      id: "uppercase",
      label: "Contains uppercase letter",
      test: (pass: string) => /[A-Z]/.test(pass),
    },
    {
      id: "number",
      label: "Contains a number",
      test: (pass: string) => /\d/.test(pass),
    },
    {
      id: "special",
      label: "Contains a special character",
      test: (pass: string) => /[!@#$%^&*(),.?":{}|<>]/.test(pass),
    },
  ];

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let score = 0;
    passwordRequirements.forEach((req) => {
      if (req.test(password)) {
        score += 20; // 5 requirements, each worth 20%
      }
    });

    return score;
  };

  // Get strength color
  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-amber-500";
    return "bg-green-500";
  };

  // Get strength text
  const getStrengthText = (
    strength: number
  ): { text: string; color: string } => {
    if (strength < 40) return { text: "Weak", color: "text-red-400" };
    if (strength < 80) return { text: "Good", color: "text-amber-400" };
    return { text: "Strong", color: "text-green-400" };
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // Update password strength when password changes
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Check passwords match when confirm password changes
    if (name === "confirmPassword" && value && formData.password) {
      if (value !== formData.password) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords don't match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    // Check passwords match when password changes if confirm password is not empty
    if (name === "password" && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords don't match",
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  // Handle field blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, e.target.value);
  };

  // Validate a single field
  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "password") {
      if (!value) {
        error = "Password is required";
      } else if (value.length < 8) {
        error = "Password must be at least 8 characters";
      } else if (calculatePasswordStrength(value) < 60) {
        error = "Password is too weak";
      }
    } else if (name === "confirmPassword") {
      if (!value) {
        error = "Please confirm your password";
      } else if (value !== formData.password) {
        error = "Passwords don't match";
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else if (calculatePasswordStrength(formData.password) < 60) {
      newErrors.password = "Password is too weak";
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      password: true,
      confirmPassword: true,
    });

    // Validate all fields
    if (validateForm()) {
      nextStep();
    }
  };

  // Check if requirement passes
  const requirementPasses = (requirement: {
    id: string;
    test: (pass: string) => boolean;
  }) => {
    return formData.password && requirement.test(formData.password);
  };

  const strengthInfo = getStrengthText(passwordStrength);

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
        {/* Password Section */}
        <div className="rounded-lg border border-blue-800/30 bg-blue-900/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-800/20 text-blue-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-medium text-blue-200">
              Create Secure Password
            </h3>
          </div>

          <div className="space-y-5">
            {/* Password Field */}
            <div className="relative">
              <FormInput
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Password"
                icon={<Lock className="h-4 w-4" />}
                error={hasError("password")}
                showLabelAnimation
                showSuccessIndicator={false}
                isSuccess={
                  !!(
                    touched.password &&
                    !errors.password &&
                    passwordStrength >= 60
                  )
                }
                autoComplete="new-password"
                aria-label="Password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 z-10"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {renderError("password")}
            </div>

            {/* Password strength meter */}
            {formData.password && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-300">
                    Password Strength
                  </span>
                  <span className={`text-xs font-medium ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
                <Progress
                  value={passwordStrength}
                  max={100}
                  className="h-1.5 bg-blue-950/50"
                >
                  <div
                    className={`h-full ${getStrengthColor(
                      passwordStrength
                    )} transition-all duration-300`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </Progress>
              </div>
            )}

            {/* Confirm Password Field */}
            <div className="relative">
              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm Password"
                icon={<Lock className="h-4 w-4" />}
                error={hasError("confirmPassword")}
                showLabelAnimation
                showSuccessIndicator={false}
                isSuccess={
                  !!(
                    touched.confirmPassword &&
                    !errors.confirmPassword &&
                    formData.confirmPassword === formData.password &&
                    formData.confirmPassword
                  )
                }
                autoComplete="new-password"
                aria-label="Confirm Password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 z-10"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {renderError("confirmPassword")}
            </div>
          </div>

          {/* Password Requirements */}
          <div className="mt-6 bg-blue-900/20 p-4 rounded-md border border-blue-800/30">
            <h4 className="text-xs font-medium text-blue-300 mb-3">
              Password Requirements
            </h4>
            <div className="space-y-2">
              {passwordRequirements.map((requirement) => (
                <div
                  key={requirement.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      requirementPasses(requirement)
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-800/30 text-blue-400/70"
                    }`}
                  >
                    {requirementPasses(requirement) ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    )}
                  </div>
                  <span
                    className={
                      requirementPasses(requirement)
                        ? "text-blue-200"
                        : "text-blue-400/70"
                    }
                  >
                    {requirement.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Message */}
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
            Create a strong, unique password to protect your account.
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

export default PasswordForm;
