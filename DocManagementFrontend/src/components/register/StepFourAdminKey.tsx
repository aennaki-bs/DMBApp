import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { Shield, Key, ChevronRight, ChevronLeft } from "lucide-react";
import { FormError } from "@/components/ui/form-error";

const StepFourAdminKey = () => {
  const { formData, setFormData, prevStep, nextStep, stepValidation } =
    useMultiStepForm();
  const [showAdminField, setShowAdminField] = useState<boolean>(
    !!formData.adminSecretKey
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAdminField(e.target.checked);
    if (!e.target.checked) {
      setFormData({ adminSecretKey: "" });
    }
  };

  const handleNext = () => {
    // Only validate if checkbox is checked (user wants admin access)
    if (showAdminField && !formData.adminSecretKey) {
      // Display validation error for empty admin key
      setFormData({
        validationError: "Admin key is required when admin access is selected",
      });
      return;
    }

    // Clear any validation errors and proceed
    setFormData({ validationError: undefined });
    nextStep();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-gradient-to-br from-[#101b30]/80 to-[#0d1528]/80 backdrop-blur-sm rounded-xl border border-blue-900/30 shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 space-y-5">
          <div>
            <label
              className="block text-white text-sm font-medium mb-1.5"
              htmlFor="user-admin-checkbox"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Admin Access</span>
              </div>
            </label>
            <div className="flex items-center gap-3 mb-2 bg-[#0a1223]/70 backdrop-blur-sm border border-gray-800/30 rounded-lg p-3 w-full">
              <input
                type="checkbox"
                id="user-admin-checkbox"
                checked={showAdminField}
                onChange={handleCheckbox}
                className="form-checkbox h-4 w-4 accent-blue-600 rounded"
              />
              <label
                htmlFor="user-admin-checkbox"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Enable admin access
              </label>
            </div>
          </div>

          {showAdminField && (
            <div>
              <label
                className="block text-white text-sm font-medium mb-1.5"
                htmlFor="adminSecretKey"
              >
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-400" />
                  <span>Admin Key</span>
                </div>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Key className="h-4 w-4" />
                </div>
                <Input
                  id="adminSecretKey"
                  name="adminSecretKey"
                  type="password"
                  placeholder="Enter admin secret key"
                  value={formData.adminSecretKey || ""}
                  onChange={handleChange}
                  className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 sm:gap-4 pt-2 w-full">
        <button
          onClick={prevStep}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-blue-300 bg-[#0f1729]/80 backdrop-blur-sm border border-blue-900/30 hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors text-sm"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 h-10 sm:h-12 px-3 sm:px-5 rounded-lg text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-colors text-sm shadow-lg shadow-blue-500/20"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default StepFourAdminKey;
