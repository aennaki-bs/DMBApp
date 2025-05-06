import { useState } from "react";
import { Lock, Save, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserInfo, UpdateProfileRequest } from "@/services/authService";
import authService from "@/services/authService";
import { toast } from "sonner";

interface PasswordFormProps {
  user: UserInfo;
  refreshUserInfo: () => Promise<void>;
}

export function PasswordForm({ user, refreshUserInfo }: PasswordFormProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setApiError(null);
  };

  const handleUpdatePassword = async () => {
    try {
      setApiError(null);

      // Verify confirmation matches
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setApiError("Passwords do not match");
        return;
      }

      // Create the update request
      const requestWithPassword: UpdateProfileRequest = {
        username: user.username,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      await authService.updateProfile(requestWithPassword);

      // Refresh user info to get the updated data
      await refreshUserInfo();

      toast.success("Password updated successfully");
      setIsChangingPassword(false);

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data || error.message || "Failed to update password";
      setApiError(errorMessage);
    }
  };

  return (
    <Card className="shadow-xl border-white/10 bg-gradient-to-br from-gray-900/80 to-blue-900/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-gradient-to-r from-blue-800/30 to-purple-800/20">
        <CardTitle className="text-white/90 flex items-center">
          <Lock className="h-5 w-5 mr-2 text-blue-300" />
          Change Password
        </CardTitle>
        <Button
          variant={isChangingPassword ? "destructive" : "outline"}
          size="sm"
          onClick={() => setIsChangingPassword(!isChangingPassword)}
          className={
            isChangingPassword
              ? "bg-red-500/90 hover:bg-red-600/90 text-white"
              : "border-blue-400/30 text-blue-300 hover:text-white hover:bg-blue-700/50"
          }
        >
          {isChangingPassword ? (
            <>
              <X className="mr-2 h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" /> Change Password
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {apiError && (
          <Alert
            variant="destructive"
            className="mb-6 bg-red-500/20 text-red-200 border-red-500/50"
          >
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        {isChangingPassword ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="flex items-center gap-2 text-blue-200"
              >
                <Lock className="h-4 w-4 text-blue-300" /> Current Password
              </Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="flex items-center gap-2 text-blue-200"
              >
                <Lock className="h-4 w-4 text-blue-300" /> New Password
              </Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="flex items-center gap-2 text-blue-200"
              >
                <Lock className="h-4 w-4 text-blue-300" /> Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="bg-blue-950/40 border-blue-400/20 text-white placeholder:text-blue-400/50 focus:border-blue-400"
              />
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-200">
                Password must be at least 8 characters long and include
                uppercase letters, lowercase letters, numbers, and special
                characters.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Lock className="h-12 w-12 text-blue-300/50 mx-auto mb-4" />
              <p className="text-blue-200">
                To change your password, click the "Change Password" button.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {isChangingPassword && (
        <CardFooter className="flex justify-end border-t border-white/5 bg-gradient-to-r from-blue-800/20 to-purple-800/10 py-4">
          <Button
            onClick={handleUpdatePassword}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto"
          >
            <Save className="mr-2 h-4 w-4" /> Update Password
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
