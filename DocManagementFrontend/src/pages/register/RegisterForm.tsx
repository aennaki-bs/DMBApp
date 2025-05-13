import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import StepOneUserInfo from "@/components/register/StepOneUserInfo";
import StepTwoEmailPassword from "@/components/register/StepTwoEmailPassword";
import StepThreePersonalAddress from "@/components/register/StepThreePersonalAddress";
import StepFourAdminKey from "@/components/register/StepFourAdminKey";
import StepFiveSummary from "@/components/register/StepFiveSummary";
import StepTwoCompanyAddress from "@/components/register/StepTwoCompanyAddress";
import StepThreeCompanyCredentials from "@/components/register/StepThreeCompanyCredentials";
import { useMultiStepForm } from "@/context/form";
import StepIndicator from "./StepIndicator";
import StepTitle from "./StepTitle";
import RightSideContent from "./RightSideContent";
import { FormError } from "@/components/ui/form-error";
import UserTypeSelectionStep from "@/components/register/UserTypeSelectionStep";

// For personal users: 0. type selection, 1. info, 2. address, 3. credentials, 4. admin key, 5. summary
// For company users:  0. type selection, 1. info, 2. address, 3. credentials, 4. admin key, 5. summary

const RegisterForm: React.FC = () => {
  const { currentStep, formData, stepValidation } = useMultiStepForm();
  const isPersonal = formData.userType === "personal";

  // Only show one error message based on priority:
  // 1. Server-side registration error
  // 2. Form validation error
  // 3. Username/email availability errors (only on step 3 for personal, step 2 for company)
  const errorMessage =
    stepValidation.errors.registration ||
    formData.validationError ||
    ((isPersonal && currentStep === 4) || (!isPersonal && currentStep === 3)
      ? stepValidation.errors.username || stepValidation.errors.email
      : undefined);

  // For step indicators and titles, always show 6 steps for both flows (including type selection)
  const stepCount = 6;
  const indicatorStep = currentStep > stepCount ? stepCount : currentStep;

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
          return <StepTwoEmailPassword />;
        case 4:
          return <StepFourAdminKey />;
        case 5:
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
        return <StepThreeCompanyCredentials />;
      case 4:
        return <StepFourAdminKey />;
      case 5:
        return <StepFiveSummary />;
      default:
        return <UserTypeSelectionStep />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Registration form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 md:p-8 bg-[#0d1117] overflow-y-auto">
        <div className="w-full max-w-2xl py-8">
          <Card className="border-gray-800 bg-gradient-to-b from-[#161b22] to-[#0d1117] shadow-2xl">
            <CardHeader className="space-y-1 pb-2 px-8 pt-6 border-b border-gray-800">
              {currentStep > 0 && (
                <>
                  <StepIndicator
                    currentStep={indicatorStep}
                    stepCount={stepCount}
                  />
                  <StepTitle
                    currentStep={indicatorStep}
                    stepCount={stepCount}
                  />
                </>
              )}
            </CardHeader>

            <CardContent className="pt-8 px-8 max-h-[calc(100vh-220px)] overflow-y-auto">
              {/* Display error message at the top of the form - only if there's an error */}
              {errorMessage && <FormError message={errorMessage} />}

              {renderStep()}
            </CardContent>
          </Card>
        </div>

        {/* Sign in link moved outside the card */}
        <div className="mt-4 text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Right side - Image and text */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-[#0d1117] to-[#161b22] relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232d3748' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E')",
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-16 overflow-y-auto">
          <div className="text-center max-w-xl">
            <RightSideContent currentStep={indicatorStep} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
