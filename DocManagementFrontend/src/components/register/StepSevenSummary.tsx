import React, { useState } from "react";
import { useMultiStepForm } from "@/context/form";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Building2,
  MapPin,
  AtSign,
  Key,
  Shield,
  Check,
  PenLine,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Form data interface to provide proper typing
interface FormData {
  userType?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  companyName?: string;
  companyRC?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phoneNumber?: string;
  website?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  roleName?: string;
  [key: string]: any;
}

// Review section interface
interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  items: {
    label: string;
    value: React.ReactNode;
    private?: boolean;
    valueClass?: string;
  }[];
  stepIndex: number;
  onEdit: (stepIndex: number) => void;
  expanded?: boolean;
  toggleExpand?: () => void;
}

const ReviewStep: React.FC = () => {
  const { formData, submitForm } = useMultiStepForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  // Typed formData for better TypeScript support
  const typedFormData = formData as FormData;

  const isPersonal = typedFormData.userType === "personal";

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitForm();
      // Success handling is done in the submitForm function
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  // Function to go to a specific step
  const goToStep = (stepIndex: number) => {
    // The useMultiStepForm context should provide a way to go to a specific step
    const { goToStep } = useMultiStepForm();
    if (goToStep) {
      goToStep(stepIndex);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionIndex: number) => {
    setExpandedSection(expandedSection === sectionIndex ? null : sectionIndex);
  };

  // Format personal name
  const formatName = () => {
    if (isPersonal) {
      return `${typedFormData.firstName || ""} ${typedFormData.lastName || ""}`;
    }
    return typedFormData.companyName || "";
  };

  // Format address
  const formatAddress = () => {
    const parts = [
      typedFormData.address,
      typedFormData.city,
      typedFormData.state,
      typedFormData.zipCode,
      typedFormData.country,
    ].filter(Boolean);

    return parts.join(", ");
  };

  // Format role with proper styling
  const formatRole = () => {
    const role = typedFormData.roleName || "User";
    let roleColor = "text-blue-300";

    if (role === "Admin") {
      roleColor = "text-red-300";
    } else if (role === "FullUser") {
      roleColor = "text-emerald-300";
    }

    return <span className={roleColor}>{role}</span>;
  };

  // Define review sections
  const reviewSections = [
    {
      title: "Account Type",
      icon: <User className="h-5 w-5" />,
      items: [
        {
          label: "Account Type",
          value: isPersonal ? "Personal User" : "Company Account",
          valueClass: isPersonal ? "text-blue-300" : "text-emerald-300",
        },
      ],
      stepIndex: 0,
    },
    {
      title: isPersonal ? "Personal Information" : "Company Information",
      icon: isPersonal ? (
        <User className="h-5 w-5" />
      ) : (
        <Building2 className="h-5 w-5" />
      ),
      items: isPersonal
        ? [
            { label: "Full Name", value: formatName() },
            { label: "ID Number", value: typedFormData.cin || "-" },
          ]
        : [
            { label: "Company Name", value: typedFormData.companyName || "-" },
            {
              label: "Registration Number",
              value: typedFormData.companyRC || "-",
            },
            { label: "Industry", value: typedFormData.industry || "-" },
          ],
      stepIndex: 1,
    },
    {
      title: "Contact Information",
      icon: <MapPin className="h-5 w-5" />,
      items: [
        { label: "Address", value: formatAddress() },
        { label: "Phone", value: typedFormData.phoneNumber || "-" },
        ...(isPersonal
          ? []
          : [{ label: "Website", value: typedFormData.website || "-" }]),
      ],
      stepIndex: 2,
    },
    {
      title: "Account Credentials",
      icon: <AtSign className="h-5 w-5" />,
      items: [
        { label: "Username", value: typedFormData.username || "-" },
        { label: "Email", value: typedFormData.email || "-" },
      ],
      stepIndex: 3,
    },
    {
      title: "Security",
      icon: <Key className="h-5 w-5" />,
      items: [{ label: "Password", value: "●●●●●●●●●", private: true }],
      stepIndex: 4,
    },
    {
      title: "Access Level",
      icon: <Shield className="h-5 w-5" />,
      items: [{ label: "Role", value: formatRole() }],
      stepIndex: 5,
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Summary header */}
        <div className="bg-blue-800/20 rounded-lg border border-blue-700/30 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-100 mb-1">
                {formatName()}
              </h3>
              <p className="text-sm text-blue-300">
                {isPersonal ? "Personal Account" : "Company Account"} •{" "}
                {typedFormData.email}
              </p>
            </div>

            <div className="p-3 rounded-full bg-blue-700/20 text-blue-400">
              {isPersonal ? (
                <User className="h-6 w-6" />
              ) : (
                <Building2 className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>

        {/* Review sections */}
        <div className="space-y-4">
          <AnimatePresence>
            {reviewSections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ReviewSection
                  {...section}
                  onEdit={goToStep}
                  expanded={expandedSection === index}
                  toggleExpand={() => toggleSection(index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Confirmation message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-900/20 rounded-lg p-4 text-sm text-green-300 border border-green-800/30 flex items-center gap-3"
        >
          <div className="p-2 rounded-full bg-green-500/20 text-green-400">
            <Check className="h-4 w-4" />
          </div>
          <p>
            Please review all information carefully before completing
            registration. Click on any section to edit if needed.
          </p>
        </motion.div>

        {/* Submit button */}
        <div className="pt-4 flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white mr-1"
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
                Processing...
              </>
            ) : (
              <>Complete Registration</>
            )}
          </Button>
        </div>

        {/* ERP decoration */}
        <div className="flex justify-center mt-6 opacity-20">
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
      </motion.div>
    </form>
  );
};

// Review Section Component
const ReviewSection: React.FC<ReviewSectionProps> = ({
  title,
  icon,
  items,
  stepIndex,
  onEdit,
  expanded = false,
  toggleExpand,
}) => {
  return (
    <div className="border border-blue-900/30 rounded-lg overflow-hidden">
      {/* Section header */}
      <div
        className="bg-blue-900/30 p-4 flex items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-blue-900/40 text-blue-400">
            {icon}
          </div>
          <h4 className="text-sm font-medium text-blue-200">{title}</h4>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(stepIndex);
            }}
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
          >
            <PenLine className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>

          {expanded ? (
            <ChevronUp className="h-4 w-4 text-blue-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-400" />
          )}
        </div>
      </div>

      {/* Section content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-blue-900/30 bg-blue-950/30">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {items.map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-xs text-blue-400">{item.label}</div>
                    <div className={item.valueClass || "text-blue-100"}>
                      {item.value || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewStep;
