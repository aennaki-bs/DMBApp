import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import adminService from "@/services/adminService";
import authService from "@/services/authService";
import responsibilityCentreService from "@/services/responsibilityCentreService";
import {
  Building2,
  User,
  MapPin,
  AtSign,
  Key,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  CircleCheck,
  PenLine,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { ResponsibilityCentreSimple } from "@/models/responsibilityCentre";

// Import step components
import { UserTypeStep } from "./steps/UserTypeStep";
import { ResponsibilityCentreStep } from "./steps/ResponsibilityCentreStep";
import { AccountDetailsStep } from "./steps/AccountDetailsStep";
import { AddressStep } from "./steps/AddressStep";
import { UsernameEmailStep } from "./steps/UsernameEmailStep";
import { PasswordStep } from "./steps/PasswordStep";
import { RoleStep } from "./steps/RoleStep";
import { ReviewStep } from "./steps/ReviewStep";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters." })
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must contain at least one lowercase letter.",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Password must contain at least one number.",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must contain at least one special character.",
  });

// Form schema with conditional validation based on user type
const formSchema = z.object({
  // User type selection
  userType: z.enum(["personal", "company"], {
    required_error: "Please select a user type.",
  }),

  // Responsibility Centre (optional, default to 0)
  responsibilityCenterId: z.number().default(0),

  // Account details - conditional based on user type
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  cin: z.string().optional(),
  companyName: z.string().optional(),
  registrationNumber: z.string().optional(),

  // Address information
  address: z.string().optional(),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  phoneNumber: z.string().optional(),
  webSite: z.string().optional(),

  // Username & Email
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),

  // Password
  passwordHash: passwordSchema,
  confirmPassword: z.string().min(1, {
    message: "Please confirm your password.",
  }),

  // Role selection
  roleName: z.enum(["Admin", "FullUser", "SimpleUser"], {
    required_error: "Please select a user role.",
  }),
})
.refine((data) => data.passwordHash === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
.refine((data) => {
  if (data.userType === "personal") {
    return data.firstName && data.firstName.trim().length >= 2;
  }
  return true;
}, {
  message: "First name must be at least 2 characters.",
  path: ["firstName"],
})
.refine((data) => {
  if (data.userType === "personal") {
    return data.lastName && data.lastName.trim().length >= 2;
  }
  return true;
}, {
  message: "Last name must be at least 2 characters.",
  path: ["lastName"],
})
.refine((data) => {
  if (data.userType === "company") {
    return data.companyName && data.companyName.trim().length >= 2;
  }
  return true;
}, {
  message: "Company name must be at least 2 characters.",
  path: ["companyName"],
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserMultiStepProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Step configuration
interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function CreateUserMultiStep({
  open,
  onOpenChange,
}: CreateUserMultiStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [direction, setDirection] = useState(0);
  const [responsibilityCentres, setResponsibilityCentres] = useState<ResponsibilityCentreSimple[]>([]);
  const { t } = useTranslation();

  // Define steps for the form
  const steps: Step[] = [
    {
      id: 0,
      title: t("userManagement.userTypeStep"),
      description: t("userManagement.userTypeStepDesc"),
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 1,
      title: "Responsibility Centre",
      description: "Assign to organizational unit",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: 2,
      title: t("userManagement.accountDetailsStep"),
      description: t("userManagement.accountDetailsStepDesc"),
      icon: <PenLine className="h-5 w-5" />,
    },
    {
      id: 3,
      title: t("userManagement.addressStep"),
      description: t("userManagement.addressStepDesc"),
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 4,
      title: t("userManagement.usernameEmailStep"),
      description: t("userManagement.usernameEmailStepDesc"),
      icon: <AtSign className="h-5 w-5" />,
    },
    {
      id: 5,
      title: t("userManagement.passwordStep"),
      description: t("userManagement.passwordStepDesc"),
      icon: <Key className="h-5 w-5" />,
    },
    {
      id: 6,
      title: t("userManagement.adminAccessStep"),
      description: t("userManagement.adminAccessStepDesc"),
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: 7,
      title: t("userManagement.reviewStep"),
      description: t("userManagement.reviewStepDesc"),
      icon: <CircleCheck className="h-5 w-5" />,
    },
  ];

  // Form initialization
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "personal",
      responsibilityCenterId: 0,
      firstName: "",
      lastName: "",
      cin: "",
      companyName: "",
      registrationNumber: "",
      address: "",
      city: "",
      country: "",
      phoneNumber: "",
      webSite: "",
      username: "",
      email: "",
      passwordHash: "",
      confirmPassword: "",
      roleName: "SimpleUser",
    },
    mode: "onChange",
  });

  // Debug form initialization
  console.log("Form initialized with default values:", form.getValues());

  // Fetch responsibility centres and reset form when component opens
  useEffect(() => {
    if (open) {
      // Reset step to beginning
      setCurrentStep(0);
      setIsSubmitting(false);
      setUsernameAvailable(null);
      setEmailAvailable(null);
      
      const fetchCentres = async () => {
        try {
          const data = await responsibilityCentreService.getSimple();
          setResponsibilityCentres(data || []);
        } catch (error) {
          console.error("Failed to fetch responsibility centres:", error);
          setResponsibilityCentres([]);
        }
      };
      fetchCentres();
    }
  }, [open, form]);

  // Watch for values
  const userType = form.watch("userType");
  const username = form.watch("username");
  const email = form.watch("email");

  // Username availability check
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (username && username.length >= 3) {
      setUsernameAvailable(null);
      setUsernameChecking(true);

      timeoutId = setTimeout(async () => {
        try {
          const isAvailable = await authService.validateUsername(username);
          setUsernameAvailable(isAvailable);
        } catch (error) {
          console.error("Error checking username:", error);
          setUsernameAvailable(false);
        } finally {
          setUsernameChecking(false);
        }
      }, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [username]);

  // Email availability check
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailAvailable(null);
      setEmailChecking(true);

      timeoutId = setTimeout(async () => {
        try {
          const isAvailable = await authService.validateEmail(email);
          setEmailAvailable(isAvailable);
        } catch (error) {
          console.error("Error checking email:", error);
          setEmailAvailable(false);
        } finally {
          setEmailChecking(false);
        }
      }, 500);
    }

    return () => clearTimeout(timeoutId);
  }, [email]);

  // Reset form and state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset everything when dialog opens
      setCurrentStep(0);
      setIsSubmitting(false);
      setUsernameAvailable(null);
      setEmailAvailable(null);
      setUsernameChecking(false);
      setEmailChecking(false);
      form.reset({
        userType: "personal",
        responsibilityCenterId: 0,
        firstName: "",
        lastName: "",
        cin: "",
        companyName: "",
        registrationNumber: "",
        address: "",
        city: "",
        country: "",
        phoneNumber: "",
        webSite: "",
        username: "",
        email: "",
        passwordHash: "",
        confirmPassword: "",
        roleName: "SimpleUser",
      });
    }
  }, [open, form]);

  // Helper functions
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validation for specific steps
  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof FormValues)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["userType"];
        break;
      case 1:
        // Responsibility Centre step - optional field, no validation needed
        return true;
      case 2:
        // Validate conditional fields based on user type
        if (userType === "personal") {
          fieldsToValidate = ["firstName", "lastName"];
        } else {
          fieldsToValidate = ["companyName"];
        }
        break;
      case 3:
        fieldsToValidate = ["city", "country"];
        break;
      case 4:
        fieldsToValidate = ["username", "email"];
        // Also check if username and email are available
        if (usernameAvailable === false) {
          form.setError("username", {
            message: "This username is already taken. Please choose a different one.",
          });
          return false;
        }
        if (usernameAvailable === null && username && username.length >= 3) {
          form.setError("username", {
            message: "Please wait while we check username availability...",
          });
          return false;
        }
        if (emailAvailable === false) {
          form.setError("email", {
            message: "This email address is already registered. Please use a different email.",
          });
          return false;
        }
        if (emailAvailable === null && email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          form.setError("email", {
            message: "Please wait while we check email availability...",
          });
          return false;
        }
        break;
      case 5:
        fieldsToValidate = ["passwordHash", "confirmPassword"];
        // Add specific debugging for password validation
        const passwordValue = form.getValues("passwordHash");
        const confirmPasswordValue = form.getValues("confirmPassword");
        console.log("Password validation - passwordHash:", passwordValue);
        console.log("Password validation - confirmPassword:", confirmPasswordValue);
        console.log("Passwords match:", passwordValue === confirmPasswordValue);
        break;
      case 6:
        fieldsToValidate = ["roleName"];
        break;
      case 7:
        // Review step, no validation needed
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    
    // Add detailed debugging for failed validation
    if (!result) {
      console.log("Validation failed. Current errors:");
      const errors = form.formState.errors;
      fieldsToValidate.forEach(field => {
        if (errors[field]) {
          console.log(`${field}: ${errors[field]?.message}`);
        }
      });
      
      console.log("All form errors:", errors);
      console.log("Form values:", form.getValues());
    }
    
    return result;
  };

  // Navigation between steps
  const nextStep = async () => {
    console.log("Next step clicked, current step:", currentStep);
    const isValid = await validateCurrentStep();
    console.log("Validation result:", isValid);

    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      console.log("Validation failed, staying on current step");
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Handle edit step from review
  const handleEditStep = (stepIndex: number) => {
    setDirection(stepIndex < currentStep ? -1 : 1);
    setCurrentStep(stepIndex);
  };

  // Submit the form - only called when explicitly triggered on review step
  const onSubmit = async (values: FormValues) => {
    // Only allow submission from the review step
    if (currentStep !== 7) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Submitting user with values:", values);
      console.log("User type:", userType);
      console.log("CIN value (optional):", values.cin || "not provided");
      console.log("Registration Number (optional):", values.registrationNumber || "not provided");
      console.log("Website (optional):", values.webSite || "not provided");
      console.log("Address (optional):", values.address || "not provided");
      console.log("Phone Number (optional):", values.phoneNumber || "not provided");
      
      const identityValue = userType === "personal" 
        ? values.cin || "" 
        : values.registrationNumber || "";
      console.log("Identity will be sent as:", identityValue);

      // Prepare user data for API call - exact match to API structure
      const userData = {
        email: values.email,
        username: values.username,
        passwordHash: values.passwordHash,
        firstName: userType === "personal" ? values.firstName : values.companyName || "",
        lastName: userType === "personal" ? values.lastName : "",
        roleName: values.roleName,
        city: values.city,
        country: values.country,
        address: values.address || "",
        identity: identityValue,
        phoneNumber: values.phoneNumber || "",
        webSite: values.webSite || "",
        responsibilityCenterId: values.responsibilityCenterId || 0,
        userType: userType === "personal" ? "personal" : "company",
      };

      console.log("Submitting user data:", userData);

      await adminService.createUser(userData);
      toast.success("Account created successfully");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);

      let errorMessage = "Failed to create Account";

      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission - prevent auto-submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Don't do anything - form submission should only happen via button click
  };

  // Handle explicit Create User button click
  const handleCreateUserClick = async () => {
    console.log("Create User button clicked");
    console.log("Current form values:", form.getValues());
    console.log("Current form errors:", form.formState.errors);
    
    // Run form validation
    const isValid = await form.trigger();
    console.log("Form validation result:", isValid);
    
    if (isValid) {
      // Get the values and submit
      const values = form.getValues();
      await onSubmit(values);
    } else {
      console.log("Form errors after trigger:", form.formState.errors);
      
      // Create a more user-friendly error message
      const errors = form.formState.errors;
      const errorMessages = [];
      
      if (errors.firstName) errorMessages.push("First Name: " + errors.firstName.message);
      if (errors.lastName) errorMessages.push("Last Name: " + errors.lastName.message);
      if (errors.companyName) errorMessages.push("Company Name: " + errors.companyName.message);
      if (errors.email) errorMessages.push("Email: " + errors.email.message);
      if (errors.username) errorMessages.push("Username: " + errors.username.message);
      if (errors.passwordHash) errorMessages.push("Password: " + errors.passwordHash.message);
      if (errors.confirmPassword) errorMessages.push("Confirm Password: " + errors.confirmPassword.message);
      if (errors.city) errorMessages.push("City: " + errors.city.message);
      if (errors.country) errorMessages.push("Country: " + errors.country.message);
      if (errors.roleName) errorMessages.push("Role: " + errors.roleName.message);
      
      if (errorMessages.length > 0) {
        toast.error("Please fix the following errors:\n" + errorMessages.join("\n"));
      } else {
        toast.error("Please fill in all required fields");
      }
    }
  };

  // Handle keyboard events - prevent Enter key from submitting form on non-review steps
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep !== 7) {
      e.preventDefault();
      // Trigger next step instead of form submission
      nextStep();
    }
  };

  // Animation variants
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

  // Render appropriate step content based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <UserTypeStep form={form} />;
      case 1:
        return <ResponsibilityCentreStep form={form} />;
      case 2:
        return <AccountDetailsStep form={form} />;
      case 3:
        return <AddressStep form={form} />;
      case 4:
        return (
          <UsernameEmailStep
            form={form}
            usernameAvailable={usernameAvailable}
            emailAvailable={emailAvailable}
            usernameChecking={usernameChecking}
            emailChecking={emailChecking}
          />
        );
      case 5:
        return (
          <PasswordStep
            form={form}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        );
      case 6:
        return <RoleStep form={form} />;
      case 7:
        return <ReviewStep form={form} onEditStep={handleEditStep} responsibilityCentres={responsibilityCentres} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl p-0 overflow-hidden sm:max-w-[620px] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 border-b border-blue-900/30 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-blue-100">
              {t("userManagement.createUserTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300">
            {t("userManagement.createUserSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-5">
              {/* Step indicators */}
              <div className="px-6 pt-6 pb-0">
                <div className="flex justify-between items-center">
                  {steps.map((step) => (
                    <div key={step.id} className="flex flex-col items-center min-h-[60px]">
                      <div
                        className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${
                          currentStep === step.id
                            ? "bg-blue-600 border-blue-400 text-white scale-110"
                            : currentStep > step.id
                            ? "bg-green-600/30 border-green-400/50 text-green-300"
                            : "bg-blue-900/30 border-blue-900/50 text-blue-300/50"
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          step.icon
                        )}

                        {/* Connecting line */}
                        {step.id < steps.length - 1 && (
                          <div
                            className={`absolute top-1/2 left-full w-[calc(100%-10px)] h-[2px] -translate-y-1/2 transition-all duration-300 ${
                              currentStep > step.id
                                ? "bg-green-500/50"
                                : "bg-blue-900/50"
                            }`}
                          ></div>
                        )}
                      </div>

                      {/* Step label only shows for current step */}
                      {currentStep === step.id && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-blue-300 font-medium text-center w-20 mt-3"
                        >
                          {step.title}
                        </motion.span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic step content */}
              <div className="px-6 space-y-6 min-h-[300px]">
                <AnimatePresence mode="wait" initial={false} custom={direction}>
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
                    <div className="py-2">
                      <h3 className="text-lg font-semibold mb-1 text-blue-100">
                        {steps[currentStep].title}
                      </h3>
                      <p className="text-sm text-blue-300 mb-4">
                        {steps[currentStep].description}
                      </p>

                      {/* Render step content */}
                      {renderStepContent()}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation buttons */}
              <div className="px-6 pb-6 pt-2 border-t border-blue-900/30 flex justify-between items-center">
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`border border-blue-900/50 transition-all duration-200 flex items-center gap-2 ${
                    currentStep === 0
                      ? "opacity-50 bg-blue-950/30 text-blue-300/50"
                      : "bg-blue-900/50 hover:bg-blue-800/50 text-blue-300"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("userManagement.back")}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
                    disabled={
                      currentStep === 0 &&
                      (!userType || (userType !== "personal" && userType !== "company"))
                    }
                  >
                    {t("userManagement.next")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleCreateUserClick}
                    disabled={isSubmitting}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting ? "Creating..." : "Create Account"}
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
