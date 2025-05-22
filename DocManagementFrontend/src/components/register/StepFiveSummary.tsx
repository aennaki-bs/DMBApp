import React from "react";
import { useMultiStepForm } from "@/context/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormError } from "@/components/ui/form-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  Check,
  FileEdit,
  User,
  Building2,
  Lock,
  Shield,
  ExternalLink,
  Phone,
  MapPin,
  AtSign,
  CreditCard,
  Globe2,
  CheckCircle,
  LogIn,
} from "lucide-react";

const StepFiveSummary = () => {
  const { formData, prevStep, registerUser, stepValidation, setCurrentStep } =
    useMultiStepForm();

  const handleSubmit = async () => {
    const success = await registerUser();
    if (success) {
      toast({
        variant: "success",
        title: "Registration successful!",
        description: "Please check your email for verification.",
      });
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="space-y-4 w-full flex flex-col">
      <div className="bg-gradient-to-br from-[#101b30]/80 to-[#0d1528]/80 backdrop-blur-sm rounded-xl border border-blue-900/30 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-400" />
                <span>Review Your Information</span>
              </div>
            </label>
          </div>

          <ScrollArea className="h-[240px] sm:h-[280px] pr-4 w-full">
            <div className="space-y-4">
              {/* Account Type Card */}
              <Card className="border border-gray-800/30 bg-[#0a1223]/70 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b border-gray-800/20">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600/20 p-1.5 rounded-full">
                      {formData.userType === "personal" ? (
                        <User className="h-3 w-3 text-blue-400" />
                      ) : (
                        <Building2 className="h-3 w-3 text-blue-400" />
                      )}
                    </div>
                    <CardTitle className="text-xs font-medium">
                      Account Type
                    </CardTitle>
                  </div>
                  <button
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-1 rounded-full"
                    onClick={() => goToStep(0)}
                  >
                    <FileEdit className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <p className="text-xs capitalize">{formData.userType}</p>
                </CardContent>
              </Card>

              {/* Personal/Company Information Card */}
              <Card className="border border-gray-800/30 bg-[#0a1223]/70 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b border-gray-800/20">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-600/20 p-1.5 rounded-full">
                      {formData.userType === "personal" ? (
                        <User className="h-3 w-3 text-purple-400" />
                      ) : (
                        <Building2 className="h-3 w-3 text-purple-400" />
                      )}
                    </div>
                    <CardTitle className="text-xs font-medium">
                      {formData.userType === "personal"
                        ? "Personal Information"
                        : "Company Information"}
                    </CardTitle>
                  </div>
                  <button
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-1 rounded-full"
                    onClick={() => goToStep(1)}
                  >
                    <FileEdit className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  {formData.userType === "personal" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <User className="h-2.5 w-2.5" /> First Name
                        </p>
                        <p className="text-xs">
                          {formData.firstName || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <User className="h-2.5 w-2.5" /> Last Name
                        </p>
                        <p className="text-xs">
                          {formData.lastName || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <CreditCard className="h-2.5 w-2.5" /> ID
                        </p>
                        <p className="text-xs">
                          {formData.cin || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" /> Phone
                        </p>
                        <p className="text-xs">
                          {formData.personalPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 space-y-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Building2 className="h-2.5 w-2.5" /> Company Name
                        </p>
                        <p className="text-xs">
                          {formData.companyName || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <CreditCard className="h-2.5 w-2.5" /> Company RC
                        </p>
                        <p className="text-xs">
                          {formData.companyRC || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" /> Company Phone
                        </p>
                        <p className="text-xs">
                          {formData.companyPhone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Address Information Card */}
              <Card className="border border-gray-800/30 bg-[#0a1223]/70 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b border-gray-800/20">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-600/20 p-1.5 rounded-full">
                      <MapPin className="h-3 w-3 text-amber-400" />
                    </div>
                    <CardTitle className="text-xs font-medium">
                      Address Information
                    </CardTitle>
                  </div>
                  <button
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-1 rounded-full"
                    onClick={() => goToStep(2)}
                  >
                    <FileEdit className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2 space-y-0.5">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5" /> Address
                      </p>
                      <p className="text-xs">
                        {formData.personalAddress ||
                          formData.companyAddress ||
                          "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Globe2 className="h-2.5 w-2.5" /> City
                      </p>
                      <p className="text-xs">
                        {formData.city ||
                          formData.companyCity ||
                          "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Globe2 className="h-2.5 w-2.5" /> Country
                      </p>
                      <p className="text-xs">
                        {formData.country ||
                          formData.companyCountry ||
                          "Not provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Credentials Card */}
              <Card className="border border-gray-800/30 bg-[#0a1223]/70 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b border-gray-800/20">
                  <div className="flex items-center gap-2">
                    <div className="bg-green-600/20 p-1.5 rounded-full">
                      <Lock className="h-3 w-3 text-green-400" />
                    </div>
                    <CardTitle className="text-xs font-medium">
                      Account Credentials
                    </CardTitle>
                  </div>
                  <button
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-1 rounded-full"
                    onClick={() => goToStep(3)}
                  >
                    <FileEdit className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <User className="h-2.5 w-2.5" /> Username
                      </p>
                      <p className="text-xs">{formData.username}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <AtSign className="h-2.5 w-2.5" /> Email
                      </p>
                      <p className="text-xs">{formData.email}</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Lock className="h-2.5 w-2.5" /> Password
                      </p>
                      <p className="text-xs">••••••••••</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Access Card */}
              <Card className="border border-gray-800/30 bg-[#0a1223]/70 backdrop-blur-sm shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between py-2 px-3 border-b border-gray-800/20">
                  <div className="flex items-center gap-2">
                    <div className="bg-red-600/20 p-1.5 rounded-full">
                      <Shield className="h-3 w-3 text-red-400" />
                    </div>
                    <CardTitle className="text-xs font-medium">
                      Admin Access
                    </CardTitle>
                  </div>
                  <button
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 p-1 rounded-full"
                    onClick={() => goToStep(5)}
                  >
                    <FileEdit className="h-3 w-3" />
                  </button>
                </CardHeader>
                <CardContent className="py-2 px-3">
                  <p className="text-xs">
                    {formData.adminSecretKey
                      ? "Admin access enabled"
                      : "No admin access"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 w-full mt-4">
        <button
          onClick={prevStep}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-blue-300 bg-[#0f1729]/80 backdrop-blur-sm border border-blue-900/30 hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={stepValidation.isLoading}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition-colors text-sm disabled:opacity-70 shadow-lg shadow-green-500/20"
        >
          {stepValidation.isLoading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 mr-1"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Registering...</span>
            </>
          ) : (
            <>
              <span>Complete Registration</span>
              <Check className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </div>

      <div className="text-center mt-2">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          <LogIn className="h-3.5 w-3.5 mr-1.5" />
          Already have an account? Login
        </Link>
      </div>

      {stepValidation.errors.registration && (
        <p className="text-xs text-red-500 text-center mt-2">
          {stepValidation.errors.registration}
        </p>
      )}
    </div>
  );
};

export default StepFiveSummary;
