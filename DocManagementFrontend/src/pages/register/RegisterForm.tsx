import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StepOneUserInfo from "@/components/register/StepOneUserInfo";
import StepTwoUsernameEmail from "@/components/register/StepTwoUsernameEmail";
import StepThreePassword from "@/components/register/StepThreePassword";
import StepThreePersonalAddress from "@/components/register/StepThreePersonalAddress";
import StepFourAdminKey from "@/components/register/StepFourAdminKey";
import StepFiveSummary from "@/components/register/StepFiveSummary";
import StepTwoCompanyAddress from "@/components/register/StepTwoCompanyAddress";
import StepThreeCompanyUsernameEmail from "@/components/register/StepThreeCompanyUsernameEmail";
import StepFourCompanyPassword from "@/components/register/StepFourCompanyPassword";
import { useMultiStepForm } from "@/context/form";
import { FormError } from "@/components/ui/form-error";
import UserTypeSelectionStep from "@/components/register/UserTypeSelectionStep";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  MapPin,
  Key,
  Shield,
  CheckSquare,
  Check,
  LogIn,
  Clock,
  FileText,
  Share2,
  BarChart3,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";

// Define our own StepInfo interface since we removed the StepIndicator component
export interface StepInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MotionDiv = motion.div;

// For personal users: 0. type selection, 1. info, 2. address, 3. username/email, 4. password, 5. admin key, 6. summary
// For company users:  0. type selection, 1. info, 2. address, 3. username/email, 4. password, 5. admin key, 6. summary

const RegisterForm: React.FC = () => {
  const { currentStep, formData, stepValidation } = useMultiStepForm();
  const isPersonal = formData.userType === "personal";

  // Only show one error message based on priority:
  // 1. Server-side registration error
  // 2. Form validation error
  // 3. Username/email availability errors (only on step 3 for both personal and company)
  const errorMessage =
    stepValidation.errors.registration ||
    formData.validationError ||
    (currentStep === 3
      ? stepValidation.errors.username || stepValidation.errors.email
      : undefined);

  // Create step information dynamically based on user type
  const getSteps = (): StepInfo[] => {
    const baseSteps: StepInfo[] = [
      {
        title: "Account Type",
        description: "Choose between personal or company account",
        icon: <User className="h-5 w-5" />,
      },
    ];

    // Add different steps based on user type
    if (!formData.userType || formData.userType === "personal") {
      return [
        ...baseSteps,
        {
          title: "Account Details",
          description: "Enter your personal information",
          icon: <User className="h-5 w-5" />,
        },
        {
          title: "Address",
          description: "Enter your address information",
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          title: "Username & Email",
          description: "Create your account identifiers",
          icon: <Mail className="h-5 w-5" />,
        },
        {
          title: "Password",
          description: "Create a secure password",
          icon: <Lock className="h-5 w-5" />,
        },
        {
          title: "Admin Access",
          description: "Optional admin privileges",
          icon: <Shield className="h-5 w-5" />,
        },
        {
          title: "Summary",
          description: "Review and confirm your information",
          icon: <CheckSquare className="h-5 w-5" />,
        },
      ];
    } else {
      return [
        ...baseSteps,
        {
          title: "Company Details",
          description: "Enter your company information",
          icon: <Building2 className="h-5 w-5" />,
        },
        {
          title: "Company Address",
          description: "Enter your company address",
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          title: "Username & Email",
          description: "Create your account identifiers",
          icon: <Mail className="h-5 w-5" />,
        },
        {
          title: "Password",
          description: "Create a secure password",
          icon: <Lock className="h-5 w-5" />,
        },
        {
          title: "Admin Access",
          description: "Optional admin privileges",
          icon: <Shield className="h-5 w-5" />,
        },
        {
          title: "Summary",
          description: "Review and confirm your information",
          icon: <CheckSquare className="h-5 w-5" />,
        },
      ];
    }
  };

  const steps = getSteps();
  const indicatorStep =
    currentStep > steps.length - 1 ? steps.length - 1 : currentStep;

  const renderStep = () => {
    // Step 0 is the user type selection for both flows
    if (currentStep === 0) {
      return <UserTypeSelectionStep />;
    }

    if (isPersonal) {
      switch (currentStep) {
        case 1:
          return <StepOneUserInfo />;
        case 2:
          return <StepThreePersonalAddress />;
        case 3:
          return <StepTwoUsernameEmail />;
        case 4:
          return <StepThreePassword />;
        case 5:
          return <StepFourAdminKey />;
        case 6:
          return <StepFiveSummary />;
        default:
          return <UserTypeSelectionStep />;
      }
    }
    // Company flow:
    switch (currentStep) {
      case 1:
        return <StepOneUserInfo />;
      case 2:
        return <StepTwoCompanyAddress />;
      case 3:
        return <StepThreeCompanyUsernameEmail />;
      case 4:
        return <StepFourCompanyPassword />;
      case 5:
        return <StepFourAdminKey />;
      case 6:
        return <StepFiveSummary />;
      default:
        return <UserTypeSelectionStep />;
    }
  };

  // Get the current step information for the guide
  const getCurrentStepGuide = () => {
    const currentStepInfo = steps[indicatorStep];

    if (currentStep === 0) {
      return {
        title: "Choose Your Account Type",
        description: "Select the type of account that best suits your needs.",
        icon: <User className="h-8 w-8 text-blue-400" />,
        details: [
          {
            title: "Personal Account",
            description: "For individual users managing their own documents",
            icon: <User className="h-5 w-5 text-blue-400" />,
          },
          {
            title: "Company Account",
            description:
              "For businesses with multiple users and advanced needs",
            icon: <Building2 className="h-5 w-5 text-blue-400" />,
          },
        ],
        tips: [
          "Choose Personal if you're an individual user",
          "Choose Company if you need to manage documents for an organization",
        ],
      };
    }

    if (isPersonal) {
      switch (currentStep) {
        case 1:
          return {
            title: "Personal Information",
            description:
              "Tell us about yourself to personalize your experience.",
            icon: <User className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Basic Details",
                description:
                  "Your name and personal information help us personalize your experience",
              },
            ],
            tips: [
              "Use your real name for easier identification",
              "Your information is protected by our privacy policy",
            ],
          };
        case 2:
          return {
            title: "Your Address",
            description: "Add your address information for your profile.",
            icon: <MapPin className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Location Details",
                description:
                  "Your address helps us provide location-specific services",
              },
            ],
            tips: [
              "Enter a complete address for better service",
              "This information is kept private and secure",
            ],
          };
        case 3:
          return {
            title: "Account Credentials",
            description: "Create your unique username and provide your email.",
            icon: <Mail className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Username",
                description: "Your unique identifier in the system",
              },
              {
                title: "Email Address",
                description:
                  "We'll use this for account verification and notifications",
              },
            ],
            tips: [
              "Choose a username that's easy to remember",
              "Use an email address you check regularly",
              "We'll send a verification link to this email",
            ],
          };
        case 4:
          return {
            title: "Secure Your Account",
            description: "Create a strong password to protect your account.",
            icon: <Lock className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Password Security",
                description:
                  "A strong password helps protect your account from unauthorized access",
              },
            ],
            tips: [
              "Use a combination of letters, numbers, and symbols",
              "Avoid using easily guessable information",
              "Your password should be at least 8 characters long",
            ],
          };
        case 5:
          return {
            title: "Admin Access",
            description: "Set up administrative privileges for your account.",
            icon: <Shield className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Administrator Key",
                description:
                  "Optional: Enter an admin key if you were provided one",
              },
            ],
            tips: [
              "Admin access provides additional management capabilities",
              "Leave this blank if you weren't provided an admin key",
              "Contact your system administrator if you need admin access",
            ],
          };
        case 6:
          return {
            title: "Review & Confirm",
            description:
              "Review your information before completing registration.",
            icon: <CheckSquare className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Account Summary",
                description: "Review all the information you've provided",
              },
            ],
            tips: [
              "Verify that all information is correct",
              "You can go back to previous steps to make changes",
              "Once submitted, you'll need to verify your email",
            ],
          };
        default:
          return {
            title: "Getting Started",
            description: "Create your DocuVerse account in a few simple steps.",
            icon: <User className="h-8 w-8 text-blue-400" />,
            tips: [],
          };
      }
    } else {
      // Company flow guides
      switch (currentStep) {
        case 1:
          return {
            title: "Company Information",
            description: "Tell us about your company to set up your account.",
            icon: <Building2 className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Company Details",
                description: "Basic information about your organization",
              },
            ],
            tips: [
              "Enter your official company name",
              "The company information will appear on shared documents",
              "You can add more users to your company account later",
            ],
          };
        case 2:
          return {
            title: "Company Address",
            description: "Add your company's address information.",
            icon: <MapPin className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Business Location",
                description:
                  "Your company's official address for records and communications",
              },
            ],
            tips: [
              "Enter your company's registered address",
              "This information may be used for billing and legal purposes",
              "Make sure the address is complete and accurate",
            ],
          };
        case 3:
          return {
            title: "Account Credentials",
            description:
              "Create your administrator username and provide your email.",
            icon: <Mail className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Administrator Account",
                description:
                  "You'll be the primary administrator for your company's account",
              },
            ],
            tips: [
              "Choose a professional username for your company admin account",
              "Use a company email for better security and management",
              "You'll receive important notifications at this email address",
            ],
          };
        case 4:
          return {
            title: "Secure Your Account",
            description:
              "Create a strong password to protect your company account.",
            icon: <Lock className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Password Security",
                description:
                  "A strong password helps protect your company data",
              },
            ],
            tips: [
              "Use a complex password with mixed characters",
              "Consider using a password manager for security",
              "Never share your admin password with unauthorized personnel",
            ],
          };
        case 5:
          return {
            title: "Admin Access",
            description:
              "Set up administrative privileges for your company account.",
            icon: <Shield className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Administrator Key",
                description:
                  "Optional: Enter an admin key if you were provided one",
              },
            ],
            tips: [
              "The admin key provides enhanced management capabilities",
              "This is typically provided by your IT department or system vendor",
              "Contact support if you need an admin key for your company",
            ],
          };
        case 6:
          return {
            title: "Review & Confirm",
            description:
              "Review your company information before completing registration.",
            icon: <CheckSquare className="h-8 w-8 text-blue-400" />,
            details: [
              {
                title: "Company Account Summary",
                description: "Review all the information you've provided",
              },
            ],
            tips: [
              "Verify that all company information is correct",
              "You can go back to previous steps to make changes",
              "After registration, you'll be able to add team members",
            ],
          };
        default:
          return {
            title: "Getting Started",
            description:
              "Create your company's DocuVerse account in a few simple steps.",
            icon: <Building2 className="h-8 w-8 text-blue-400" />,
            tips: [],
          };
      }
    }
  };

  const currentGuide = getCurrentStepGuide();

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1d]">
      {/* Main layout container */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left side - Step Guide panel */}
        <div className="hidden lg:flex lg:w-2/5 bg-[#0a0f1d] relative order-1 lg:order-1 border-r border-blue-900/20">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1d] to-[#0a0f1d]/80"></div>
          <div className="relative z-10 flex flex-col justify-center w-full p-10">
            <div className="max-w-md mx-auto">
              {/* Step progress indicator */}
              {currentStep > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-400">
                      Step {currentStep} of {steps.length - 1}
                    </span>
                    <span className="text-sm text-blue-400">
                      {Math.round((currentStep / (steps.length - 1)) * 100)}%
                      Complete
                    </span>
                  </div>
                  <div className="w-full bg-blue-900/30 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${(currentStep / (steps.length - 1)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Current step guide */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-900/30 rounded-xl border border-blue-500/20">
                    {currentGuide.icon}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                      {currentGuide.title}
                    </h1>
                    <p className="text-blue-300 text-sm mt-1">
                      {currentGuide.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step details */}
              {currentGuide.details && currentGuide.details.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    What you'll need:
                  </h3>
                  <div className="space-y-4">
                    {currentGuide.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 bg-blue-900/20 backdrop-blur-sm p-4 rounded-md border border-blue-500/10"
                      >
                        <div className="p-2 bg-blue-500/20 rounded-md mt-0.5">
                          {detail.icon || (
                            <FileText className="h-5 w-5 text-blue-400" />
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-medium text-white">
                            {detail.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {detail.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips section */}
              {currentGuide.tips && currentGuide.tips.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Helpful Tips:
                  </h3>
                  <div className="bg-blue-900/20 rounded-lg border border-blue-500/10 p-4">
                    <ul className="space-y-2">
                      {currentGuide.tips.map((tip, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-200">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Already have an account link */}
              <div className="mt-auto pt-4 text-center">
                <p className="text-sm text-blue-300">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center"
                  >
                    Sign in <LogIn className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form side */}
        <div className="w-full lg:w-3/5 flex flex-col bg-[#0a0f1d] order-2 lg:order-2">
          <div className="flex-1 flex flex-col p-4 sm:p-8">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-[#0d1528] to-[#0a0f1d] relative flex-1 flex flex-col">
              {/* Glass effect decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl"></div>

              {currentStep > 0 && (
                <div className="py-6 px-6 sm:px-8 relative z-10">
                  <div className="flex items-center justify-between mb-2 relative">
                    {/* Background line (gray) */}
                    <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-700/30 transform -translate-y-1/2 z-0"></div>

                    {/* Progress line (blue) */}
                    <div
                      className="absolute top-5 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 transform -translate-y-1/2 z-0 transition-all duration-300"
                      style={{
                        width: `${(currentStep / (steps.length - 1)) * 100}%`,
                      }}
                    ></div>

                    {steps.map((step, idx) => (
                      <div
                        key={idx}
                        className={`relative flex flex-col items-center z-10 ${
                          idx < currentStep
                            ? "text-blue-400"
                            : idx === currentStep
                            ? "text-blue-400"
                            : "text-gray-500"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
                            idx < currentStep
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                              : idx === currentStep
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ring-4 ring-blue-500/20 shadow-lg shadow-blue-500/30"
                              : "bg-[#1a233a] text-gray-400"
                          }`}
                        >
                          {idx < currentStep ? (
                            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <div className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                              {React.cloneElement(
                                step.icon as React.ReactElement,
                                {
                                  className: "h-4 w-4 sm:h-5 sm:w-5",
                                }
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs mt-1 font-medium hidden sm:block">
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <CardContent className="px-4 sm:px-8 py-6 flex-1 flex flex-col relative z-10">
                {/* Display error message at the top of the form - only if there's an error */}
                {errorMessage && (
                  <FormError message={errorMessage} className="mb-6" />
                )}

                {currentStep > 0 && (
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {steps[indicatorStep]?.title}
                    </h2>
                    <p className="text-sm text-blue-200/70 mt-1">
                      {steps[indicatorStep]?.description}
                    </p>
                  </div>
                )}

                {/* Scrollable content area */}
                <div className="flex-1 flex flex-col">
                  <MotionDiv
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                    className="w-full mx-auto flex-1 flex flex-col"
                  >
                    {renderStep()}
                  </MotionDiv>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
