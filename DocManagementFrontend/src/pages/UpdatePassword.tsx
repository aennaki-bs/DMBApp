import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Check } from 'lucide-react';
import DocuVerseLogo from '@/components/DocuVerseLogo';
import { toast } from 'sonner';
import authService from '@/services/authService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const UpdatePassword = () => {
  const { email } = useParams<{ email: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error('Email address is missing. Please start the password reset process again.');
      // Don't automatically redirect, just show an error
      setErrors({ general: 'Email address is missing. Please start the password reset process again.' });
    }
  }, [email]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    
    if (!password) {
      newErrors.password = 'Please enter your new password';
    } else if (password.length < 8) {
      newErrors.password = 'Your password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      newErrors.password = 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&)';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'The passwords do not match. Please enter the same password in both fields.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !email) return;
    
    try {
      setIsLoading(true);
      setErrors({});
      
      await authService.updatePassword(email, password);
      setIsSuccess(true);
      toast.success('Your password has been successfully updated.');
      
    } catch (err: any) {
      console.error('Update password error:', err);
      
      // Handle specific error cases with user-friendly messages
      if (err.response) {
        const status = err.response.status;
        const errorMessage = err.response.data;
        
        if (status === 404) {
          setErrors({ general: 'No account exists with this email address. Please check your email or contact support.' });
        } else if (status === 401) {
          if (errorMessage.includes('Not Verified')) {
            setErrors({ general: 'This email address has not been verified. Please verify your email before resetting your password.' });
          } else if (errorMessage.includes('Desactivated')) {
            setErrors({ general: 'Your account has been deactivated. Please contact support for assistance.' });
          } else {
            setErrors({ general: errorMessage || 'Authorization failed. Please try the password reset process again.' });
          }
        } else if (status === 400) {
          setErrors({ general: 'The password you provided does not meet security requirements. Please try a stronger password.' });
        } else {
          setErrors({ general: errorMessage || 'An unexpected error occurred. Please try again later.' });
        }
      } else if (err.request) {
        setErrors({ general: 'Unable to reach the server. Please check your internet connection and try again.' });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again later.' });
      }
      
      toast.error(errors.general || 'Failed to update your password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container animate-fade-in">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <DocuVerseLogo className="mx-auto h-14 w-auto" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Password Updated
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Your password has been successfully changed
            </p>
          </div>
          
          <Card className="border-none shadow-xl animate-slide-up">
            <CardHeader className="space-y-1">
              <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mt-4">Success!</h3>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your password has been successfully updated. 
                  You can now log in to your account with your new password.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Link to="/login" className="w-full">
                <Button className="w-full bg-docuBlue hover:bg-docuBlue-700">
                  Go to Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <DocuVerseLogo className="mx-auto h-14 w-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new password for your account
          </p>
        </div>
        
        <Card className="border-none shadow-xl animate-slide-up">
          <CardHeader className="space-y-1 pb-2">
            <h3 className="text-xl font-semibold">New Password</h3>
          </CardHeader>
          
          <CardContent>
            {errors.general && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
              
              <Button
                type="submit"
                className="w-full bg-docuBlue hover:bg-docuBlue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UpdatePassword;
