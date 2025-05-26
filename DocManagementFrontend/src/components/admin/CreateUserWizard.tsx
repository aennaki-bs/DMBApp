import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
  CheckCircle,
  UserPlus,
  Building2,
  User,
  Mail,
  Lock,
  MapPin,
  Key,
  Shield,
  ChevronLeft,
  ChevronRight,
  Info,
  Briefcase,
  Eye,
  EyeOff,
} from "lucide-react";

// Import required components and services
import authService from "@/services/authService";
import api from "@/services/api";
import { UserTypeStep } from "./user-wizard/UserTypeStep";
import { AccountDetailsStep } from "./user-wizard/AccountDetailsStep";
import { AddressStep } from "./user-wizard/AddressStep";
import { CredentialsStep } from "./user-wizard/CredentialsStep";
import { RoleStep } from "./user-wizard/RoleStep";
import { ReviewStep } from "./user-wizard/ReviewStep";

// Define user types
type UserType = "personal" | "company";

// Define validation schema
const userFormSchema = z
  .object({
    // Step 1: User Type
    userType: z.enum(["personal", "company"] as const),

    // Step 2: Account Details
    firstName: z.string().min(2, "First name must be at least 2 characters."),
    lastName: z.string().min(2, "Last name must be at least 2 characters."),
    // Conditional fields based on user type
    // Personal
    cin: z.string().optional(),
    personalPhone: z.string().optional(),
    // Company
    companyName: z.string().optional(),
    companyRC: z.string().optional(),
    companyPhone: z.string().optional(),
    companyEmail: z
      .string()
      .email("Please enter a valid company email.")
      .optional(),
    companyWebsite: z.string().url("Please enter a valid URL.").optional(),

    // Step 3: Address
    address: z.string().min(5, "Address must be at least 5 characters."),
    city: z.string().min(2, "City must be at least 2 characters."),
    country: z.string().min(2, "Country must be at least 2 characters."),

    // Step 4: Credentials
    email: z.string().email("Please enter a valid email address."),
    username: z.string().min(3, "Username must be at least 3 characters."),

    // Step 5: Password
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .refine(
        (value) => /[A-Z]/.test(value),
        "Password must contain at least one uppercase letter."
      )
      .refine(
        (value) => /[a-z]/.test(value),
        "Password must contain at least one lowercase letter."
      )
      .refine(
        (value) => /[0-9]/.test(value),
        "Password must contain at least one number."
      )
      .refine(
        (value) => /[^A-Za-z0-9]/.test(value),
        "Password must contain at least one special character."
      ),
    confirmPassword: z.string(),

    // Step 6: Role
    roleId: z.number().optional(),
    roleName: z.enum(["Admin", "FullUser", "SimpleUser"], {
      required_error: "Please select a user role.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.userType === "company") {
        return !!data.companyName && !!data.companyRC;
      }
      return true;
    },
    {
      message: "Required for company accounts",
      path: ["companyName"],
    }
  )
  .refine(
    (data) => {
      if (data.userType === "personal") {
        return !!data.cin;
      }
      return true;
    },
    {
      message: "Required for personal accounts",
      path: ["cin"],
    }
  );

// Type for our form
type UserFormValues = z.infer<typeof userFormSchema>;

// Props for our wizard component
interface CreateUserWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Animation variants for steps
const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

// Step interface
interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function CreateUserWizard({
  open,
  onOpenChange,
}: CreateUserWizardProps) {
  // Current step state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Credential validation states
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
    null
  );
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);

  // Setup form with validation
  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      userType: "personal",
      firstName: "",
      lastName: "",
      cin: "",
      personalPhone: "",
      companyName: "",
      companyRC: "",
      companyPhone: "",
      companyEmail: "",
      companyWebsite: "",
      address: "",
      city: "",
      country: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      roleName: "SimpleUser",
    },
    mode: "onChange",
  });

  const { watch, trigger, getValues, reset } = methods;

  // Reset form and step when dialog closes
  useEffect(() => {
    if (!open) {
      // Small delay to avoid visual jump
      setTimeout(() => {
        setCurrentStep(0);
        reset();
      }, 300);
    }
  }, [open, reset]);

  // Watch for userType changes to handle conditional validation
  const userType = watch("userType");
  const email = watch("email");
  const username = watch("username");

  // Define steps
  const steps: Step[] = [
    {
      id: "user-type",
      title: "User Type",
      description: "Select user account type",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: "account-details",
      title: "Account Details",
      description: "Enter account information",
      icon: <User className="h-5 w-5" />,
    },
    {
      id: "address",
      title: "Address",
      description: "Enter address information",
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: "credentials",
      title: "Credentials",
      description: "Create username and email",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: "password",
      title: "Password",
      description: "Create secure password",
      icon: <Lock className="h-5 w-5" />,
    },
    {
      id: "role",
      title: "Role",
      description: "Assign user permissions",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: "review",
      title: "Review",
      description: "Confirm all details",
      icon: <CheckCircle className="h-5 w-5" />,
    },
  ];

  // Email and username validation
  useEffect(() => {
    const validateCredentials = async () => {
      if (email && email.includes("@")) {
        setIsCheckingEmail(true);
        try {
          const isAvailable = await authService.validateEmail(email);
          setIsEmailAvailable(isAvailable);
        } catch (error) {
          console.error("Email validation error:", error);
          setIsEmailAvailable(false);
        } finally {
          setIsCheckingEmail(false);
        }
      }

      if (username && username.length >= 3) {
        setIsCheckingUsername(true);
        try {
          const isAvailable = await authService.validateUsername(username);
          setIsUsernameAvailable(isAvailable);
        } catch (error) {
          console.error("Username validation error:", error);
          setIsUsernameAvailable(false);
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    // Add a debounce for validation
    const timeoutId = setTimeout(() => {
      validateCredentials();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email, username]);

  // Navigate to a specific step
  const navigateToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Handle next step with validation
  const handleNext = async () => {
    // Define fields to validate per step
    const fieldsToValidate = [
      // Step 0: User Type
      ["userType"],
      // Step 1: Account Details
      userType === "personal"
        ? ["firstName", "lastName", "cin", "personalPhone"]
        : [
            "firstName",
            "lastName",
            "companyName",
            "companyRC",
            "companyPhone",
            "companyEmail",
          ],
      // Step 2: Address
      ["address", "city", "country"],
      // Step 3: Credentials
      ["email", "username"],
      // Step 4: Password
      ["password", "confirmPassword"],
      // Step 5: Role
      ["roleName"],
      // Step 6: Review
      [],
    ];

    // Validate fields for current step
    const isValid = await trigger(fieldsToValidate[currentStep] as any);

    if (isValid) {
      // For credentials step, also check availability
      if (currentStep === 3) {
        if (!isEmailAvailable) {
          toast.error("Email is already in use. Please choose another.");
          return;
        }
        if (!isUsernameAvailable) {
          toast.error("Username is already taken. Please choose another.");
          return;
        }
      }

      // Move to the next step
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  // Move to previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);

    try {
      // Convert form data to API request format
      const registerData = {
        email: data.email,
        username: data.username,
        passwordHash: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        // Address fields
        address: data.address,
        city: data.city,
        country: data.country,
        // Phone number - use the appropriate one based on user type
        phoneNumber:
          data.userType === "personal" ? data.personalPhone : data.companyPhone,
        // Identity - use CIN for personal users
        identity: data.userType === "personal" ? data.cin : data.companyRC,
        // Website - only relevant for company
        webSite: data.userType === "company" ? data.companyWebsite : "",
        // Role
        roleId: getRoleId(data.roleName),

        // Additional fields required by API with default values
        isActive: true,
        isEmailConfirmed: false,
      };

      // Direct API call to ensure we use the correct endpoint
      const response = await api.post("/Auth/register", registerData);

      // Success notification
      toast.success(`User created successfully!`);

      // Reset form and close dialog
      reset();
      setCurrentStep(0);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(
        error.response?.data ||
          "Failed to create user. Please check your inputs and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to map role names to IDs
  const getRoleId = (roleName: string): number => {
    switch (roleName) {
      case "Admin":
        return 1;
      case "FullUser":
        return 2;
      case "SimpleUser":
        return 3;
      default:
        return 3; // Default to SimpleUser
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl p-0 overflow-hidden sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 border-b border-blue-900/30 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-blue-100">
              Create New User
            </DialogTitle>
          </div>
          <p className="text-blue-300 text-sm">
            Complete all steps to create a new user account
          </p>
        </DialogHeader>

        {/* Progress indicators */}
        <div className="px-6 pt-6">
          <div className="mb-6">
            {/* Step indicators */}
            <div className="flex justify-between mb-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center ${
                    idx <= currentStep ? "text-blue-400" : "text-gray-500"
                  }`}
                  style={{ width: `${100 / steps.length}%` }}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                    ${
                      idx < currentStep
                        ? "bg-blue-600 text-white"
                        : idx === currentStep
                        ? "bg-blue-500 text-white ring-4 ring-blue-500/20"
                        : "bg-blue-900/30 border border-blue-900/50"
                    }`}
                  >
                    {idx < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-xs text-center hidden md:block">
                    {step.title}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-blue-900/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Step description */}
            <div className="text-center mt-2 text-sm text-blue-200">
              {steps[currentStep].description}
            </div>
          </div>
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Step content area with animation */}
            <div className="flex-1 px-6 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`step-${currentStep}`}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={stepVariants}
                  transition={{ duration: 0.3 }}
                  className="py-3"
                >
                  {/* Step content based on current step */}
                  {currentStep === 0 && <UserTypeStep />}

                  {currentStep === 1 && (
                    <AccountDetailsStep userType={userType as UserType} />
                  )}

                  {currentStep === 2 && <AddressStep />}

                  {currentStep === 3 && (
                    <CredentialsStep
                      isEmailAvailable={isEmailAvailable}
                      isUsernameAvailable={isUsernameAvailable}
                      isCheckingEmail={isCheckingEmail}
                      isCheckingUsername={isCheckingUsername}
                    />
                  )}

                  {currentStep === 4 && (
                    <CredentialsStep
                      isPassword={true}
                      showPassword={showPassword}
                      togglePasswordVisibility={() =>
                        setShowPassword(!showPassword)
                      }
                    />
                  )}

                  {currentStep === 5 && <RoleStep />}

                  {currentStep === 6 && (
                    <ReviewStep onNavigateToStep={navigateToStep} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between p-6 border-t border-blue-900/30 bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95">
              {currentStep > 0 ? (
                <Button
                  type="button"
                  onClick={handlePrevious}
                  variant="outline"
                  className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40"
                >
                  Cancel
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {isSubmitting ? "Creating..." : "Create User"}
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
