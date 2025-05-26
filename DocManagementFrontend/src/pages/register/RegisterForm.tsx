import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMultiStepForm } from "@/context/form";
import { FormError } from "@/components/ui/form-error";
import {
  User,
  Building2,
  MapPin,
  Mail,
  Lock,
  Shield,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  Check,
  CircleCheck,
  PenLine,
  UserPlus,
  Database,
  BarChart3,
  Layers,
  Fingerprint,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Step Components
import UserTypeSelection from "@/components/register/StepOneTypeSelector";
import PersonalInfoForm from "@/components/register/StepTwoPersonalInfo";
import AddressStep from "@/components/register/StepThreeAddressInfo";
import UsernameEmailForm from "@/components/register/StepFourCredentials";
import PasswordForm from "@/components/register/StepFivePassword";
import AdminAccessForm from "@/components/register/StepSixAdminAccess";
import ReviewStep from "@/components/register/StepSevenSummary";

// Define our StepInfo interface
export interface StepInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Animation variants for step transitions
const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

// Background icons for aesthetic purposes
const BackgroundIcon = ({
  icon,
  className,
}: {
  icon: React.ReactNode;
  className: string;
}) => (
  <div className={`absolute opacity-5 text-blue-300 ${className}`}>{icon}</div>
);

const RegisterForm: React.FC = () => {
  const {
    currentStep,
    formData,
    stepValidation,
    nextStep,
    prevStep,
    validateCurrentStep,
  } = useMultiStepForm();
  const [direction, setDirection] = useState(0);
  const [attemptedNext, setAttemptedNext] = useState(false);
  const isPersonal = formData.userType === "personal";

  // Error handling
  const errorMessage =
    stepValidation.errors.registration ||
    formData.validationError ||
    (currentStep === 3
      ? stepValidation.errors.username || stepValidation.errors.email
      : undefined);

  // Step information
  const steps: StepInfo[] = [
    {
      id: 0,
      title: "Account Type",
      description: "Choose between personal or company account",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 1,
      title: "Account Details",
      description: isPersonal
        ? "Enter your personal information"
        : "Enter your company information",
      icon: <PenLine className="h-5 w-5" />,
    },
    {
      id: 2,
      title: "Address",
      description: "Enter your contact information",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 3,
      title: "Username & Email",
      description: "Create your account identifiers",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: 4,
      title: "Password",
      description: "Create a secure password",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      id: 5,
      title: "Admin Access",
      description: "Optional admin privileges",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: 6,
      title: "Review",
      description: "Review and confirm your information",
      icon: <CircleCheck className="h-5 w-5" />,
    },
  ];

  // Handle next button click
  const handleNext = async () => {
    setAttemptedNext(true);

    // Validate current step before proceeding
    const isValid = await validateCurrentStep();

    if (isValid) {
      setDirection(1);
      nextStep();
      setAttemptedNext(false);
    } else {
      // Show error state but don't proceed
      console.log("Validation failed. Please check the form.");
    }
  };

  // Handle prev button click
  const handlePrev = () => {
    setDirection(-1);
    prevStep();
    setAttemptedNext(false);
  };

  // Determine if the next button should be disabled
  const isNextDisabled = () => {
    // Always allow moving to the next step from the account type selection
    if (currentStep === 0) return false;

    // For the review step, don't show the next button
    if (currentStep === 6) return true;

    // For steps where validation results are available
    return (
      attemptedNext &&
      stepValidation.errors &&
      Object.keys(stepValidation.errors).length > 0
    );
  };

  // Render current step content
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <UserTypeSelection />;
      case 1:
        return <PersonalInfoForm />;
      case 2:
        return <AddressStep />;
      case 3:
        return <UsernameEmailForm />;
      case 4:
        return <PasswordForm />;
      case 5:
        return <AdminAccessForm />;
      case 6:
        return <ReviewStep />;
      default:
        return <UserTypeSelection />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0a1033] to-[#040714] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* ERP-themed background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_rgba(29,78,216,0.15),transparent_80%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_rgba(30,64,175,0.15),transparent_80%)]"></div>

        {/* Decorative icons */}
        <BackgroundIcon
          icon={<Database size={120} />}
          className="top-[10%] left-[5%] transform rotate-12"
        />
        <BackgroundIcon
          icon={<BarChart3 size={150} />}
          className="top-[30%] right-[8%] transform -rotate-15"
        />
        <BackgroundIcon
          icon={<Layers size={100} />}
          className="bottom-[20%] left-[15%]"
        />
        <BackgroundIcon
          icon={<Fingerprint size={180} />}
          className="bottom-[10%] right-[10%] transform rotate-45"
        />
        <BackgroundIcon
          icon={<FileText size={130} />}
          className="top-[50%] left-[50%] transform -rotate-6"
        />

        {/* Digital circuit pattern */}
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-[0.03] z-0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
        >
          <path
            d="M0 50 H100 M50 0 V100 M25 0 V100 M75 0 V100 M0 25 H100 M0 75 H100"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
          />
          <circle cx="50" cy="50" r="3" fill="currentColor" />
          <circle cx="25" cy="25" r="2" fill="currentColor" />
          <circle cx="75" cy="75" r="2" fill="currentColor" />
          <circle cx="25" cy="75" r="2" fill="currentColor" />
          <circle cx="75" cy="25" r="2" fill="currentColor" />
        </svg>

        {/* Blue glow effects */}
        <div className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full bg-blue-600/10 blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-80 h-80 rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 z-10 relative">
        {/* Left side - Step guide */}
        <div className="md:w-1/3 md:flex-shrink-0">
          <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.2)] p-6 md:sticky md:top-8 text-white">
            <h2 className="text-2xl font-bold text-blue-100 mb-6 flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-600/20 text-blue-400">
                <UserPlus className="h-5 w-5" />
              </div>
              Registration Steps
            </h2>

            {/* ERP banner */}
            <div className="mb-6 p-3 bg-gradient-to-r from-blue-900/50 to-blue-900/20 rounded-lg border border-blue-800/30 relative overflow-hidden">
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-10">
                <svg
                  className="w-16 h-16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 8V16C22 17.1046 21.1046 18 20 18H4C2.89543 18 2 17.1046 2 16V8M22 8C22 6.89543 21.1046 6 20 6H4C2.89543 6 2 6.89543 2 8M22 8H2M6 12H8M16 12H18M11 12H13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-blue-300">
                Enterprise Resource Platform
              </h3>
              <p className="text-xs text-blue-400 mt-1">
                Document Management System
              </p>
            </div>

            {/* Steps navigation */}
            <div className="space-y-4 mb-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    currentStep === step.id
                      ? "bg-blue-800/20 border-l-4 border-blue-500"
                      : step.id < currentStep
                      ? "text-blue-300"
                      : "text-blue-400/70"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      currentStep === step.id
                        ? "bg-blue-600 text-white pulse-animation"
                        : step.id < currentStep
                        ? "bg-green-600/30 text-green-300"
                        : "bg-blue-900/30 text-blue-400/70"
                    }`}
                  >
                    {step.id < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-medium ${
                        currentStep === step.id ? "text-blue-100" : ""
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs text-blue-300/80">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ERP Footer */}
            <div className="mt-6 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2,
                }}
                className="flex gap-2 text-blue-500/60 text-xs font-medium"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.6 7H25.2V16.8H21.6V7ZM19.2 10.8H15.6V16.8H19.2V10.8ZM13.2 7H9.6V16.8H13.2V7ZM7.2 3.2H3.6V16.8H7.2V3.2Z"
                    fill="currentColor"
                    fillOpacity="0.7"
                  />
                </svg>
                <span>Enterprise Resource Platform</span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right side - Form content */}
        <div className="md:w-2/3 flex flex-col space-y-6">
          <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-blue-900/30 relative overflow-hidden">
              {/* Background header pattern */}
              <div className="absolute inset-0 opacity-5">
                <svg
                  width="100%"
                  height="100%"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <pattern
                    id="circuitPattern"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M0 20h40M20 0v40M10 0v10M30 0v10M10 30v10M30 30v10M0 10h10M30 10h10M0 30h10M30 30h10"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      fill="none"
                    />
                  </pattern>
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="url(#circuitPattern)"
                  />
                </svg>
              </div>

              <h1 className="text-xl text-blue-100 flex items-center gap-3 mb-1 relative z-10">
                <div className="p-2 rounded-full bg-blue-600/20 text-blue-400">
                  {steps[currentStep].icon}
                </div>
                {steps[currentStep].title}
                <span className="ml-auto px-2 py-0.5 text-xs bg-blue-900/50 text-blue-300 rounded-full border border-blue-800/30">
                  Step {currentStep + 1} of 7
                </span>
              </h1>
              <p className="text-blue-300 relative z-10">
                {steps[currentStep].description}
              </p>

              {/* Error message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-900/30 border border-red-800/30 rounded-md text-red-300 text-sm relative z-10"
                >
                  {errorMessage}
                </motion.div>
              )}
            </div>

            {/* Step indicators for smaller screens */}
            <div className="px-6 pt-6 pb-0 md:hidden">
              <div className="flex justify-between items-center">
                {steps.map((step) => (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                        currentStep === step.id
                          ? "bg-blue-600 border-blue-400 text-white scale-110 pulse-animation"
                          : currentStep > step.id
                          ? "bg-green-600/30 border-green-400/50 text-green-300"
                          : "bg-blue-900/30 border-blue-900/50 text-blue-300/50"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{step.id + 1}</span>
                      )}

                      {/* Connecting line */}
                      {step.id < steps.length - 1 && (
                        <div
                          className={`absolute top-1/2 left-full w-[calc(100%-8px)] h-[2px] -translate-y-1/2 transition-all duration-300 ${
                            currentStep > step.id
                              ? "bg-green-500/50"
                              : "bg-blue-900/50"
                          }`}
                        ></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form content with animation */}
            <div className="p-6 min-h-[400px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="px-6 pb-6 pt-2 border-t border-blue-900/30 flex justify-between items-center bg-gradient-to-r from-blue-900/10 to-transparent">
              <Button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className={`border border-blue-900/50 transition-all duration-200 flex items-center gap-2 ${
                  currentStep === 0
                    ? "opacity-50 bg-blue-950/30 text-blue-300/50"
                    : "bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="hidden sm:flex items-center gap-1 px-3">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      currentStep === step.id
                        ? "bg-blue-500 w-6"
                        : currentStep > step.id
                        ? "bg-green-500"
                        : "bg-blue-900"
                    }`}
                  ></div>
                ))}
              </div>

              {currentStep < 6 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isNextDisabled()}
                  className={`bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] ${
                    isNextDisabled() ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Help Card - Moved below main content with proper spacing */}
          <div className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.2)] p-5 text-white max-w-md mx-auto w-full">
            <h3 className="text-lg font-medium text-blue-200 mb-1">
              Need Help?
            </h3>
            <p className="text-sm text-blue-300 mb-3">
              Already have an account? Sign in to access your documents.
            </p>
            <Link
              to="/login"
              className="flex items-center justify-center w-full bg-blue-600/60 hover:bg-blue-600/80 text-white py-2.5 rounded-md transition-all duration-200 font-medium hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]"
            >
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
