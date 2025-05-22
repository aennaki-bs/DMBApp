import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, User, WifiOff, ShieldAlert } from "lucide-react";
import DocuVerseLogo from "@/components/DocuVerseLogo";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { checkApiConnection } from "@/services/api/connectionCheck";
import ConnectionErrorFallback from "@/components/shared/ConnectionErrorFallback";
import { useApiConnection } from "@/hooks/useApiConnection";

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
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="Email or username"
                    className="pl-10 border-gray-700 bg-[#0d1117] text-gray-300"
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
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 border-gray-700 bg-[#0d1117] text-gray-300"
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

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white relative overflow-hidden group"
                disabled={isLoading || !isAvailable}
              >
                <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></span>
                <span className="relative z-10">
                  {isLoading ? "Signing in..." : "Sign In"}
                </span>
              </Button>

              <div className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-blue-400 hover:text-blue-300"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image and text */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-r from-[#0d1117] to-[#161b22] relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232d3748' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E')",
          }}
        ></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
          <div className="text-center max-w-lg">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to Business Management Platform
            </h1>
            <p className="text-lg text-gray-300">
              Streamline your business operations with our comprehensive
              management solution
            </p>

            <div className="mt-12 space-y-6">
              <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
                <div className="bg-blue-500/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-medium">
                    Secure Authentication
                  </h3>
                  <p className="text-sm text-gray-400">
                    Enterprise-grade security for your data
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-[#1c2128]/50 p-3 rounded-lg border border-blue-900/30">
                <div className="bg-purple-500/20 p-2 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-white font-medium">Powerful Dashboard</h3>
                  <p className="text-sm text-gray-400">
                    Manage documents and workflows efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
