
import { useState } from 'react';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import adminService, { CreateUserRequest } from '@/services/adminService';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters.' })
  .refine(value => /[A-Z]/.test(value), {
    message: 'Password must contain at least one uppercase letter.',
  })
  .refine(value => /[a-z]/.test(value), {
    message: 'Password must contain at least one lowercase letter.',
  })
  .refine(value => /[0-9]/.test(value), {
    message: 'Password must contain at least one number.',
  })
  .refine(value => /[^A-Za-z0-9]/.test(value), {
    message: 'Password must contain at least one special character.',
  });

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters.',
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters.',
  }),
  passwordHash: passwordSchema,
  roleName: z.enum(['Admin', 'FullUser', 'SimpleUser'], {
    required_error: 'Please select a user role.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { title: "Basic Information", description: "Enter user account details" },
    { title: "Personal Information", description: "Enter first and last name" },
    { title: "Security", description: "Set password and role" },
    { title: "Review", description: "Review all information" }
  ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      firstName: '',
      lastName: '',
      passwordHash: '',
      roleName: 'SimpleUser',
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const nextStep = () => {
    const fieldsToValidate = currentStep === 0 
      ? ['email', 'username'] 
      : currentStep === 1 
        ? ['firstName', 'lastName'] 
        : currentStep === 2 
          ? ['passwordHash', 'roleName'] 
          : [];
          
    if (fieldsToValidate.length > 0) {
      form.trigger(fieldsToValidate as any).then((isValid) => {
        if (isValid) {
          setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        }
      });
    } else {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
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
      toast.success('User created successfully');
      form.reset();
      setCurrentStep(0);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    const password = form.watch('passwordHash');
    if (!password) return { strength: 0, text: '', color: 'bg-gray-200' };
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
    const colors = [
      'bg-red-500',
      'bg-red-400',
      'bg-yellow-400',
      'bg-yellow-300',
      'bg-green-400',
      'bg-green-500'
    ];
    
    return { 
      strength: (strength / 5) * 100, 
      text: strengthText, 
      color: colors[strength] 
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto bg-[#0a1033] border-blue-900/30 text-white backdrop-blur-md">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl text-white">Create User</DialogTitle>
          <DialogDescription className="text-blue-300">
            Create a new user with specific role and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col items-center ${idx <= currentStep ? 'text-blue-400' : 'text-gray-500'}`}
                style={{ width: `${100 / steps.length}%` }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                  ${idx < currentStep ? 'bg-blue-600 text-white' : idx === currentStep ? 'bg-blue-500 text-white' : 'bg-gray-700'}`}
                >
                  {idx < currentStep ? <Check size={16} /> : idx + 1}
                </div>
                <div className="text-xs text-center hidden md:block">{step.title}</div>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-700 rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm text-blue-200">
            {steps[currentStep].description}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {currentStep === 0 && (
              <div className="space-y-4 animate-fade-in">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="user@example.com" 
                          {...field} 
                          className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="username" 
                          {...field} 
                          className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">First Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="First Name" 
                            {...field} 
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Last Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Last Name" 
                            {...field} 
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <FormField
                  control={form.control}
                  name="passwordHash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="********" 
                            {...field} 
                            className="bg-[#111633] border-blue-900/50 text-white pr-10 placeholder:text-blue-300/50"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-3 text-blue-300 hover:text-blue-100"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="mt-2">
                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${passwordStrength.color} transition-all`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span className="text-blue-300">Password Strength:</span>
                          <span className={passwordStrength.strength >= 80 ? 'text-green-400' : passwordStrength.strength >= 60 ? 'text-yellow-300' : 'text-red-400'}>
                            {passwordStrength.text}
                          </span>
                        </div>
                      </div>
                      <FormDescription className="text-blue-300/80 text-xs">
                        Must include uppercase, lowercase, number, and special character.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#0a1033] border-blue-900/50 text-white">
                          <SelectItem value="Admin" className="hover:bg-blue-900/30">Admin</SelectItem>
                          <SelectItem value="FullUser" className="hover:bg-blue-900/30">Full User</SelectItem>
                          <SelectItem value="SimpleUser" className="hover:bg-blue-900/30">Simple User</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in pb-4">
                <h3 className="text-lg font-medium text-white">User Information Summary</h3>
                
                <div className="bg-[#111633] rounded-md p-4 border border-blue-900/30">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-blue-300">Email</p>
                      <p className="font-medium text-white break-all">{form.getValues('email')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-300">Username</p>
                      <p className="font-medium text-white">{form.getValues('username')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-blue-300">First Name</p>
                        <p className="font-medium text-white">{form.getValues('firstName')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-blue-300">Last Name</p>
                        <p className="font-medium text-white">{form.getValues('lastName')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-blue-300">Password</p>
                        <p className="font-medium text-white">••••••••</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-blue-300">Role</p>
                        <p className="font-medium text-white">{form.getValues('roleName')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 mt-6">
              {currentStep > 0 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep} 
                  className="border-blue-900/30 text-blue-300 hover:bg-blue-900/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button 
                  type="button" 
                  onClick={nextStep} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  type="button"
                  onClick={form.handleSubmit(onSubmit)} 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? 'Creating...' : 'Create User'} 
                  {!isSubmitting && <Check className="h-4 w-4 ml-2" />}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
