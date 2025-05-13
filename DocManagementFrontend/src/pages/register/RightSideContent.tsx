import React from "react";
import {
  User,
  Building2,
  Lock,
  Shield,
  ExternalLink,
  Phone,
  MapPin,
  AtSign,
  CreditCard,
  Globe,
} from "lucide-react";
import { useMultiStepForm } from "@/context/form";

interface RightSideContentProps {
  currentStep: number;
}

const RightSideContent: React.FC<RightSideContentProps> = ({ currentStep }) => {
  const { formData } = useMultiStepForm();
  const isPersonal = formData.userType === "personal";

  // Different content for each step
  if (currentStep === 0) {
    return (
      <>
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to Our Platform
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Choose the account type that best fits your needs
        </p>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 bg-[#1c2128]/50 p-4 rounded-lg border border-blue-900/30">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Personal Account</h3>
              <p className="text-sm text-gray-400">
                For individual users managing personal documents
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-[#1c2128]/50 p-4 rounded-lg border border-blue-900/30">
            <div className="bg-green-500/20 p-3 rounded-full">
              <Building2 className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Company Account</h3>
              <p className="text-sm text-gray-400">
                For businesses managing company documents
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-[#1c2128]/50 p-4 rounded-lg border border-blue-900/30">
            <div className="bg-purple-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Secure & Personalized</h3>
              <p className="text-sm text-gray-400">
                Your experience will be tailored to your account type
              </p>
            </div>
          </div>
        </div>
      </>
    );
  } else if (currentStep === 1) {
    return (
      <>
        <h1 className="text-4xl font-bold text-white mb-4">
          Create Your Account <br></br>and Join Our Business Platform
        </h1>
        <p className="text-lg text-gray-300 mb-10">
          Create your account to access all features and start managing your
          business
        </p>

        <div className="space-y-6">
          <div className="flex items-center space-x-4 bg-[#1c2128]/50 p-4 rounded-lg border border-blue-900/30">
            <div className="bg-green-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Select Account Type</h3>
              <p className="text-sm text-gray-400">
                Choose between personal or company account
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-[#1c2128]/50 p-4 rounded-lg border border-blue-900/30">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Provide Your Details</h3>
              <p className="text-sm text-gray-400">
                Enter contact and identification information
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-[#1c2128]/50 p-4 rounded-lg border border-blue-900/30">
            <div className="bg-purple-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Complete Profile</h3>
              <p className="text-sm text-gray-400">
                Fill in all necessary information to get started
              </p>
            </div>
          </div>
        </div>
      </>
    );
  } else if (currentStep === 2) {
    if (isPersonal) {
      return (
        <>
          <h1 className="text-4xl font-bold text-white mb-4">
            Complete Your Profile
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Add your address details to complete your profile
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-green-500/20 p-2 rounded-full">
                <MapPin className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Address Information</h3>
                <p className="text-sm text-gray-400">
                  Add your personal address details (optional)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Location Details</h3>
                <p className="text-sm text-gray-400">
                  Let us know your city and country
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-purple-500/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Enhanced Experience</h3>
                <p className="text-sm text-gray-400">
                  Help us personalize your experience
                </p>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h1 className="text-4xl font-bold text-white mb-4">
            Company Address Details
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Add your company address information (optional)
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-green-500/20 p-2 rounded-full">
                <MapPin className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Company Address</h3>
                <p className="text-sm text-gray-400">
                  Add your company's main address
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <Globe className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Location Details</h3>
                <p className="text-sm text-gray-400">
                  City and country information
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-purple-500/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Optional Information</h3>
                <p className="text-sm text-gray-400">
                  You can add this information later if needed
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }
  } else if (currentStep === 3) {
    if (isPersonal) {
      return (
        <>
          <h1 className="text-4xl font-bold text-white mb-4">
            Set Up Your Account Credentials
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Create unique credentials that will be used to access your account
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-green-500/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Unique Username</h3>
                <p className="text-sm text-gray-400">
                  Choose a unique username that identifies you on the platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Verified Email</h3>
                <p className="text-sm text-gray-400">
                  Enter a valid email address for account verification
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-purple-500/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Secure Password</h3>
                <p className="text-sm text-gray-400">
                  Create a strong password to protect your account
                </p>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          <h1 className="text-4xl font-bold text-white mb-4">
            Set Up Company Account Credentials
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Create login credentials for your company account
          </p>

          <div className="space-y-6">
            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-green-500/20 p-2 rounded-full">
                <AtSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Company Email</h3>
                <p className="text-sm text-gray-400">
                  Use your company email for account verification
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Company Username</h3>
                <p className="text-sm text-gray-400">
                  Choose a unique username for your company account
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
              <div className="bg-purple-500/20 p-2 rounded-full">
                <Lock className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-medium">Secure Password</h3>
                <p className="text-sm text-gray-400">
                  Create a strong password to protect your company account
                </p>
              </div>
            </div>
          </div>
        </>
      );
    }
  } else if (currentStep === 4) {
    return (
      <>
        <h1 className="text-4xl font-bold text-white mb-4">
          Admin Access (Optional)
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Provide admin key if you have administrative privileges
        </p>

        <div className="space-y-6">
          <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
            <div className="bg-green-500/20 p-2 rounded-full">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Admin Privileges</h3>
              <p className="text-sm text-gray-400">
                Enable additional administrative capabilities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
            <div className="bg-blue-500/20 p-2 rounded-full">
              <Lock className="h-6 w-6 text-blue-400" />
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Secure Access</h3>
              <p className="text-sm text-gray-400">
                Admin key is securely stored and validated
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
            <div className="bg-purple-500/20 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Optional Step</h3>
              <p className="text-sm text-gray-400">
                Skip this step if you don't need admin access
              </p>
            </div>
          </div>
        </div>
      </>
    );
  } else if (currentStep === 5) {
    return (
      <>
        <h1 className="text-4xl font-bold text-white mb-4">
          Review Your Information
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Please verify all details before completing registration
        </p>

        <div className="space-y-6">
          <div className="flex items-center space-x-3 bg-[#1c2128]/70 p-4 rounded-lg border border-blue-900/40 backdrop-blur-sm">
            <div className="bg-green-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Verify Account Details</h3>
              <p className="text-sm text-gray-400">
                Confirm your personal information and contact details
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#1c2128]/70 p-4 rounded-lg border border-blue-900/40 backdrop-blur-sm">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">
                Secure Access Information
              </h3>
              <p className="text-sm text-gray-400">
                Check your username, email, and password
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#1c2128]/70 p-4 rounded-lg border border-blue-900/40 backdrop-blur-sm">
            <div className="bg-purple-500/20 p-3 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-medium">Complete Registration</h3>
              <p className="text-sm text-gray-400">
                Submit your registration when all information is verified
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null; // Default return if currentStep is not recognized
};

export default RightSideContent;
