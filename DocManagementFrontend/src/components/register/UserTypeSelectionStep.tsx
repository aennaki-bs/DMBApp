import React from "react";
import { useMultiStepForm } from "@/context/form";
import { Button } from "@/components/ui/button";
import { Building2, User } from "lucide-react";
import { Label } from "@/components/ui/label";

const UserTypeSelectionStep: React.FC = () => {
  const { formData, setFormData, nextStep } = useMultiStepForm();

  const handleUserTypeChange = (value: "personal" | "company") => {
    setFormData({ userType: value });
  };

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Account Type</h2>
        <p className="text-gray-400">
          Select the type of account you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal User Option */}
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 cursor-pointer transition-all hover:border-blue-600 hover:bg-blue-600/5 ${
            formData.userType === "personal"
              ? "border-blue-600 bg-blue-600/10"
              : "border-gray-700"
          }`}
          onClick={() => handleUserTypeChange("personal")}
        >
          <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Personal Account</h3>
          <p className="text-sm text-gray-400 text-center">
            For individual users who want to manage their personal documents
          </p>
        </div>

        {/* Company Option */}
        <div
          className={`flex flex-col items-center justify-center rounded-lg border-2 p-6 cursor-pointer transition-all hover:border-blue-600 hover:bg-blue-600/5 ${
            formData.userType === "company"
              ? "border-blue-600 bg-blue-600/10"
              : "border-gray-700"
          }`}
          onClick={() => handleUserTypeChange("company")}
        >
          <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-medium mb-2">Company Account</h3>
          <p className="text-sm text-gray-400 text-center">
            For businesses that need to manage company documents and collaborate
          </p>
        </div>
      </div>

      <div className="pt-6">
        <Button
          type="button"
          className="w-full bg-docuBlue hover:bg-docuBlue-700"
          onClick={handleNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default UserTypeSelectionStep;
