import { useState } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import adminService, { CreateUserRequest } from "@/services/adminService";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  UserPlus,
  Mail,
  User,
  Key,
  Shield,
} from "lucide-react";
import { motion } from "framer-motion";

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

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  passwordHash: passwordSchema,
  roleName: z.enum(["Admin", "FullUser", "SimpleUser"], {
    required_error: "Please select a user role.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MotionDiv = motion.div;

export function CreateUserDialog({
  open,
  onOpenChange,
}: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Basic Information",
      description: "Enter user account details",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Personal Information",
      description: "Enter first and last name",
      icon: <User className="h-4 w-4" />,
    },
    {
      title: "Security",
      description: "Set password and role",
      icon: <Key className="h-4 w-4" />,
    },
    {
      title: "Review",
      description: "Review all information",
      icon: <Check className="h-4 w-4" />,
    },
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      passwordHash: "",
      roleName: "SimpleUser",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const nextStep = () => {
    const fieldsToValidate =
      currentStep === 0
        ? ["email", "username"]
        : currentStep === 1
        ? ["firstName", "lastName"]
        : currentStep === 2
        ? ["passwordHash", "roleName"]
        : [];

    if (fieldsToValidate.length > 0) {
      form.trigger(fieldsToValidate as any).then((isValid) => {
        if (isValid) {
          setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
        }
      });
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const userData: CreateUserRequest = {
        email: values.email,
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        passwordHash: values.passwordHash,
        roleName: values.roleName,
      };

      await adminService.createUser(userData);
      toast.success("User created successfully");
      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    const password = form.watch("passwordHash");
    if (!password) return { strength: 0, text: "", color: "bg-gray-200" };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthText = [
      "Very Weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Very Strong",
    ][strength];
    const colors = [
      "bg-red-500",
      "bg-red-400",
      "bg-yellow-400",
      "bg-yellow-300",
      "bg-green-400",
      "bg-green-500",
    ];

    return {
      strength: (strength / 5) * 100,
      text: strengthText,
      color: colors[strength],
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl p-0 overflow-hidden sm:max-w-[550px] max-h-[90vh] flex flex-col">
        <DialogHeader className="p-6 border-b border-blue-900/30 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-blue-100">
              Create User
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300">
            Create a new user with specific role and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="mb-6">
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
                      <Check className="h-5 w-5" />
                    ) : (
                      steps[idx].icon
                    )}
                  </div>
                  <div className="text-xs text-center hidden md:block">
                    {step.title}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-blue-900/30 rounded-full overflow-hidden">
              <MotionDiv
                className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(currentStep / (steps.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-center mt-2 text-sm text-blue-200">
              {steps[currentStep].description}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 overflow-y-auto max-h-[40vh] custom-scrollbar pr-1"
            >
              <MotionDiv
                key={`step-${currentStep}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {currentStep === 0 && (
                  <div className="space-y-4 bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                              <Input
                                placeholder="user@example.com"
                                {...field}
                                className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">
                            Username
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                              <Input
                                placeholder="username"
                                {...field}
                                className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                              />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-4 bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              {...field}
                              className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              {...field}
                              className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                    <FormField
                      control={form.control}
                      name="passwordHash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-200">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="pr-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                              />
                              <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300" />
                          <div className="mt-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-blue-300">
                                Password Strength:
                              </span>
                              <span className="text-xs text-blue-300">
                                {passwordStrength.text}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-blue-900/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                style={{
                                  width: `${passwordStrength.strength}%`,
                                }}
                              ></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div className="flex items-center gap-1.5 text-xs text-blue-300">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    /[A-Z]/.test(field.value)
                                      ? "bg-green-500"
                                      : "bg-blue-900/50"
                                  }`}
                                ></div>
                                <span>Uppercase letter</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-blue-300">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    /[a-z]/.test(field.value)
                                      ? "bg-green-500"
                                      : "bg-blue-900/50"
                                  }`}
                                ></div>
                                <span>Lowercase letter</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-blue-300">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    /[0-9]/.test(field.value)
                                      ? "bg-green-500"
                                      : "bg-blue-900/50"
                                  }`}
                                ></div>
                                <span>Number</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-blue-300">
                                <div
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    /[^A-Za-z0-9]/.test(field.value)
                                      ? "bg-green-500"
                                      : "bg-blue-900/50"
                                  }`}
                                ></div>
                                <span>Special character</span>
                              </div>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="roleName"
                      render={({ field }) => (
                        <FormItem className="z-50">
                          <FormLabel className="text-blue-200">
                            User Role
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500/50 relative z-50">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              position="popper"
                              className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-blue-100 rounded-lg shadow-lg z-[9999]"
                              sideOffset={5}
                            >
                              <SelectItem
                                value="Admin"
                                className="text-red-300 hover:bg-blue-900/30 focus:bg-blue-900/30 rounded-md"
                              >
                                Admin
                              </SelectItem>
                              <SelectItem
                                value="FullUser"
                                className="text-emerald-300 hover:bg-blue-900/30 focus:bg-blue-900/30 rounded-md"
                              >
                                Full User
                              </SelectItem>
                              <SelectItem
                                value="SimpleUser"
                                className="text-blue-300 hover:bg-blue-900/30 focus:bg-blue-900/30 rounded-md"
                              >
                                Simple User
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-300" />
                          <FormDescription className="text-xs text-blue-400 mt-2">
                            {field.value === "Admin" &&
                              "Administrators have full access to all features and settings."}
                            {field.value === "FullUser" &&
                              "Full users can create, edit, and manage documents."}
                            {field.value === "SimpleUser" &&
                              "Simple users can only view and interact with assigned documents."}
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                    <h3 className="text-blue-100 font-medium mb-2">
                      Review User Information
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <div className="text-xs text-blue-400">Email</div>
                        <div className="text-blue-100">
                          {form.getValues("email")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-400">Username</div>
                        <div className="text-blue-100">
                          {form.getValues("username")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-400">First Name</div>
                        <div className="text-blue-100">
                          {form.getValues("firstName")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-400">Last Name</div>
                        <div className="text-blue-100">
                          {form.getValues("lastName")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-400">Role</div>
                        <div
                          className={`
                          ${
                            form.getValues("roleName") === "Admin"
                              ? "text-red-300"
                              : form.getValues("roleName") === "FullUser"
                              ? "text-emerald-300"
                              : "text-blue-300"
                          }
                        `}
                        >
                          {form.getValues("roleName")}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-blue-400">Password</div>
                        <div className="text-blue-100">••••••••</div>
                      </div>
                    </div>
                  </div>
                )}
              </MotionDiv>

              <div className="flex justify-between pt-4 mt-4 border-t border-blue-900/30 sticky bottom-0 bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95">
                {currentStep > 0 ? (
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    variant="outline"
                    className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting ? "Creating..." : "Create User"}
                    <UserPlus className="h-4 w-4" />
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
