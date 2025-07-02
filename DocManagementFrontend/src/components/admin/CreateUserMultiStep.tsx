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
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "@/context/ThemeContext";

// Import step components
import { UserTypeStep } from "./steps/UserTypeStep";
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

// Form schema with all required fields
const formSchema = z.object({
  // User type selection
  userType: z.enum(["simple", "company"], {
    required_error: "Please select a user type.",
  }),

  // Account details
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  companyName: z.string().optional(),

  // Address information
  address: z.string().min(2, {
    message: "Address is required.",
  }),
  city: z.string().min(2, {
    message: "City is required.",
  }),
  country: z.string().min(2, {
    message: "Country is required.",
  }),
  phoneNumber: z.string().min(6, {
    message: "Phone number is required.",
  }),
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

  // Role selection
  roleName: z.enum(["Admin", "FullUser", "SimpleUser"], {
    required_error: "Please select a user role.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserMultiStepProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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
  const { t } = useTranslation();
  const { theme } = useTheme();

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
      title: t("userManagement.accountDetailsStep"),
      description: t("userManagement.accountDetailsStepDesc"),
      icon: <PenLine className="h-5 w-5" />,
    },
    {
      id: 2,
      title: t("userManagement.addressStep"),
      description: t("userManagement.addressStepDesc"),
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      id: 3,
      title: t("userManagement.usernameEmailStep"),
      description: t("userManagement.usernameEmailStepDesc"),
      icon: <AtSign className="h-5 w-5" />,
    },
    {
      id: 4,
      title: t("userManagement.passwordStep"),
      description: t("userManagement.passwordStepDesc"),
      icon: <Key className="h-5 w-5" />,
    },
    {
      id: 5,
      title: t("userManagement.adminAccessStep"),
      description: t("userManagement.adminAccessStepDesc"),
      icon: <Shield className="h-5 w-5" />,
    },
    {
      id: 6,
      title: t("userManagement.reviewStep"),
      description: t("userManagement.reviewStepDesc"),
      icon: <CircleCheck className="h-5 w-5" />,
    },
  ];

  // Get theme colors based on current theme
  const getThemeColors = () => {
    const themeVariant = theme.variant;
    const isDark = theme.mode === "dark";

    switch (themeVariant) {
      case "ocean-blue":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(96, 165, 250, 0.95) 100%)",
          border: isDark
            ? "rgba(96, 165, 250, 0.3)"
            : "rgba(59, 130, 246, 0.3)",
          headerGradient: isDark
            ? "linear-gradient(90deg, rgba(30, 64, 175, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)"
            : "linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(96, 165, 250, 0.8) 100%)",
          stepActive: isDark ? "#3b82f6" : "#2563eb",
          stepCompleted: isDark ? "#10b981" : "#059669",
          stepInactive: isDark
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          text: isDark ? "rgb(219, 234, 254)" : "rgb(30, 58, 138)",
          textSecondary: isDark ? "rgb(147, 197, 253)" : "rgb(59, 130, 246)",
          buttonPrimary: isDark ? "#3b82f6" : "#2563eb",
          buttonSecondary: isDark
            ? "rgba(59, 130, 246, 0.2)"
            : "rgba(59, 130, 246, 0.1)",
        };

      case "emerald-green":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(6, 78, 59, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(5, 150, 105, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)",
          border: isDark
            ? "rgba(52, 211, 153, 0.3)"
            : "rgba(16, 185, 129, 0.3)",
          headerGradient: isDark
            ? "linear-gradient(90deg, rgba(6, 78, 59, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)"
            : "linear-gradient(90deg, rgba(5, 150, 105, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)",
          stepActive: isDark ? "#10b981" : "#059669",
          stepCompleted: isDark ? "#3b82f6" : "#2563eb",
          stepInactive: isDark
            ? "rgba(16, 185, 129, 0.3)"
            : "rgba(16, 185, 129, 0.2)",
          text: isDark ? "rgb(209, 250, 229)" : "rgb(6, 78, 59)",
          textSecondary: isDark ? "rgb(167, 243, 208)" : "rgb(5, 150, 105)",
          buttonPrimary: isDark ? "#10b981" : "#059669",
          buttonSecondary: isDark
            ? "rgba(16, 185, 129, 0.2)"
            : "rgba(16, 185, 129, 0.1)",
        };

      case "purple-haze":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(59, 7, 100, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(107, 33, 168, 0.95) 0%, rgba(124, 58, 237, 0.95) 100%)",
          border: isDark
            ? "rgba(196, 181, 253, 0.3)"
            : "rgba(124, 58, 237, 0.3)",
          headerGradient: isDark
            ? "linear-gradient(90deg, rgba(59, 7, 100, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%)"
            : "linear-gradient(90deg, rgba(107, 33, 168, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%)",
          stepActive: isDark ? "#8b5cf6" : "#7c3aed",
          stepCompleted: isDark ? "#10b981" : "#059669",
          stepInactive: isDark
            ? "rgba(139, 92, 246, 0.3)"
            : "rgba(124, 58, 237, 0.2)",
          text: isDark ? "rgb(237, 233, 254)" : "rgb(59, 7, 100)",
          textSecondary: isDark ? "rgb(221, 214, 254)" : "rgb(107, 33, 168)",
          buttonPrimary: isDark ? "#8b5cf6" : "#7c3aed",
          buttonSecondary: isDark
            ? "rgba(139, 92, 246, 0.2)"
            : "rgba(124, 58, 237, 0.1)",
        };

      case "orange-sunset":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(154, 52, 18, 0.95) 0%, rgba(234, 88, 12, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(234, 88, 12, 0.95) 0%, rgba(251, 146, 60, 0.95) 100%)",
          border: isDark ? "rgba(251, 146, 60, 0.3)" : "rgba(234, 88, 12, 0.3)",
          headerGradient: isDark
            ? "linear-gradient(90deg, rgba(154, 52, 18, 0.8) 0%, rgba(234, 88, 12, 0.8) 100%)"
            : "linear-gradient(90deg, rgba(234, 88, 12, 0.8) 0%, rgba(251, 146, 60, 0.8) 100%)",
          stepActive: isDark ? "#fb923c" : "#ea580c",
          stepCompleted: isDark ? "#10b981" : "#059669",
          stepInactive: isDark
            ? "rgba(251, 146, 60, 0.3)"
            : "rgba(234, 88, 12, 0.2)",
          text: isDark ? "rgb(255, 237, 213)" : "rgb(124, 45, 18)",
          textSecondary: isDark ? "rgb(254, 215, 170)" : "rgb(194, 65, 12)",
          buttonPrimary: isDark ? "#fb923c" : "#ea580c",
          buttonSecondary: isDark
            ? "rgba(251, 146, 60, 0.2)"
            : "rgba(234, 88, 12, 0.1)",
        };

      case "dark-neutral":
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(23, 23, 23, 0.95) 0%, rgba(64, 64, 64, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(64, 64, 64, 0.95) 0%, rgba(115, 115, 115, 0.95) 100%)",
          border: isDark ? "rgba(115, 115, 115, 0.3)" : "rgba(64, 64, 64, 0.3)",
          headerGradient: isDark
            ? "linear-gradient(90deg, rgba(23, 23, 23, 0.8) 0%, rgba(64, 64, 64, 0.8) 100%)"
            : "linear-gradient(90deg, rgba(64, 64, 64, 0.8) 0%, rgba(115, 115, 115, 0.8) 100%)",
          stepActive: isDark ? "#737373" : "#404040",
          stepCompleted: isDark ? "#10b981" : "#059669",
          stepInactive: isDark
            ? "rgba(115, 115, 115, 0.3)"
            : "rgba(64, 64, 64, 0.2)",
          text: isDark ? "rgb(245, 245, 245)" : "rgb(23, 23, 23)",
          textSecondary: isDark ? "rgb(212, 212, 212)" : "rgb(38, 38, 38)",
          buttonPrimary: isDark ? "#737373" : "#404040",
          buttonSecondary: isDark
            ? "rgba(115, 115, 115, 0.2)"
            : "rgba(64, 64, 64, 0.1)",
        };

      default: // standard theme
        return {
          gradient: isDark
            ? "linear-gradient(135deg, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)"
            : "linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(96, 165, 250, 0.95) 100%)",
          border: isDark
            ? "rgba(96, 165, 250, 0.3)"
            : "rgba(59, 130, 246, 0.3)",
          headerGradient: isDark
            ? "linear-gradient(90deg, rgba(30, 64, 175, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)"
            : "linear-gradient(90deg, rgba(59, 130, 246, 0.8) 0%, rgba(96, 165, 250, 0.8) 100%)",
          stepActive: isDark ? "#3b82f6" : "#2563eb",
          stepCompleted: isDark ? "#10b981" : "#059669",
          stepInactive: isDark
            ? "rgba(59, 130, 246, 0.3)"
            : "rgba(59, 130, 246, 0.2)",
          text: isDark ? "rgb(219, 234, 254)" : "rgb(30, 58, 138)",
          textSecondary: isDark ? "rgb(147, 197, 253)" : "rgb(59, 130, 246)",
          buttonPrimary: isDark ? "#3b82f6" : "#2563eb",
          buttonSecondary: isDark
            ? "rgba(59, 130, 246, 0.2)"
            : "rgba(59, 130, 246, 0.1)",
        };
    }
  };

  const colors = getThemeColors();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "simple",
      firstName: "",
      lastName: "",
      companyName: "",
      address: "",
      city: "",
      country: "",
      phoneNumber: "",
      webSite: "",
      username: "",
      email: "",
      passwordHash: "",
      roleName: "SimpleUser",
    },
  });

  const userType = form.watch("userType");

  // Username availability check
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    try {
      // For now, we'll assume the username is available
      // In a real implementation, you'd call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setUsernameAvailable(true);
    } catch (error) {
      setUsernameAvailable(false);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Email availability check
  const checkEmailAvailability = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailAvailable(null);
      return;
    }

    setEmailChecking(true);
    try {
      // For now, we'll assume the email is available
      // In a real implementation, you'd call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call
      setEmailAvailable(true);
    } catch (error) {
      setEmailAvailable(false);
    } finally {
      setEmailChecking(false);
    }
  };

  // Username field watch
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "username") {
        const username = value.username || "";
        checkUsernameAvailability(username);
      }
      if (name === "email") {
        const email = value.email || "";
        checkEmailAvailability(email);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

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
        fieldsToValidate =
          userType === "simple" ? ["firstName", "lastName"] : ["companyName"];
        break;
      case 2:
        fieldsToValidate = ["address", "city", "country", "phoneNumber"];
        break;
      case 3:
        fieldsToValidate = ["username", "email"];
        // Also check if username and email are available
        if (!usernameAvailable) {
          form.setError("username", {
            message: "Username is already taken",
          });
          return false;
        }
        if (!emailAvailable) {
          form.setError("email", {
            message: "Email is already registered",
          });
          return false;
        }
        break;
      case 4:
        fieldsToValidate = ["passwordHash"];
        break;
      case 5:
        fieldsToValidate = ["roleName"];
        break;
      case 6:
        // Review step, no validation needed
        return true;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  // Navigation between steps
  const nextStep = async () => {
    const isValid = await validateCurrentStep();

    if (isValid) {
      setDirection(1);
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Submit the form
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Prepare user data for API call
      const userData = {
        email: values.email,
        username: values.username,
        passwordHash: values.passwordHash,
        firstName:
          userType === "simple" ? values.firstName : values.companyName || "",
        lastName: userType === "simple" ? values.lastName : "",
        roleName: values.roleName,
        // Additional fields from the form
        phoneNumber: values.phoneNumber,
        address: values.address,
        city: values.city,
        country: values.country,
        webSite: values.webSite,
        userType: values.userType,
      };

      await adminService.createUser(userData);
      toast.success("User created successfully");
      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);

      let errorMessage = "Failed to create user";

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
        return <AccountDetailsStep form={form} />;
      case 2:
        return <AddressStep form={form} />;
      case 3:
        return (
          <UsernameEmailStep
            form={form}
            usernameAvailable={usernameAvailable}
            emailAvailable={emailAvailable}
            usernameChecking={usernameChecking}
            emailChecking={emailChecking}
          />
        );
      case 4:
        return (
          <PasswordStep
            form={form}
            showPassword={showPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        );
      case 5:
        return <RoleStep form={form} />;
      case 6:
        return <ReviewStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden sm:max-w-[700px] max-h-[90vh] flex flex-col border rounded-xl shadow-2xl"
        style={{
          background: colors.gradient,
          borderColor: colors.border,
          boxShadow: `0 25px 50px -12px ${colors.border}, 0 0 0 1px ${colors.border}`,
        }}
      >
        {/* Modern Header with Gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative px-6 py-6 border-b flex-shrink-0"
          style={{
            background: colors.headerGradient,
            borderBottomColor: colors.border,
          }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="p-3 rounded-xl backdrop-blur-sm"
              style={{ backgroundColor: `${colors.buttonSecondary}80` }}
            >
              <UserPlus className="h-6 w-6" style={{ color: colors.text }} />
            </motion.div>
            <div>
              <DialogTitle
                className="text-2xl font-bold"
                style={{ color: colors.text }}
              >
                {t("userManagement.createUserTitle")}
              </DialogTitle>
              <DialogDescription
                className="text-sm mt-1"
                style={{ color: colors.textSecondary }}
              >
                {t("userManagement.createUserSubtitle")}
              </DialogDescription>
            </div>
          </div>

          {/* Modern Step Indicator */}
          <div className="mt-6">
            <div className="flex justify-between items-center relative">
              {/* Progress Line */}
              <div
                className="absolute top-5 left-0 h-0.5 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: colors.stepInactive,
                  width: "100%",
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.stepActive }}
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>

              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  className="relative flex flex-col items-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                    style={{
                      backgroundColor:
                        currentStep === step.id
                          ? colors.stepActive
                          : currentStep > step.id
                          ? colors.stepCompleted
                          : colors.stepInactive,
                      borderColor:
                        currentStep === step.id
                          ? colors.stepActive
                          : currentStep > step.id
                          ? colors.stepCompleted
                          : colors.stepInactive,
                      color:
                        currentStep >= step.id ? "white" : colors.textSecondary,
                    }}
                    animate={{
                      scale: currentStep === step.id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </motion.div>

                  {/* Step Label - only show for current step */}
                  <AnimatePresence>
                    {currentStep === step.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-12 text-center"
                      >
                        <span
                          className="text-xs font-medium px-2 py-1 rounded-md backdrop-blur-sm"
                          style={{
                            color: colors.text,
                            backgroundColor: `${colors.buttonSecondary}80`,
                          }}
                        >
                          {step.title}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
              {/* Dynamic step content */}
              <div className="px-6 py-6 min-h-[400px]">
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
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h3
                          className="text-xl font-semibold mb-2"
                          style={{ color: colors.text }}
                        >
                          {steps[currentStep].title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: colors.textSecondary }}
                        >
                          {steps[currentStep].description}
                        </p>
                      </motion.div>

                      {/* Render step content */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {renderStepContent()}
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Modern Navigation Footer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="px-6 py-4 border-t flex justify-between items-center flex-shrink-0"
                style={{ borderTopColor: colors.border }}
              >
                <Button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="border transition-all duration-200 flex items-center gap-2"
                  style={{
                    backgroundColor:
                      currentStep === 0
                        ? colors.stepInactive
                        : colors.buttonSecondary,
                    borderColor: colors.border,
                    color:
                      currentStep === 0 ? colors.textSecondary : colors.text,
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("userManagement.back")}
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="transition-all duration-200 flex items-center gap-2 text-white"
                    style={{
                      backgroundColor: colors.buttonPrimary,
                      borderColor: colors.buttonPrimary,
                    }}
                  >
                    {t("userManagement.next")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="transition-all duration-200 flex items-center gap-2 text-white"
                    style={{
                      backgroundColor: colors.buttonPrimary,
                      borderColor: colors.buttonPrimary,
                    }}
                  >
                    {isSubmitting
                      ? t("userManagement.creating")
                      : t("userManagement.createUserButton")}
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
