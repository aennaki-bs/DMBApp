import React from "react";
import { useMultiStepForm } from "@/context/form";
import { Input } from "@/components/ui/input";
import { MapPin, Globe, Hash, Mail, Home, Building } from "lucide-react";
import StepContainer from "./utils/StepContainer";

// Extend the FormData type in the context to support the postalCode field
declare module "@/context/form" {
  interface FormData {
    postalCode?: string;
  }
}

const StepThreePersonalAddress: React.FC = () => {
  const { formData, setFormData, nextStep, prevStep } = useMultiStepForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  // No validation - fields are all optional
  const handleNext = () => {
    nextStep();
  };

  return (
    <StepContainer onNext={handleNext} onBack={prevStep}>
      {/* Street Address field */}
      <div>
        <label
          className="block text-white text-sm font-medium mb-1.5"
          htmlFor="personalAddress"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-400" />
            <span>Street Address</span>
          </div>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
            <Home className="h-4 w-4" />
          </div>
          <Input
            id="personalAddress"
            name="personalAddress"
            value={formData.personalAddress || ""}
            onChange={handleChange}
            placeholder="Enter your address (optional)"
            className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
          />
        </div>
      </div>

      {/* City and Country fields in a grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* City field */}
        <div>
          <label
            className="block text-white text-sm font-medium mb-1.5"
            htmlFor="city"
          >
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-amber-400" />
              <span>City</span>
            </div>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Hash className="h-4 w-4" />
            </div>
            <Input
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              placeholder="Your city (optional)"
              className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Country field */}
        <div>
          <label
            className="block text-white text-sm font-medium mb-1.5"
            htmlFor="country"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-amber-400" />
              <span>Country</span>
            </div>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Globe className="h-4 w-4" />
            </div>
            <Input
              id="country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              placeholder="Your country (optional)"
              className="bg-[#0a1223]/70 backdrop-blur-sm border-gray-800/30 h-10 sm:h-11 text-white rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20 w-full group-hover:border-blue-500/50 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </StepContainer>
  );
};

export default StepThreePersonalAddress;
