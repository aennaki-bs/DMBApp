import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import adminService, { UserDto } from "@/services/adminService";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Save } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type FormValues = z.infer<typeof formSchema>;

interface EditUserEmailDialogProps {
  user: UserDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const MotionDialogContent = motion(DialogContent);

export function EditUserEmailDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserEmailDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email,
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: (email: string) => adminService.updateUserEmail(user.id, email),
    onSuccess: () => {
      toast.success(
        "Email updated successfully. Verification email has been sent."
      );
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data || "Failed to update email");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    if (data.email === user.email) {
      toast.info("The email address is the same as the current one");
      return;
    }

    setIsSubmitting(true);
    updateEmailMutation.mutate(data.email);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <MotionDialogContent
        className="sm:max-w-[450px] p-0 overflow-hidden bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <DialogHeader className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-full bg-blue-500/10 text-blue-400">
              <Mail className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl text-blue-100">
              Update Email Address
            </DialogTitle>
          </div>
          <DialogDescription className="text-blue-300">
            Change the email address for{" "}
            <span className="text-blue-200 font-medium">
              {user.firstName} {user.lastName}
            </span>
            . This will require email verification before the account can be
            used.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-200">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative w-full">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                          <Input
                            type="email"
                            placeholder="new.email@example.com"
                            className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-300/50 focus:border-blue-500/50"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-300" />
                    </FormItem>
                  )}
                />
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
                  {isSubmitting ? "Updating..." : "Update Email"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </MotionDialogContent>
    </Dialog>
  );
}
