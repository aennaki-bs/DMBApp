import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  WifiOff,
  ShieldAlert,
  LogIn,
} from "lucide-react";
import DocuVerseLogo from "@/components/DocuVerseLogo";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkApiConnection } from "@/services/api/connectionCheck";
import ConnectionErrorFallback from "@/components/shared/ConnectionErrorFallback";
import { useApiConnection } from "@/hooks/useApiConnection";
import { EnhancedButton } from "@/components/ui/enhanced-button";

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState<{
    emailOrUsername: boolean;
    password: boolean;
  }>({
    emailOrUsername: false,
    password: false,
  });

  // Use the custom hook instead of manual checks
  const { isAvailable, isChecking, checkConnection } = useApiConnection();

  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: { emailOrUsername?: string; password?: string } = {};

    if (!emailOrUsername) {
      newErrors.emailOrUsername = "Login is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setIsTouched({ emailOrUsername: true, password: true });

    // Clear any previous API errors
    setApiError(null);

    if (!validateForm()) return;

    // Check connection before attempting login
    if (isAvailable === false) {
      setApiError(
        "Cannot connect to server. Please check your connection and try again."
      );
      return;
    }

    try {
      const success = await login({
        emailOrUsername,
        password,
      });

      if (success) {
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error handled in component:", error);

      // Handle different error types
      if (error.code === "ERR_NETWORK") {
        setApiError(
          "Connection error. Please check your internet connection and try again."
        );
      } else if (
        error.message?.includes("SSL") ||
        error.code === "ERR_SSL_PROTOCOL_ERROR"
      ) {
        // SSL-specific error message
        setApiError(
          "SSL connection error. Contact your administrator to configure correct API settings."
        );
      } else {
        // Extract the specific error message from the API response
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data ||
          error.message ||
          "Invalid password or username";

        setApiError(errorMessage);
      }
    }
  };

  const handleInputChange = (
    field: "emailOrUsername" | "password",
    value: string
  ) => {
    if (field === "emailOrUsername") {
      setEmailOrUsername(value);
    } else {
      setPassword(value);
    }

    // Mark the field as touched
    setIsTouched((prev) => ({ ...prev, [field]: true }));

    // Clear API error when user types
    setApiError(null);

    // Clear field error if there's a value
    if (value) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0d1117]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <DocuVerseLogo className="mx-auto h-14 w-auto" />
            <h2 className="mt-6 text-3xl font-bold text-white">DocuVerse</h2>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to your account
            </p>
          </div>

          <div className="bg-[#161b22] rounded-lg border border-gray-800 p-6 shadow-xl">
            {apiError && (
              <Alert
                variant="destructive"
                className="mb-4 bg-red-900/30 border-red-800 text-red-200"
              >
                <AlertDescription className="flex items-center gap-2">
                  {apiError.includes("SSL") && <ShieldAlert size={16} />}
                  {apiError}
                </AlertDescription>
              </Alert>
            )}

            {isAvailable === false && (
              <div className="mb-4">
                <ConnectionErrorFallback
                  message="Cannot connect to the server. Please check your network connection."
                  onRetry={checkConnection}
                  errorType="network"
                />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="emailOrUsername"
                  className="block text-sm font-medium text-gray-300"
                >
                  Login
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="Email or username"
                    className="pl-10 border-gray-700 bg-[#0d1117] text-gray-300 group-hover:border-gray-600 transition-colors"
                    value={emailOrUsername}
                    error={
                      isTouched.emailOrUsername &&
                      Boolean(errors.emailOrUsername)
                    }
                    onChange={(e) =>
                      handleInputChange("emailOrUsername", e.target.value)
                    }
                  />
                </div>
                {isTouched.emailOrUsername && errors.emailOrUsername && (
                  <p className="text-sm text-red-500">
                    {errors.emailOrUsername}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Account Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-blue-400 hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 border-gray-700 bg-[#0d1117] text-gray-300 group-hover:border-gray-600 transition-colors"
                    value={password}
                    error={isTouched.password && Boolean(errors.password)}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {isTouched.password && errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <EnhancedButton
                type="submit"
                variant="premium"
                size="lg"
                fullWidth={true}
                isLoading={isLoading || isChecking}
                loadingText="Signing in..."
                leadingIcon={<LogIn className="h-4 w-4" />}
                animation="shimmer"
                rounded="lg"
                disabled={isLoading || isChecking}
                className="mt-2"
              >
                Sign in
              </EnhancedButton>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <Link to="/register">
                <EnhancedButton
                  variant="ghost"
                  size="sm"
                  animation="none"
                  className="ml-1 text-blue-400 hover:text-blue-300"
                >
                  Sign up
                </EnhancedButton>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image background */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-blue-900 to-indigo-900 relative">
        <div className="absolute inset-0 bg-black/30"></div>
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2574&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="bg-black/30 backdrop-blur-sm p-8 rounded-xl border border-white/10 max-w-lg">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome to DocuVerse
            </h2>
            <p className="text-gray-100 mb-6">
              Manage and organize your documents securely with our cutting-edge
              document management system. Enjoy fast access, smart document
              organization, and powerful collaboration features.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-200">Secure platform</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-200">Real-time updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
