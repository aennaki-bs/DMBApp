import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import adminService, {
  UserDto,
  UpdateUserRequest,
} from "@/services/adminService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { UserCog, Save, Key, User, Shield } from "lucide-react";

const formSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  roleName: z.enum(["Admin", "FullUser", "SimpleUser"], {
    required_error: "Please select a role",
  }),
  isActive: z.boolean(),
  isEmailConfirmed: z.boolean(),
  passwordHash: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserDialogProps {
  user: UserDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MotionDialogContent = motion(DialogContent);

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get the role name as a string
  const getRoleString = (
    role: string | { roleId?: number; roleName?: string }
  ): string => {
    if (typeof role === "string") {
      return role;
    }

    if (role && typeof role === "object" && "roleName" in role) {
      return role.roleName || "Unknown";
    }

    return "Unknown";
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      roleName: getRoleString(user.role) as "Admin" | "FullUser" | "SimpleUser",
      isActive: user.isActive,
      isEmailConfirmed: user.isEmailConfirmed,
      passwordHash: "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: UpdateUserRequest) =>
      adminService.updateUser(user.id, userData),
    onSuccess: () => {
      toast.success("User updated successfully");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data || "Failed to update user");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);

    // Only include fields that have changed or have values
    const updateData: UpdateUserRequest = {};

    if (data.username !== user.username) {
      updateData.username = data.username;
    }

    if (data.firstName !== user.firstName) {
      updateData.firstName = data.firstName;
    }

    if (data.lastName !== user.lastName) {
      updateData.lastName = data.lastName;
    }

    const currentRole = getRoleString(user.role);
    if (data.roleName !== currentRole) {
      updateData.roleName = data.roleName;
    }

    if (data.isActive !== user.isActive) {
      updateData.isActive = data.isActive;
    }

    if (data.isEmailConfirmed !== user.isEmailConfirmed) {
      updateData.isEmailConfirmed = data.isEmailConfirmed;
    }

    // Only include password if it's provided and not empty
    if (data.passwordHash && data.passwordHash.trim() !== "") {
      updateData.passwordHash = data.passwordHash;
    }

    // If no changes were made, inform the user
    if (Object.keys(updateData).length === 0) {
      toast.info("No changes were made");
      setIsSubmitting(false);
      onOpenChange(false);
      return;
    }

    updateUserMutation.mutate(updateData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MotionDialogContent
        className="sm:max-w-[550px] p-0 overflow-hidden bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <DialogHeader className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <UserCog className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-blue-100">
              Edit User
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300">
            Update user information for {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-5">
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                  <h3 className="text-blue-100 font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
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
                              {...field}
                              className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                            />
                          </FormControl>
                          <FormMessage className="text-red-300" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                  <h3 className="text-blue-100 font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    Account Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                  <h3 className="text-blue-100 font-medium mb-3 flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-400" />
                    Security
                  </h3>
                  <FormField
                    control={form.control}
                    name="passwordHash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">
                          New Password (leave blank to keep current)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                          />
                        </FormControl>
                        <FormMessage className="text-red-300" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                  <h3 className="text-blue-100 font-medium mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    Role & Permissions
                  </h3>
                  <FormField
                    control={form.control}
                    name="roleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500/50">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-blue-100 rounded-lg shadow-lg">
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
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-900/30 p-3 bg-[#111633]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-blue-200">
                              Active Status
                            </FormLabel>
                            <FormDescription className="text-xs text-blue-400">
                              User can access the system
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className={
                                field.value
                                  ? "bg-emerald-600 data-[state=checked]:bg-emerald-600"
                                  : "bg-red-600 data-[state=unchecked]:bg-red-600"
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isEmailConfirmed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-blue-900/30 p-3 bg-[#111633]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-blue-200">
                              Email Confirmed
                            </FormLabel>
                            <FormDescription className="text-xs text-blue-400">
                              Email verification status
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className={
                                field.value
                                  ? "bg-emerald-600 data-[state=checked]:bg-emerald-600"
                                  : "bg-red-600 data-[state=unchecked]:bg-red-600"
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                  className="bg-transparent border-blue-500/30 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200 hover:border-blue-400/40 transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400/70 transition-all duration-200 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </MotionDialogContent>
    </Dialog>
  );
}
